import React, { useState } from 'react';
import { X, Key, Server, Cpu, Check, ShieldCheck } from 'lucide-react';
import { Magnet, DecryptedText } from './react-bits';

export interface SettingsModalProps {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-zinc-950 border border-zinc-800 rounded-none w-full max-w-md p-5 sm:p-6 shadow-2xl relative space-y-5 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-none hover:bg-zinc-900 transition-colors z-20"
          aria-label="Tutup pengaturan"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="size-10 rounded-none bg-black border border-zinc-700 flex items-center justify-center text-white">
            <Cpu className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-wider">
              <DecryptedText text="ENGINE SETTINGS" speed={25} animateOn="view" className="text-white font-mono" />
            </h3>
            <p className="text-[11px] text-zinc-400">Whistle In-Browser On-Device ASR</p>
          </div>
        </div>

        {/* Info Box: Client-side compute default */}
        <div className="p-3.5 rounded-none bg-black border border-zinc-800 text-[11px] text-zinc-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Cpu className="size-3.5" />
            <span>KOMPUTASI DI LAPTOP USER (DEFAULT)</span>
          </div>
          <p className="text-zinc-400 leading-relaxed font-sans text-xs">
            Secara default seluruh proses ASR ditanggung langsung oleh kartu grafis (WebGPU) atau prosesor (WASM) di laptop pengunjung web. Bebas biaya server dan berkas audio tidak dikirim ke cloud.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          {/* Optional Gemini API Key Field */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Key className="size-3.5 text-white" />
              <span>Google Gemini API Key (Opsional Fallback)</span>
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-black border border-zinc-800 rounded-none px-3.5 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono"
            />
            <p className="text-[10px] text-zinc-500 flex items-center gap-1">
              <ShieldCheck className="size-3 text-zinc-400" />
              <span>Disimpan di LocalStorage browser pribadi.</span>
            </p>
          </div>

          {/* Optional Backend Daemon Endpoint Field */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Server className="size-3.5 text-white" />
              <span>Whistle Daemon Endpoint (Opsional)</span>
            </label>
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-black border border-zinc-800 rounded-none px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-white font-mono"
            />
          </div>
        </div>

        <Magnet padding={15} magnetStrength={3} className="w-full">
          <button
            onClick={handleSave}
            className="w-full py-2.5 px-4 rounded-none bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {saved ? <Check className="size-4" /> : null}
            <span>{saved ? 'KONFIGURASI TERSIMPAN' : 'SIMPAN KONFIGURASI'}</span>
          </button>
        </Magnet>
      </div>
    </div>
  );
};

export default SettingsModal;
