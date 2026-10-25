/**
 * Client-side audio/video converter using Web Audio API.
 * Extracts audio tracks from MP4, WEBM, MOV video files or decodes MP3/M4A/WAV,
 * converting them into clean 16kHz 16-bit Mono PCM WAV files for Whistle ASR / Gemini.
 */

export interface ConversionResult {
  wavBlob: Blob;
  wavFile: File;
  durationSeconds: number;
  originalName: string;
  originalSize: number;
  isVideo: boolean;
  sampleRate: number;
}

/**
 * Encodes Float32 mono audio buffer into 16-bit PCM WAV format.
 */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');

  // fmt subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for Linear PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // data subchunk
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit PCM samples with clipping protection
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Convert any media file (MP3, MP4, WAV, M4A, WEBM, MOV) to 16kHz Mono WAV
 */
export async function convertMediaToWav(
  file: File,
  onStatusUpdate?: (status: string) => void
): Promise<ConversionResult> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name);

  onStatusUpdate?.(isVideo ? 'Extracting audio from video file...' : 'Reading audio file data...');

  const arrayBuffer = await file.arrayBuffer();

  // Create AudioContext (using standard 16000Hz preferred for Whistle ASR)
  const targetSampleRate = 16000;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioContextClass();

  onStatusUpdate?.('Decoding audio stream...');
  let decodedBuffer: AudioBuffer;
  try {
    decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch (err) {
    audioContext.close();
    throw new Error(
      `Failed to decode media format: ${err instanceof Error ? err.message : String(err)}. Ensure the media file contains a valid audio track.`
    );
  }

  onStatusUpdate?.('Converting to 16kHz Mono PCM WAV...');

  // Mix down multiple channels to Mono
  const numChannels = decodedBuffer.numberOfChannels;
  const length = decodedBuffer.length;
  const monoSamples = new Float32Array(length);

  for (let c = 0; c < numChannels; c++) {
    const channelData = decodedBuffer.getChannelData(c);
    for (let i = 0; i < length; i++) {
      monoSamples[i] += channelData[i] / numChannels;
    }
  }

  // Resample to targetSampleRate (16000 Hz) if source sample rate differs
  let finalSamples = monoSamples;
  if (decodedBuffer.sampleRate !== targetSampleRate) {
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(decodedBuffer.duration * targetSampleRate), targetSampleRate);
    const bufferSource = offlineCtx.createBufferSource();
    bufferSource.buffer = decodedBuffer;
    bufferSource.connect(offlineCtx.destination);
    bufferSource.start();
    const resampledBuffer = await offlineCtx.startRendering();
    finalSamples = resampledBuffer.getChannelData(0);
  }

  audioContext.close();

  // Encode to WAV Blob
  const wavBlob = encodeWav(finalSamples, targetSampleRate);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const wavFile = new File([wavBlob], `${baseName}_converted.wav`, { type: 'audio/wav' });

  onStatusUpdate?.('Conversion completed successfully.');

  return {
    wavBlob,
    wavFile,
    durationSeconds: decodedBuffer.duration,
    originalName: file.name,
    originalSize: file.size,
    isVideo,
    sampleRate: targetSampleRate
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatTimeSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

