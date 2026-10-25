import React, { useState, useRef } from 'react';
import {
  Upload,
  Mic,
  Square,
  FileAudio,
  Tag,
  Globe,
  ArrowRight,
  Disc,
  Play,
  Briefcase,
  Zap,
  UserCheck,
  TrendingUp,
  GraduationCap,
  Volume2
} from 'lucide-react';
import type { MeetingTemplate } from '../types';
import { TEMPLATE_CONFIGS } from '../services/apiService';
import { SpotlightCard, Magnet, ShinyText, DecryptedText, StarBorder } from './react-bits';

interface AudioUploaderProps {
  onProcess: (
    file: File | null,
    language: string,
    keywords: string,
    template: MeetingTemplate,
    isDemo?: boolean
  ) => void;
  isProcessing: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ onProcess, isProcessing }) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'record'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [language, setLanguage] = useState<string>('auto');
  const [keywords, setKeywords] = useState<string>('');
  const [template, setTemplate] = useState<MeetingTemplate>('general');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const recordedFile = new File([audioBlob], `session_${Date.now()}.wav`, { type: 'audio/wav' });
        setSelectedFile(recordedFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Unable to access audio microphone. Please ensure your browser has microphone permissions enabled.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    onProcess(selectedFile, language, keywords, template);
  };

  const handleRunDemo = () => {
    onProcess(null, language, keywords, template, true);
  };

  const templateIcons = {
    general: Briefcase,
    agile: Zap,
    one_on_one: UserCheck,
    sales: TrendingUp,
    webinar: GraduationCap
  };

  return (
    <SpotlightCard
      spotlightColor="rgba(16, 185, 129, 0.12)"
      className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-7 shadow-2xl relative space-y-5 sm:space-y-6"
    >
      {/* Studio Channel Deck Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
        {/* Mode Switcher */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80 w-full sm:w-fit">
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeMode === 'upload'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="size-3.5" />
            <span>TRACK UPLOAD</span>
          </button>

          <button
            onClick={() => setActiveMode('record')}
            className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeMode === 'record'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="size-3.5" />
            <span>LIVE CAPTURE</span>
          </button>
        </div>

        {/* Load Reference Audio Sample */}
        <button
          onClick={handleRunDemo}
          disabled={isProcessing}
          className="text-xs font-mono text-slate-300 hover:text-emerald-400 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all w-full sm:w-fit"
        >
          <Play className="size-3 text-emerald-400 fill-current" />
          <span>LOAD BENCHMARK TRACK</span>
        </button>
      </div>

      {/* Preset Format Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Disc className="size-3.5 text-emerald-400" />
            <span>EXECUTIVE SYNTHESIS PRESET</span>
          </label>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            {TEMPLATE_CONFIGS[template].label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(Object.keys(TEMPLATE_CONFIGS) as MeetingTemplate[]).map((tKey) => {
            const Icon = templateIcons[tKey];
            const isSelected = template === tKey;
            return (
              <button
                key={tKey}
                onClick={() => setTemplate(tKey)}
                className={`w-full flex flex-col items-center text-center p-3 rounded-xl border font-mono transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`size-4 mb-1.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-[11px] font-semibold tracking-tight leading-tight">
                  {TEMPLATE_CONFIGS[tKey].label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio Ingestion Zone */}
      <div className="space-y-5">
        {activeMode === 'upload' ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 transition-all rounded-xl p-5 sm:p-8 text-center bg-slate-950/60 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
            onClick={() => document.getElementById('audio-file-input')?.click()}
          >
            <input
              id="audio-file-input"
              type="file"
              accept="audio/*,video/mp4,video/mkv,video/webm"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Audio Waveform simulation bars background */}
            <div className="flex items-center gap-1 mb-3 h-7 sm:h-8 opacity-40 group-hover:opacity-75 transition-opacity">
              {[12, 24, 18, 30, 14, 28, 20, 32, 16, 26, 12, 22].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-1 bg-emerald-500/60 rounded-full"
                />
              ))}
            </div>

            <div className="size-11 sm:size-12 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-emerald-500/40 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors mb-2">
              <FileAudio className="size-5 sm:size-6" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-mono font-bold text-emerald-400 break-all">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] sm:text-xs font-mono text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • READY FOR ENGINE
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-slate-200">
                  Drop audio master file here or tap to browse
                </p>
                <p className="text-[11px] sm:text-xs font-mono text-slate-500">
                  WAV, MP3, M4A, AAC, FLAC, WEBM • 16 kHz Mono Engine
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-slate-800 rounded-xl p-5 sm:p-8 text-center bg-slate-950/60 flex flex-col items-center justify-center space-y-4">
            {isRecording ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="size-14 sm:size-16 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center relative shadow-lg shadow-red-900/30">
                    <Mic className="size-6 sm:size-7 text-red-500 animate-pulse" />
                  </div>
                </div>

                {/* Animated VU visualizer */}
                <div className="flex items-center justify-center gap-1 h-6">
                  {[8, 18, 12, 24, 16, 22, 10, 26, 14, 20].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-1 bg-red-500/80 rounded-full animate-pulse"
                    />
                  ))}
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-widest">
                    {formatTimer(recordingSeconds)}
                  </div>
                  <p className="text-xs font-mono text-red-400 mt-1 uppercase">RECORDING IN PROGRESS</p>
                </div>

                <Magnet padding={12} magnetStrength={2}>
                  <button
                    onClick={stopRecording}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold flex items-center gap-2 mx-auto border border-slate-700 transition-colors"
                  >
                    <Square className="size-3.5 fill-current" />
                    <span>STOP RECORDING</span>
                  </button>
                </Magnet>
              </div>
            ) : (
              <div className="space-y-3">
                <Magnet padding={15} magnetStrength={3}>
                  <button
                    onClick={startRecording}
                    className="size-14 sm:size-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40 transition-transform active:scale-95 mx-auto"
                  >
                    <Mic className="size-6 sm:size-7" />
                  </button>
                </Magnet>

                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-200">
                    Record Live Audio Stream
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    {selectedFile ? `Ready: ${selectedFile.name}` : 'Local Microphone • Zero Cloud Retention'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Engine Parameters: Language & Aho-Corasick Automaton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-[11px] sm:text-xs font-mono text-slate-300 flex items-center gap-1.5 mb-1.5 uppercase">
              <Globe className="size-3.5 text-emerald-400" />
              <span>LANGUAGE MODEL (WHISTLE)</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="id">Indonesian (ID - Fine-Tuned CTC)</option>
              <option value="en">English (EN)</option>
              <option value="de">German (Deutsch)</option>
              <option value="fr">French (Français)</option>
              <option value="es">Spanish (Español)</option>
              <option value="it">Italian (Italiano)</option>
              <option value="nl">Dutch (Nederlands)</option>
              <option value="pl">Polish (Polski)</option>
              <option value="auto">Auto-Detect Multi-Track</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] sm:text-xs font-mono text-slate-300 flex items-center gap-1.5 mb-1.5 uppercase">
              <Tag className="size-3.5 text-emerald-400" />
              <span>KEYWORD BIASING (AHO-CORASICK)</span>
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. Budi, Whistle, OKR, Q3 Budget"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              Biases CTC log-likelihood weights toward organizational vocabulary.
            </p>
          </div>
        </div>

        {/* Execution Trigger using StarBorder & Magnet */}
        <div className="pt-1 sm:pt-2">
          {selectedFile && !isProcessing ? (
            <Magnet padding={12} magnetStrength={2} className="w-full">
              <StarBorder
                onClick={handleSubmit}
                color="#10b981"
                speed="3.5s"
                backgroundColor="#064e3b"
                textColor="#ffffff"
                borderColor="rgba(16, 185, 129, 0.4)"
                className="w-full cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-1 font-mono font-bold text-xs sm:text-sm text-center">
                  <Volume2 className="size-4 text-emerald-300 shrink-0" />
                  <ShinyText text="EXECUTE TRANSCRIPTION & REASONING" speed={3} className="text-white" />
                  <ArrowRight className="size-4 text-emerald-300 shrink-0" />
                </div>
              </StarBorder>
            </Magnet>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isProcessing}
              className={`w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl font-mono font-semibold text-xs flex items-center justify-center gap-2.5 transition-all text-center ${
                isProcessing
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="size-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <DecryptedText
                    text="PROCESSING AUDIO STREAM WITH WHISTLE & GEMINI FLASH..."
                    speed={25}
                    animateOn="view"
                    className="text-emerald-400 font-mono text-xs"
                  />
                </>
              ) : (
                <span>SELECT AUDIO TRACK OR RECORD STREAM TO EXECUTE</span>
              )}
            </button>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
};

export default AudioUploader;
