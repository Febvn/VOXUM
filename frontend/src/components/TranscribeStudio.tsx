import React, { useState, useRef } from 'react';
import {
  CloudUpload,
  RefreshCw,
  AlertCircle,
  Settings
} from 'lucide-react';
import type { MeetingTemplate, ProcessResponse, WordTimestamp } from '../types';
import { generateDemoResponse, processAudioWithGeminiDirect } from '../services/apiService';
import { convertMediaToWav } from '../utils/mediaConverter';
import { GridScan } from './react-bits';

export interface TranscribeStudioProps {
  id?: string;
  className?: string;
  apiKey?: string;
  backendUrl?: string;
  onOpenSettings?: () => void;
  onTranscriptionComplete?: (
    text: string,
    fileName?: string,
    words?: WordTimestamp[],
    segments?: { start: number; end: number; text: string }[]
  ) => void;
}

export const TranscribeStudio: React.FC<TranscribeStudioProps> = ({
  id = 'studio',
  className = '',
  apiKey,
  backendUrl,
  onOpenSettings,
  onTranscriptionComplete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [enableWebcamScan, setEnableWebcamScan] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [language, setLanguage] = useState<string>('auto');
  const [template] = useState<MeetingTemplate>('general');
  const [keywords] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setProgress(5);
    setStatusMessage('Memeriksa berkas media...');

    let progressInterval: any = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + 3;
        if (prev < 65) return prev + 2;
        if (prev < 90) return Number((prev + 0.4).toFixed(1));
        return prev;
      });
    }, 200);

    try {
      let fileToUpload: File = file;
      let targetFileName = file.name;

      try {
        const conv = await convertMediaToWav(file, (msg) => setStatusMessage(msg));
        fileToUpload = conv.wavFile;
        targetFileName = conv.originalName || file.name;
        setProgress((prev) => Math.max(prev, 25));
      } catch (convErr) {
        console.warn('Media conversion bypass/fallback:', convErr);
      }

      const activeApiKey = (apiKey || (typeof window !== 'undefined' && localStorage.getItem('voxtum_gemini_key')) || '').trim();
      const activeBackendUrl = (
        backendUrl ||
        (typeof window !== 'undefined' && localStorage.getItem('voxtum_backend_url')) ||
        (import.meta.env.VITE_BACKEND_URL as string) ||
        'http://localhost:8000'
      ).trim();

      let textOutput = '';
      let wordsOutput: WordTimestamp[] = [];
      let segmentsOutput: { start: number; end: number; text: string }[] = [];

      // 1. Prioritaskan Google Gemini API Direct jika API Key disetel
      if (activeApiKey) {
        setStatusMessage('Menghubungkan ke Google Gemini Multimodal Studio...');
        try {
          const directRes = await processAudioWithGeminiDirect(
            fileToUpload,
            activeApiKey,
            language,
            template,
            keywords,
            (msg) => setStatusMessage(msg)
          );
          textOutput = directRes.transcription?.text || '';
          wordsOutput = directRes.transcription?.words || [];
          segmentsOutput = directRes.transcription?.segments || [];
        } catch (geminiErr: any) {
          console.error('Gemini direct processing failed:', geminiErr);
          throw new Error(`Gemini API: ${geminiErr.message || String(geminiErr)}`);
        }
      } else {
        // 2. Fallback ke Local Whistle Backend
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const isLocalhostBackend = activeBackendUrl.startsWith('http://localhost') || activeBackendUrl.startsWith('http://127.0.0.1');

        if (isHttps && isLocalhostBackend) {
          throw new Error(
            'Website online (HTTPS) memblokir koneksi ke http://localhost (proteksi Mixed-Content browser). Silakan masukkan Google Gemini API Key Anda di Pengaturan untuk transkripsi langsung dari browser.'
          );
        }

        setStatusMessage('Mengirim ke Whistle ASR Engine...');
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('language', language);
        if (keywords) formData.append('keywords', keywords);

        const cleanBaseUrl = activeBackendUrl.replace(/\/+$/, '');
        const response = await fetch(`${cleanBaseUrl}/api/process`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Server ${response.status}: ${errText || 'Koneksi backend gagal'}`);
        }

        const data: ProcessResponse = await response.json();
        textOutput = data.transcription?.text || '';
        wordsOutput = data.transcription?.words || [];
        segmentsOutput = data.transcription?.segments || [];
      }

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage('Transkripsi berhasil diselesaikan.');
      await new Promise((r) => setTimeout(r, 200));

      onTranscriptionComplete?.(textOutput, targetFileName, wordsOutput, segmentsOutput);

      const el = document.getElementById('studio-grid-continuation');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(err.message || 'Gagal memproses file audio.');
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setProgress(0);
      setStatusMessage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const loadSampleDemo = async () => {
    if (isProcessing) return;
    try {
      const sampleUrl = language === 'id' ? '/samples/sample_bahasa_indonesia.mp3' : '/samples/sample_jfk.mp3';
      const sampleName = language === 'id' ? 'sample_bahasa_indonesia.mp3' : 'sample_jfk.mp3';
      const res = await fetch(sampleUrl);
      if (!res.ok) throw new Error('Failed to load sample file');
      const blob = await res.blob();
      const file = new File([blob], sampleName, { type: 'audio/mpeg' });
      await handleFileSelect(file);
    } catch {
      setIsProcessing(true);
      setProgress(10);
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 8 : prev));
      }, 70);
      await new Promise((r) => setTimeout(r, 600));
      clearInterval(interval);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 200));

      const sample = generateDemoResponse(template, language);
      onTranscriptionComplete?.(sample.transcription.text, 'sample_demo_audio.wav', sample.transcription.words);
      setIsProcessing(false);
      setProgress(0);

      const el = document.getElementById('studio-grid-continuation');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id={id}
      aria-label="Audio and Video Transcription Studio"
      className={`w-full bg-black text-white p-0 m-0 font-['Geist',system-ui,-apple-system,sans-serif] select-none ${className}`}
    >
      {/* KOTAK 1: GRIDSCAN INTERACTIVE MEDIA DROP ZONE & BROWSE (Mentok Full Width Edge-to-Edge) */}
      <div className="w-full rounded-none bg-black overflow-hidden relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/mp4,video/quicktime,video/webm,.mp3,.mp4,.wav,.m4a,.aac,.webm,.mov"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* 3D GridScan Interactive Viewport (height: 600px - 700px mentok) */}
        <div className="relative w-full h-[600px] sm:h-[700px] bg-black select-none overflow-hidden">
          {/* Background 3D GridScan WebGL Engine (Bloom & Laser ping-pong aktif saat media di-drop/diproses) */}
          <div className="absolute inset-0 w-full h-full">
            <GridScan
              enableHover={false}
              enableGyro={false}
              sensitivity={0.55}
              lineThickness={2}
              linesColor="#f9f6fe"
              gridScale={0.1}
              scanColor="#ffffff"
              scanOpacity={Boolean(isProcessing || isDragging) ? 0.55 : 0}
              enablePost
              bloomIntensity={Boolean(isProcessing || isDragging) ? 0.75 : 0}
              chromaticAberration={0}
              noiseIntensity={0}
              lineJitter={0.1}
              scanSoftness={0.7}
              scanOnClick
              enableWebcam={enableWebcamScan}
              showFloorFlags={true}
              floorFlagRow={4.0}
              selectedLanguage={language}
              onSelectLanguage={(langCode) => setLanguage(langCode)}
            />
          </div>

          {/* Top-Right Utility Overlay in GridScan Viewport */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5 pointer-events-auto">
            <button
              type="button"
              onClick={loadSampleDemo}
              disabled={isProcessing}
              className="text-[11px] font-mono px-3 py-1.5 rounded-none border border-zinc-800 bg-black/60 backdrop-blur-md text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Try Sample Audio ↗
            </button>
            <button
              type="button"
              onClick={() => setEnableWebcamScan((prev) => !prev)}
              className={`text-[11px] font-mono px-2.5 py-1.5 rounded-none border backdrop-blur-md transition-colors ${
                enableWebcamScan
                  ? 'border-white bg-white/20 text-white font-medium'
                  : 'border-zinc-800 bg-black/60 text-zinc-400 hover:text-white'
              }`}
              title="Toggle webcam face tracking on 3D grid"
            >
              {enableWebcamScan ? '● Webcam: ON' : '○ Webcam: OFF'}
            </button>
          </div>

          {/* Error Notice Banner inside GridScan Viewport */}
          {errorMessage && (
            <div className="absolute top-16 left-4 right-4 z-30 p-3 sm:p-4 bg-zinc-950/95 border border-amber-500/80 text-zinc-100 rounded-none shadow-2xl backdrop-blur-md font-mono text-xs max-w-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-auto">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">Notice</p>
                  <p className="text-zinc-200 mt-0.5 leading-relaxed text-[11px] sm:text-xs">{errorMessage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      onOpenSettings();
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold uppercase text-[10px] sm:text-[11px] rounded-none transition-colors flex items-center gap-1.5"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Buka Pengaturan</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="px-2 py-1.5 text-zinc-400 hover:text-white text-[10px] sm:text-[11px] uppercase transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* Area DROP & BROWSE (Kotak Invisible Sejajar Garis Grid Terowongan) */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isProcessing) setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                if (!isProcessing) handleDrop(e);
              }}
              onClick={() => {
                if (!isProcessing) fileInputRef.current?.click();
              }}
              className={`w-[54%] sm:w-[48%] lg:w-[44%] h-[50%] sm:h-[54%] min-w-[280px] min-h-[220px] max-w-[620px] max-h-[360px] bg-transparent border border-transparent rounded-none pointer-events-auto cursor-pointer flex flex-col items-center justify-center gap-2.5 transition-all duration-300 group select-none ${
                isDragging
                  ? 'border-white/50 bg-white/[0.02] shadow-[0_0_50px_rgba(255,255,255,0.2)]'
                  : ''
              } ${isProcessing ? 'cursor-wait' : ''}`}
              title={isProcessing ? 'Processing audio...' : 'Click to select file or drag audio/video here'}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center gap-2.5 px-4 text-center">
                  <RefreshCw className="w-10 h-10 sm:w-11 sm:h-11 text-white animate-spin stroke-[1.3] drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
                  <span className="text-sm sm:text-base font-mono tracking-wider text-white font-semibold tabular-nums">
                    {Math.min(100, Math.max(0, Math.round(progress)))}%
                  </span>
                  {statusMessage && (
                    <span className="text-[11px] sm:text-xs font-mono text-zinc-400 max-w-xs animate-pulse leading-snug">
                      {statusMessage}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <CloudUpload
                    className={`stroke-[1.3] transition-all duration-300 ${
                      isDragging
                        ? 'w-14 h-14 sm:w-16 sm:h-16 text-white scale-125 drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]'
                        : 'w-10 h-10 sm:w-12 sm:h-12 text-zinc-300 group-hover:text-white group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-mono tracking-widest text-zinc-400 group-hover:text-white transition-colors uppercase font-medium">
                    DROP or BROWSE
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TranscribeStudio;
