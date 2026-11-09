import React, { useState } from 'react';
import { X, Key, Server, Cpu, Check, ShieldCheck, Zap } from 'lucide-react';
import { Magnet, DecryptedText } from './react-bits';

export type EngineMode = 'browser' | 'gemini' | 'server';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  backendUrl: string;
  onSaveBackendUrl: (url: string) => void;
  engineMode?: EngineMode;
  onSaveEngineMode?: (mode: EngineMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  backendUrl,
  onSaveBackendUrl,
  engineMode = 'browser',
  onSaveEngineMode,
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempUrl, setTempUrl] = useState(backendUrl);
  const [selectedEngine, setSelectedEngine] = useState<EngineMode>(engineMode);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(tempKey);
    onSaveBackendUrl(tempUrl);
    onSaveEngineMode?.(selectedEngine);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-zinc-950 border border-zinc-800 rounded-none w-full max-w-lg p-5 sm:p-6 shadow-2xl relative space-y-5 max-h-[92vh] overflow-y-auto">
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
              <DecryptedText text="ENGINE CONFIGURATION" speed={25} animateOn="view" className="text-white font-mono" />
            </h3>
            <p className="text-[11px] text-zinc-400">Pilih mesin pemrosesan audio & transkripsi</p>
          </div>
        </div>

        {/* Engine Selector */}
        <div className="space-y-2">
          <label className="font-semibold text-zinc-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="size-3.5 text-white" />
            <span>Pilihan Engine ASR</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedEngine('browser')}
              className={`p-3 text-left border rounded-none transition-all flex flex-col justify-between ${
                selectedEngine === 'browser'
                  ? 'border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              <div>
                <div className="text-[11px] font-bold tracking-wide flex items-center gap-1.5 text-white">
                  <span>⚡ Whistle Laptop</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                  WebGPU / WASM di browser. Bebas server & 100% gratis.
                </p>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 mt-2 font-semibold">
                {selectedEngine === 'browser' ? '● Aktif' : 'Pilih'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedEngine('gemini')}
              className={`p-3 text-left border rounded-none transition-all flex flex-col justify-between ${
                selectedEngine === 'gemini'
                  ? 'border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              <div>
                <div className="text-[11px] font-bold tracking-wide flex items-center gap-1.5 text-white">
                  <span>☁ Gemini Flash</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                  Cloud multimodal streaming langsung dari browser via API Key.
                </p>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 mt-2 font-semibold">
                {selectedEngine === 'gemini' ? '● Aktif' : 'Pilih'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedEngine('server')}
              className={`p-3 text-left border rounded-none transition-all flex flex-col justify-between ${
                selectedEngine === 'server'
                  ? 'border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              <div>
                <div className="text-[11px] font-bold tracking-wide flex items-center gap-1.5 text-white">
                  <span>🖥 Whistle Daemon</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                  Server backend eksternal (localhost:8000 / remote tunnel).
                </p>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 mt-2 font-semibold">
                {selectedEngine === 'server' ? '● Aktif' : 'Pilih'}
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-4 text-xs pt-1">
          {selectedEngine === 'gemini' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="font-semibold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Key className="size-3.5 text-white" />
                <span>Google Gemini API Key</span>
              </label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-black border border-zinc-800 rounded-none px-3.5 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono"
              />
              <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="size-3 text-zinc-300" />
                <span>Tersimpan lokal di browser (LocalStorage), tidak dikirim ke server pihak ketiga.</span>
              </p>
            </div>
          )}

          {selectedEngine === 'server' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="font-semibold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Server className="size-3.5 text-white" />
                <span>Whistle Daemon Endpoint</span>
              </label>
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full bg-black border border-zinc-800 rounded-none px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-white font-mono"
              />
            </div>
          )}

          {selectedEngine === 'browser' && (
            <div className="p-3.5 rounded-none bg-black border border-zinc-800 text-[11px] text-zinc-300 space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Cpu className="size-3.5" />
                <span>ONNX WHISTLE IN-BROWSER RUNTIME (~39 MB)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                Model ASR dieksekusi langsung oleh kartu grafis (WebGPU) atau prosesor (WASM) laptop Anda. Berkas model diunduh satu kali dan disimpan di cache browser untuk penggunaan offline berikutnya tanpa biaya server sama sekali.
              </p>
            </div>
          )}
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
