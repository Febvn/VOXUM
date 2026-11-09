import React from 'react';
import { X, Cpu, ShieldCheck, Zap, Activity, CheckCircle2 } from 'lucide-react';
import { Magnet, DecryptedText } from './react-bits';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groqKey?: string;
  onSaveGroqKey?: (key: string) => void;
  apiKey?: string;
  onSaveApiKey?: (key: string) => void;
  backendUrl?: string;
  onSaveBackendUrl?: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
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
              <DecryptedText text="SYSTEM STATUS & ENGINE" speed={25} animateOn="view" className="text-white font-mono" />
            </h3>
            <p className="text-[11px] text-zinc-400">VOXTUM Cloud Speech Intelligence</p>
          </div>
        </div>

        {/* Engine Status Card */}
        <div className="p-4 rounded-none bg-black border border-zinc-800 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
              <Zap className="size-3.5 text-white" />
              <span>ASR Engine</span>
            </span>
            <span className="text-white font-bold tracking-wider">
              WHISPER LARGE V3 TURBO
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
              <Activity className="size-3.5 text-white" />
              <span>Engine Status</span>
            </span>
            <span className="text-white flex items-center gap-1 font-bold">
              <CheckCircle2 className="size-3.5" />
              <span>TERHUBUNG & AKTIF</span>
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <span className="text-zinc-400 font-medium">Hardware Akumulasi</span>
            <span className="text-zinc-200">Cloud LPU Tensor</span>
          </div>

          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <span className="text-zinc-400 font-medium">Kecepatan Transkripsi</span>
            <span className="text-zinc-200">~1.850 kata / detik</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="size-3.5 text-white" />
              <span>Privasi Berkas</span>
            </span>
            <span className="text-zinc-300">Zero Cloud Retention</span>
          </div>
        </div>

        {/* Info box explaining zero setup needed */}
        <div className="p-3.5 rounded-none bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
          <p className="font-bold text-white uppercase tracking-wider text-[10px]">
            ✓ Siap Digunakan Secara Instan
          </p>
          <p className="text-zinc-400 leading-relaxed font-sans text-xs">
            Seluruh pemrosesan suara telah terhubung ke infrastruktur engine Whisper kami. Anda tidak perlu menyetel atau memasukkan API key apapun. Cukup unggah berkas media langsung di beranda.
          </p>
        </div>

        <Magnet padding={15} magnetStrength={3} className="w-full">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-none bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md font-mono uppercase tracking-wider"
          >
            Tutup
          </button>
        </Magnet>
      </div>
    </div>
  );
};

export default SettingsModal;
