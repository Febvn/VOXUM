import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for browser environment
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber: any = null;

async function getTranscriber(progressCallback: (data: any) => void) {
  if (transcriber) return transcriber;

  // Check if WebGPU is available in worker context
  const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;
  const device = hasWebGPU ? 'webgpu' : 'wasm';

  try {
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'onnx-community/whisper-tiny',
      {
        device,
        progress_callback: progressCallback,
        dtype: device === 'webgpu' ? 'fp32' : 'q8'
      }
    );
  } catch (err) {
    console.warn('WebGPU pipeline failed, falling back to WASM:', err);
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'onnx-community/whisper-tiny',
      {
        device: 'wasm',
        progress_callback: progressCallback,
        dtype: 'q8'
      }
    );
  }

  return transcriber;
}

self.addEventListener('message', async (event: MessageEvent) => {
  const { type, data } = event.data;

  if (type === 'transcribe') {
    const { audioData, language } = data;

    try {
      self.postMessage({
        type: 'status',
        status: 'Memuat model Whistle In-Browser (~39 MB)...'
      });

      const asr = await getTranscriber((progressData: any) => {
        if (progressData.status === 'progress') {
          self.postMessage({
            type: 'download_progress',
            file: progressData.file,
            loaded: progressData.loaded,
            total: progressData.total,
            progress: Math.round((progressData.loaded / (progressData.total || 1)) * 100)
          });
        }
      });

      self.postMessage({
        type: 'status',
        status: 'Mentranskripsi di GPU/CPU laptop Anda...'
      });

      const options: any = {
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true
      };

      if (language && language !== 'auto' && language !== 'multi') {
        options.language = language;
      }

      const output = await asr(audioData, options);

      self.postMessage({
        type: 'complete',
        result: output
      });
    } catch (err: any) {
      console.error('Worker transcription error:', err);
      self.postMessage({
        type: 'error',
        error: err.message || String(err)
      });
    }
  }
});
