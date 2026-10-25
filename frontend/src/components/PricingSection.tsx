import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { ShinyText } from './react-bits';

export interface PricingSectionProps {
  onSelectPlan?: (plan: string) => void;
  currentPlan?: 'free' | 'pro' | 'enterprise';
  className?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  currentPlan = 'free',
  className = ''
}) => {
  const [billing, setBilling] = useState<'monthly' | 'annually'>('monthly');

  return (
    <section
      id="pricing"
      aria-label="Pricing Table"
      className={`w-full bg-black text-white px-4 sm:px-8 lg:px-12 py-20 sm:py-28 border-t border-zinc-800/80 font-['Geist',system-ui,-apple-system,sans-serif] select-none ${className}`}
    >
      {/* Section Title Header */}
      <div className="mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
          <ShinyText
            text="PRICING & PLAN MATRIX"
            speed={2.5}
            color="#d4d4d8"
            shineColor="#ffffff"
            spread={120}
          />
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          All high-speed speech processing, local runtime models, and enterprise tiers are currently unlocked for free.
        </p>
      </div>

      {/* Full-width Box with Zero Rounded Borders (Strictly Rectangular Grid) */}
      <div className="w-full rounded-none bg-black border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Top 4-Column Grid: Billing & Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          {/* Column 1: Billing Selector */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-black">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-6">
                TIER SELECTION
              </div>

              <div className="space-y-4">
                <div className="p-3 border border-zinc-800 bg-zinc-950 font-mono text-xs space-y-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-none bg-white text-black font-bold uppercase inline-block">
                    100% FREE ACCESS
                  </span>
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                    Pro and Enterprise licenses are completely free during this release. Select any plan to activate instantly.
                  </p>
                </div>

                {/* Annually Radio */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="billing"
                    value="annually"
                    checked={billing === 'annually'}
                    onChange={() => setBilling('annually')}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-none border flex items-center justify-center transition-colors ${
                      billing === 'annually'
                        ? 'border-white bg-transparent'
                        : 'border-zinc-600 group-hover:border-zinc-400'
                    }`}
                  >
                    {billing === 'annually' && (
                      <div className="w-2 h-2 rounded-none bg-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-zinc-200">Annually</span>
                  <span className="text-[10px] font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-none uppercase">
                    Free
                  </span>
                </label>

                {/* Monthly Radio */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="billing"
                    value="monthly"
                    checked={billing === 'monthly'}
                    onChange={() => setBilling('monthly')}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-none border flex items-center justify-center transition-colors ${
                      billing === 'monthly'
                        ? 'border-white bg-transparent'
                        : 'border-zinc-600 group-hover:border-zinc-400'
                    }`}
                  >
                    {billing === 'monthly' && (
                      <div className="w-2 h-2 rounded-none bg-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-zinc-200">Monthly</span>
                  <span className="text-[10px] font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-none uppercase">
                    Free
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-8 text-[11px] text-zinc-500 font-mono">
              Zero credit card or payment required.
            </div>
          </div>

          {/* Column 2: Hobby Plan */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-black">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight uppercase">Hobby</h3>
              <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">
                Essential browser transcription for personal recordings
              </p>

              {/* Price */}
              <div className="mt-5 mb-7 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-white">$0</span>
                <span className="text-xs text-zinc-400 font-mono">forever free</span>
              </div>

              {/* Feature list */}
              <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Up to 30 min per audio file</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>MP3, WAV, MP4 &amp; WebM support</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>[MM:SS] &amp; seconds timecodes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Client-side export to .TXT</span>
                </li>
              </ul>
            </div>

            {currentPlan === 'free' ? (
              <button
                disabled
                type="button"
                className="w-full py-3 rounded-none border border-zinc-800 bg-zinc-950 text-zinc-500 font-semibold text-xs tracking-wider uppercase cursor-default"
              >
                CURRENT ACTIVE PLAN
              </button>
            ) : (
              <button
                onClick={() => onSelectPlan?.('free')}
                type="button"
                className="w-full py-3 rounded-none border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-white font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                SELECT FREE
              </button>
            )}
          </div>

          {/* Column 3: Studio / Pro Plan (Free Preview) */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-black relative">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight uppercase">Studio Pro</h3>
                <span className="bg-white text-zinc-950 font-bold text-[10px] px-2 py-0.5 rounded-none uppercase">
                  FREE PREVIEW
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">
                High-speed speech transcription for professional teams
              </p>

              {/* Price */}
              <div className="mt-5 mb-7 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  $0
                </span>
                <span className="text-xs text-zinc-400 font-mono">free during preview (reg. $29)</span>
              </div>

              {/* Feature list */}
              <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Unlimited audio and video length</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Local daemon + GPU acceleration</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Aho-Corasick keyword biasing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Full rich text editor (B, I, U, H1, H2)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>All 4 timestamp alignment modes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Priority processing queue</span>
                </li>
              </ul>
            </div>

            {currentPlan === 'pro' ? (
              <button
                disabled
                type="button"
                className="w-full py-3 rounded-none border border-white bg-white text-zinc-950 font-bold text-xs tracking-wider uppercase cursor-default"
              >
                CURRENT ACTIVE PLAN
              </button>
            ) : (
              <button
                onClick={() => onSelectPlan?.('pro')}
                type="button"
                className="w-full py-3 rounded-none bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-colors shadow-sm"
              >
                ACTIVATE PRO (FREE)
              </button>
            )}
          </div>

          {/* Column 4: Enterprise Plan (Free Access) */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-black">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight uppercase">Enterprise</h3>
                <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-[10px] px-2 py-0.5 rounded-none uppercase">
                  UNLOCKED
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">
                Air-gapped deployment, custom models, and full team access
              </p>

              {/* Price */}
              <div className="mt-5 mb-7 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-white">$0</span>
                <span className="text-xs text-zinc-400 font-mono">unlocked for community</span>
              </div>

              {/* Feature list */}
              <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Self-hosted air-gapped daemon</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Custom acoustic model fine-tuning</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Zero cloud data retention compliance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>SSO / SAML &amp; SCIM sync</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>99.99% uptime SLA guarantee</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Dedicated speech engineer</span>
                </li>
              </ul>
            </div>

            {currentPlan === 'enterprise' ? (
              <button
                disabled
                type="button"
                className="w-full py-3 rounded-none border border-white bg-white text-zinc-950 font-bold text-xs tracking-wider uppercase cursor-default"
              >
                CURRENT ACTIVE PLAN
              </button>
            ) : (
              <button
                onClick={() => onSelectPlan?.('enterprise')}
                type="button"
                className="w-full py-3 rounded-none border border-zinc-500 hover:border-white bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs tracking-wider uppercase transition-colors"
              >
                ACTIVATE ENTERPRISE (FREE)
              </button>
            )}
          </div>
        </div>

        {/* Feature Comparison Matrix Table (Full-Bleed, Square Layout) */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px] w-full">
            {/* Category 1 Header: Audio Capacity */}
            <div className="bg-black px-6 sm:px-8 py-3.5 border-y border-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Audio &amp; Video Ingestion Capacity
            </div>

            {/* Row 1: Max file length */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Max audio length per file</span>
              <span className="text-zinc-400 text-center font-mono">30 min / file</span>
              <span className="text-zinc-400 text-center font-mono">Unlimited</span>
              <span className="text-zinc-400 text-center font-mono">Unlimited</span>
            </div>

            {/* Row 2: Media formats */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Supported media formats</span>
              <span className="text-zinc-400 text-center">MP3, WAV, MP4, WebM</span>
              <span className="text-zinc-400 text-center">All audio + video formats</span>
              <span className="text-zinc-400 text-center">Custom codecs &amp; multichannel</span>
            </div>

            {/* Row 3: Client extraction */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Client-side 16kHz extraction</span>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
            </div>

            {/* Row 4: Batch queue */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800 items-center text-xs">
              <span className="text-zinc-300 font-medium">Batch processing queue</span>
              <span className="text-zinc-400 text-center font-mono">Single file</span>
              <span className="text-zinc-400 text-center font-mono">Up to 25 files</span>
              <span className="text-zinc-400 text-center font-mono">Unlimited batch</span>
            </div>

            {/* Category 2 Header: ASR Engine & Features */}
            <div className="bg-black px-6 sm:px-8 py-3.5 border-b border-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wider">
              ASR Engine &amp; Formatting Features
            </div>

            {/* Row 5: Timestamp modes */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Timestamp alignment modes</span>
              <span className="text-zinc-400 text-center font-mono">Plain &amp; [MM:SS]</span>
              <span className="text-zinc-400 text-center font-mono">All 4 timestamp modes</span>
              <span className="text-zinc-400 text-center font-mono">Sub-frame phoneme timecodes</span>
            </div>

            {/* Row 6: Rich text editor */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Rich text formatting (B, I, U, H1, H2)</span>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
            </div>

            {/* Row 7: Keyword biasing */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Keyword &amp; name biasing</span>
              <span className="text-zinc-600 text-center font-mono">—</span>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
            </div>

            {/* Row 8: Local daemon */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800 items-center text-xs">
              <span className="text-zinc-300 font-medium">Local daemon connectivity (port 8000)</span>
              <span className="text-zinc-600 text-center font-mono">—</span>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
            </div>

            {/* Category 3 Header: Security & Compliance */}
            <div className="bg-black px-6 sm:px-8 py-3.5 border-b border-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Security &amp; Enterprise Governance
            </div>

            {/* Row 9: SSO / SAML & SCIM */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">SSO / SAML &amp; SCIM</span>
              <span className="text-zinc-600 text-center font-mono">—</span>
              <span className="text-zinc-600 text-center font-mono">—</span>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
            </div>

            {/* Row 10: Air-gapped deployment */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Air-gapped on-premise installation</span>
              <span className="text-zinc-600 text-center font-mono">—</span>
              <span className="text-zinc-600 text-center font-mono">—</span>
              <div className="flex justify-center">
                <span className="w-5 h-5 rounded-none bg-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                </span>
              </div>
            </div>

            {/* Row 11: 99.99% Uptime SLA & Dedicated Engineer */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 items-center text-xs">
              <span className="text-zinc-300 font-medium">99.99% Uptime SLA &amp; Support engineer</span>
              <span className="text-zinc-600 text-center font-mono">—</span>
              <span className="text-zinc-600 text-center font-mono">Email Priority</span>
              <span className="text-zinc-200 text-center font-mono font-medium">Dedicated Named</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
