import React from 'react';
import { VoxtumLogo } from './VoxtumLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black text-white pt-24 pb-8 px-4 sm:px-8 lg:px-12 select-none overflow-hidden font-['Geist',system-ui,-apple-system,sans-serif] border-t border-zinc-900">
      <div className="w-full">
        {/* Upper Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-20 items-stretch">
          {/* Left Column: Brand & Tagline */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-12">
            <div className="space-y-6">
              {/* Logo Pill / Brand Badge */}
              <div className="flex items-center gap-3">
                <VoxtumLogo size={28} />
                <span className="font-bold tracking-wider text-sm text-white uppercase">
                  VOXTUM
                </span>
              </div>

              {/* Headline Tagline */}
              <h3 className="text-xl sm:text-2xl font-medium text-white max-w-xs leading-snug tracking-tight">
                Sub-second speech intelligence, engineered for privacy
              </h3>
            </div>

            {/* Sub-note */}
            <p className="text-xs text-zinc-500 font-normal">
              Local &amp; air-gapped speech recognition
            </p>
          </div>

          {/* Right Columns: 3 bordered columns matching the reference screenshot */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 border-t sm:border-t-0 sm:border-l border-zinc-800/80 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/80">
            {/* Column 1: Platform */}
            <div className="py-6 sm:py-0 sm:px-8 space-y-5">
              <h4 className="text-sm font-semibold text-white">Platform</h4>
              <ul className="space-y-3.5 text-xs text-zinc-400">
                <li>
                  <a href="#studio" className="hover:text-white transition-colors">
                    Transcription Studio
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Multi-Format Extraction
                  </a>
                </li>
                <li>
                  <a href="#studio-grid-continuation" className="hover:text-white transition-colors">
                    Timestamp Alignment
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    Local Whistle Daemon
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div className="py-6 sm:py-0 sm:px-8 space-y-5">
              <h4 className="text-sm font-semibold text-white">Resources</h4>
              <ul className="space-y-3.5 text-xs text-zinc-400">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    About &amp; Core Pillars
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Acoustic Benchmarks
                  </a>
                </li>
                <li>
                  <a href="#support" className="hover:text-white transition-colors">
                    Codec Specifications
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Febvn/VOXUM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    GitHub Repository <span className="text-[10px]">↗</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div className="py-6 sm:py-0 sm:px-8 space-y-5">
              <h4 className="text-sm font-semibold text-white">Support</h4>
              <ul className="space-y-3.5 text-xs text-zinc-400">
                <li>
                  <a href="#support" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#support" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing &amp; Plans
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    Privacy Guarantee
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

