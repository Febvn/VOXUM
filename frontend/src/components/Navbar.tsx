import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Settings,
  Mic,
  FileText,
  Clock,
  Cpu,
  Layers,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { VoxtumLogo } from './VoxtumLogo';
import BranchedMenu, { type BranchedMenuItem } from './react-bits/BranchedMenu';
import type { AuthUser } from '../types/auth';

interface NavbarProps {
  onOpenSettings?: () => void;
  onOpenHistory?: () => void;
  onOpenPricing?: () => void;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
  onSignOut?: () => void;
  user?: AuthUser | null;
  apiKeySet?: boolean;
  historyCount?: number;
  currentPlan?: 'free' | 'pro' | 'enterprise';
  brandName?: string;
}

const MENU_ITEMS: BranchedMenuItem[] = [
  {
    label: 'Speech Studio',
    children: [
      { value: 'studio-ingest', label: 'Audio & Video Ingest', icon: <Mic className="w-4 h-4 text-zinc-300" /> },
      { value: 'studio-editor', label: 'Transcription Editor', icon: <FileText className="w-4 h-4 text-zinc-300" /> },
      { value: 'studio-timestamps', label: 'Timestamp View Modes', icon: <Clock className="w-4 h-4 text-zinc-300" /> },
      { value: 'studio-engine', label: 'Engine Configuration', icon: <Cpu className="w-4 h-4 text-zinc-300" /> }
    ]
  },
  {
    label: 'Platform & Architecture',
    children: [
      { value: 'platform-pipeline', label: 'Media Pipeline', icon: <Layers className="w-4 h-4 text-zinc-300" /> },
      { value: 'platform-privacy', label: 'Air-Gapped Privacy', icon: <ShieldCheck className="w-4 h-4 text-zinc-300" /> },
      { value: 'platform-pricing', label: 'Plans & Compute', icon: <CreditCard className="w-4 h-4 text-zinc-300" /> },
      { value: 'platform-support', label: 'Help & Support', icon: <HelpCircle className="w-4 h-4 text-zinc-300" /> }
    ]
  }
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenHistory,
  onOpenPricing,
  onOpenSignIn,
  onOpenSignUp,
  onSignOut,
  user = null,
  currentPlan = 'pro',
  brandName = 'VOXTUM',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <header className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] max-w-7xl z-50 select-none font-['Geist',system-ui,-apple-system,sans-serif]">
        <nav
          aria-label="Main Navigation"
          className="h-14 px-4 sm:px-6 rounded-none bg-black/50 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex items-center justify-between transition-all"
        >
          {/* Brand with Official VOXTUM Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <VoxtumLogo size={24} className="group-hover:scale-105 transition-transform duration-300" />
            <span className="text-white font-medium text-sm sm:text-base tracking-tight font-mono">
              {brandName}
            </span>
          </a>

          {/* Desktop Links, Auth State & Burger Button */}
          <div className="hidden sm:flex items-center gap-5">
            <a
              href="#studio"
              className="text-sm text-zinc-300 hover:text-white transition-colors duration-150"
            >
              Studio
            </a>
            <a
              href="#benchmarks"
              className="text-sm text-zinc-300 hover:text-white transition-colors duration-150"
            >
              Benchmarks
            </a>
            <a
              href="#specs"
              className="text-sm text-zinc-300 hover:text-white transition-colors duration-150"
            >
              Specs
            </a>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-none"
                title="Engine Settings"
                aria-label="Engine Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Authentication Action Group */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-none text-xs text-white transition-colors"
                >
                  <div className="size-6 bg-white text-black font-mono font-bold flex items-center justify-center text-[11px] rounded-none">
                    {getInitials(user.name)}
                  </div>
                  <span className="font-mono text-zinc-200 max-w-[110px] truncate">{user.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-white/10 text-white border border-white/20 rounded-none uppercase font-bold">
                    {currentPlan.toUpperCase()}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-black border border-zinc-800 rounded-none shadow-2xl p-3 z-50 font-mono text-xs space-y-3 animate-fade-in">
                    <div className="border-b border-zinc-900 pb-2.5">
                      <p className="text-white font-bold truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 text-zinc-300 border border-zinc-800 uppercase">
                          PROVIDER: {user.provider.toUpperCase()}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-white text-black font-bold uppercase">
                          {currentPlan.toUpperCase()} TIER
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {onOpenPricing && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenPricing();
                          }}
                          className="w-full text-left px-2 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Change Plan / Compute License</span>
                        </button>
                      )}
                      {onOpenHistory && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenHistory();
                          }}
                          className="w-full text-left px-2 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Session Archive</span>
                        </button>
                      )}
                      {onOpenSettings && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenSettings();
                          }}
                          className="w-full text-left px-2 py-1.5 hover:bg-zinc-900 text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Engine Preferences</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-zinc-900 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSignOut?.();
                        }}
                        className="w-full text-left px-2 py-1.5 hover:bg-red-950/40 text-red-400 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of VOXTUM</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenSignIn}
                  type="button"
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors px-2 py-1 rounded-none"
                >
                  Sign in
                </button>
                <button
                  onClick={onOpenSignUp}
                  type="button"
                  className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs px-3.5 py-1.5 rounded-none transition-colors duration-150 shadow-sm active:scale-95 uppercase font-mono"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Burger Button directly next to Sign up / User */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              type="button"
              className="p-2 rounded-none text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center active:scale-95"
              aria-label="Open navigation sidebar"
              title="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Actions: User Avatar or Sign In + Burger Button */}
          <div className="flex sm:hidden items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-none text-xs text-white"
              >
                <div className="size-5 bg-white text-black font-mono font-bold flex items-center justify-center text-[10px] rounded-none">
                  {getInitials(user.name)}
                </div>
                <span className="text-[9px] font-mono font-bold uppercase">{currentPlan.toUpperCase()}</span>
              </button>
            ) : (
              <button
                onClick={onOpenSignIn}
                type="button"
                className="bg-white text-zinc-950 font-bold text-xs px-2.5 py-1 rounded-none font-mono uppercase"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-zinc-300 hover:text-white border border-white/10 rounded-none transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Left Slide-over Sidebar with BranchedMenu */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex select-none font-['Geist',system-ui,-apple-system,sans-serif]">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar Drawer */}
          <aside
            aria-label="Branched Navigation Menu"
            className="relative w-72 sm:w-80 max-w-[85vw] h-full bg-[#0d0e12]/95 backdrop-blur-2xl border-r border-white/10 p-6 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 overflow-y-auto animate-in slide-in-from-left duration-200"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <VoxtumLogo size={22} />
                  <span className="text-white font-medium text-base tracking-tight font-mono">
                    {brandName}
                  </span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-none text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User State in Drawer */}
              <div className="mb-4 pb-4 border-b border-white/10 font-mono text-xs">
                {user ? (
                  <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold truncate">{user.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-white text-black font-bold uppercase">
                        {currentPlan.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        onSignOut?.();
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 underline pt-1 block"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        onOpenSignIn?.();
                      }}
                      className="w-full py-2 bg-white text-black font-bold text-xs uppercase tracking-wider text-center"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}
              </div>

              {/* BranchedMenu Integration */}
              <div className="py-2">
                <BranchedMenu
                  items={MENU_ITEMS}
                  defaultOpen={[0, 1]}
                  defaultActive="studio-ingest"
                  color="#f5f5f5"
                  accentColor="#ffffff"
                  lineColor="#3f3f46"
                  width={260}
                  rowHeight={38}
                  fontSize={14}
                  onSelect={(value) => {
                    setIsSidebarOpen(false);
                    if (value === 'studio-ingest') {
                      document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (value === 'studio-editor' || value === 'studio-timestamps') {
                      document.getElementById('studio-grid-continuation')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (value === 'studio-engine') {
                      onOpenSettings?.();
                    } else if (value === 'platform-pipeline') {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (value === 'platform-privacy') {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (value === 'platform-pricing') {
                      if (onOpenPricing) onOpenPricing();
                      else document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (value === 'platform-support') {
                      document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white" />
                <span>Whistle ASR 16.9MB</span>
              </span>
              <span>v2.4.0</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
