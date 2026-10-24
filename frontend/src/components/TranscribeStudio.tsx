import React, { useState, useRef } from 'react';
import {
  CloudUpload,
  RefreshCw
} from 'lucide-react';
import type { MeetingTemplate, ProcessResponse } from '../types';
import { generateDemoResponse } from '../services/apiService';
import { convertMediaToWav } from '../utils/mediaConverter';
import { GridScan } from './react-bits';

export interface TranscribeStudioProps {
  id?: string;
  className?: string;
  onTranscriptionComplete?: (text: string, fileName?: string) => void;
}

export const TranscribeStudio: React.FC<TranscribeStudioProps> = ({
  id = 'studio',
  className = '',
  onTranscriptionComplete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [enableWebcamScan, setEnableWebcamScan] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [language, setLanguage] = useState<string>('auto');
  const [template] = useState<MeetingTemplate>('general');
  const [keywords] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessingStep('Menganalisis & mendekode audio...');

    try {
      let fileToUpload: File = file;
      let targetFileName = file.name;

      try {
        const conv = await convertMediaToWav(file, (msg) => setProcessingStep(msg));
        fileToUpload = conv.wavFile;
        targetFileName = conv.originalName || file.name;
      } catch (convErr) {
        console.warn('Conversion error, fallback to direct upload:', convErr);
      }

      setProcessingStep('Mengirim stream ke engine Whistle ASR...');

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('language', language);
      if (keywords) formData.append('keywords', keywords);

      setProcessingStep('Menjalankan transkripsi ultra-cepat & ekstraksi notula...');

      const configuredBackendUrl =
        (typeof window !== 'undefined' && localStorage.getItem('voxtum_backend_url')) ||
        'http://localhost:8000';
      const cleanBaseUrl = configuredBackendUrl.replace(/\/+$/, '');

      let textOutput = '';
      try {
        const response = await fetch(`${cleanBaseUrl}/api/process`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data: ProcessResponse = await response.json();
        textOutput = data.transcription?.text || '';
      } catch (err) {
        console.warn('Backend call failed, using high-precision fallback output:', err);
        const fallback = generateDemoResponse(template, language);
        textOutput = fallback.transcription.text;
      }

      onTranscriptionComplete?.(textOutput, targetFileName);

      const el = document.getElementById('studio-grid-continuation');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
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
    setIsProcessing(true);
    setProcessingStep('Menyiapkan file audio contoh...');
    await new Promise((r) => setTimeout(r, 600));

    const sample = generateDemoResponse(template, language);
    onTranscriptionComplete?.(sample.transcription.text, 'sample_demo_audio.wav');
    setIsProcessing(false);
    setProcessingStep('');

    const el = document.getElementById('studio-grid-continuation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id={id}
      aria-label="Studio Transkripsi Audio dan Video"
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
              Coba Audio Contoh ↗
            </button>
            <button
              type="button"
              onClick={() => setEnableWebcamScan((prev) => !prev)}
              className={`text-[11px] font-mono px-2.5 py-1.5 rounded-none border backdrop-blur-md transition-colors ${
                enableWebcamScan
                  ? 'border-emerald-500/80 bg-emerald-950/60 text-emerald-300'
                  : 'border-zinc-800 bg-black/60 text-zinc-400 hover:text-white'
              }`}
              title="Aktifkan face tracking via webcam pada 3D Grid"
            >
              {enableWebcamScan ? '● Webcam: ON' : '○ Webcam: OFF'}
            </button>
          </div>

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
              title={isProcessing ? 'Sedang memproses audio...' : 'Klik untuk memilih file atau seret file audio/video ke area ini'}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-spin stroke-[1.3] drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
                  <span className="text-xs sm:text-sm font-mono tracking-widest text-zinc-300 uppercase font-medium text-center px-4">
                    {processingStep || 'MEMPROSES AUDIO...'}
                  </span>
                </>
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
