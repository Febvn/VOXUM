import React, { useState } from 'react';
import { X, Key, Server, Cpu, Check, ShieldCheck } from 'lucide-react';
import { SpotlightCard, Magnet, DecryptedText } from './react-bits';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  backendUrl: string;
  onSaveBackendUrl: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  backendUrl,
  onSaveBackendUrl,
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempUrl, setTempUrl] = useState(backendUrl);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(tempKey);
    onSaveBackendUrl(tempUrl);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-mono">
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.15)"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl relative space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors z-20"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Key className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              <DecryptedText text="ENGINE CONFIGURATION" speed={25} animateOn="view" className="text-white font-mono" />
            </h3>
            <p className="text-[11px] text-slate-400">Whistle ASR Local &amp; Gemini Flash Ingestion</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Gemini API Key */}
          <div>
            <label className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5 uppercase">
              <Key className="size-3.5 text-emerald-400" />
              <span>Google Gemini API Key (Direct Browser Mode)</span>
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-400" />
              <span>Zero-Timeout client direct streaming (LocalStorage encryption).</span>
            </p>
          </div>

          {/* Backend API Endpoint */}
          <div>
            <label className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5 uppercase">
              <Server className="size-3.5 text-blue-400" />
              <span>Whistle Local Daemon Endpoint</span>
            </label>
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold">
              <Cpu className="size-3.5 text-emerald-400" />
              <span>WHISTLE COMPACT RUNTIME (16.9 MB)</span>
            </div>
            <p className="font-sans">
              Menjalankan model CAct offline terkompresi pada port 8000 untuk privasi udara penuh (air-gapped environments).
            </p>
          </div>
        </div>

        <Magnet padding={15} magnetStrength={3} className="w-full">
          <button
            onClick={handleSave}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40"
          >
            {saved ? <Check className="size-4" /> : null}
            <span>{saved ? 'CONFIG SAVED' : 'SAVE CONFIGURATION'}</span>
          </button>
        </Magnet>
      </SpotlightCard>
    </div>
  );
};

export default SettingsModal;
