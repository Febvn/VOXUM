import React, { useState } from 'react';
import { Menu, X, Settings } from 'lucide-react';
import { VoxtumLogo } from './VoxtumLogo';
import BranchedMenu, { type BranchedMenuItem } from './react-bits/BranchedMenu';
import {
  Rocket01Icon,
  Download04Icon,
  Settings02Icon,
  PaintBoardIcon,
  CursorPointer01Icon,
  Layers01Icon,
  TextFontIcon,
  Notification03Icon
} from '@hugeicons/core-free-icons';

interface NavbarProps {
  onOpenSettings?: () => void;
  onOpenHistory?: () => void;
  onOpenPricing?: () => void;
  apiKeySet?: boolean;
  historyCount?: number;
  currentPlan?: 'free' | 'pro' | 'enterprise';
  brandName?: string;
}

const MENU_ITEMS: BranchedMenuItem[] = [
  {
    label: 'Getting started',
    children: [
      { value: 'overview', label: 'Overview', icon: Rocket01Icon },
      { value: 'models', label: 'Models & Audio', icon: Download04Icon },
      { value: 'config', label: 'Configuration', icon: Settings02Icon },
      { value: 'theming', label: 'Theme & Styling', icon: PaintBoardIcon }
    ]
  },
  {
    label: 'Interactive UI',
    children: [
      { value: 'specular', label: 'Specular Buttons', icon: CursorPointer01Icon },
      { value: 'waves', label: 'ShapeWaves Canvas', icon: Layers01Icon },
      { value: 'typography', label: 'Geist Typography', icon: TextFontIcon },
      { value: 'toasts', label: 'Notifications', icon: Notification03Icon }
    ]
  }
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenPricing,
  brandName = 'VOXTUM',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] max-w-7xl z-50 select-none font-['Geist',system-ui,-apple-system,sans-serif]">
        <nav
          aria-label="Main Navigation"
          className="h-14 px-4 sm:px-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex items-center justify-between transition-all"
        >
          {/* Brand with Official VOXTUM Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <VoxtumLogo size={24} className="group-hover:scale-105 transition-transform duration-300" />
            <span className="text-white font-medium text-sm sm:text-base tracking-tight">
              {brandName}
            </span>
          </a>

          {/* Desktop Links, Sign Up CTA & Burger Button */}
          <div className="hidden sm:flex items-center gap-5">
            <a
              href="#studio"
              className="text-sm text-zinc-300 hover:text-white transition-colors duration-150"
            >
              Studio
            </a>
            <a
              href="#features"
              className="text-sm text-zinc-300 hover:text-white transition-colors duration-150"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-sm text-zinc-300 hover:text-white transition-colors duration-150"
            >
              About
            </a>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                title="Settings"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenPricing}
              type="button"
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-sm px-4 py-1.5 rounded-lg transition-colors duration-150 shadow-sm active:scale-95"
            >
              Sign up
            </button>

            {/* Burger Button directly next to Sign up */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              type="button"
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center active:scale-95"
              aria-label="Open navigation sidebar"
              title="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Actions: Settings + Sign up + Burger Button */}
          <div className="flex sm:hidden items-center gap-1.5">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 text-zinc-400 hover:text-white border border-white/10 rounded-lg transition-colors active:scale-95"
                title="Settings"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenPricing}
              type="button"
              className="bg-white text-zinc-950 font-medium text-xs px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
            >
              Sign up
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-zinc-300 hover:text-white border border-white/10 rounded-lg transition-colors"
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
                  <span className="text-white font-medium text-base tracking-tight">
                    {brandName}
                  </span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* BranchedMenu Integration */}
              <div className="py-2">
                <BranchedMenu
                  items={MENU_ITEMS}
                  defaultOpen={[0]}
                  defaultActive="overview"
                  color="#f5f5f5"
                  accentColor="#c7d9c6"
                  lineColor="#3f3f46"
                  width={260}
                  rowHeight={38}
                  fontSize={14}
                  onSelect={(value) => {
                    console.log('Selected:', value);
                  }}
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>VOXTUM Core</span>
              <span>React Bits</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
