import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { ShinyText } from './react-bits';

export interface PricingSectionProps {
  onSelectPlan?: (plan: string) => void;
  className?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  className = ''
}) => {
  const [billing, setBilling] = useState<'monthly' | 'annually'>('monthly');

  const studioPrice = billing === 'annually' ? 24 : 29;

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
          Transparent compute allocation, developer seats, and enterprise security options.
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
                BILLING FREQUENCY
              </div>

              <div className="space-y-4">
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
                    Save 20%
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
                </label>
              </div>
            </div>

            <div className="pt-8 text-[11px] text-zinc-500 font-mono">
              Prices in USD. Taxes may apply.
            </div>
          </div>

          {/* Column 2: Hobby Plan */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-black">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight uppercase">Hobby</h3>
              <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">
                Everything you need to explore speech AI
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
                  <span>Up to 2 collaborators</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>5 active projects</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>10k API requests / month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Community support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan?.('hobby')}
              type="button"
              className="w-full py-3 rounded-none border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-white font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              START FREE
            </button>
          </div>

          {/* Column 3: Studio Plan (Popular) */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-black relative">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight uppercase">Studio</h3>
                <span className="bg-white text-zinc-950 font-bold text-[10px] px-2 py-0.5 rounded-none uppercase">
                  Popular
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">
                For production teams shipping intelligence fast
              </p>

              {/* Price */}
              <div className="mt-5 mb-7 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  ${studioPrice}
                </span>
                <span className="text-xs text-zinc-400 font-mono">per seat / month</span>
              </div>

              {/* Feature list */}
              <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Unlimited projects and views</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Branch-based previews</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Up to 15 collaborators</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>250k API requests / month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Shared component library</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Priority email support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan?.('studio')}
              type="button"
              className="w-full py-3 rounded-none bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-colors shadow-sm"
            >
              START 14-DAY TRIAL
            </button>
          </div>

          {/* Column 4: Business Plan */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-black">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight uppercase">Business</h3>
              <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">
                Governance, private tenancy, and scale for orgs
              </p>

              {/* Price */}
              <div className="mt-5 mb-7 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-white">Let's talk</span>
              </div>

              {/* Feature list */}
              <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Unlimited seats</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>SSO / SAML and SCIM</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Custom data residency</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>SOC 2 Type II + HIPAA BAA</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>99.99% uptime SLA</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5] shrink-0" />
                  <span>Named support engineer</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan?.('business')}
              type="button"
              className="w-full py-3 rounded-none border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-white font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              CONTACT SALES
            </button>
          </div>
        </div>

        {/* Feature Comparison Matrix Table (Full-Bleed, Square Layout) */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px] w-full">
            {/* Category 1 Header: Workspace */}
            <div className="bg-black px-6 sm:px-8 py-3.5 border-y border-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Workspace &amp; Capacity
            </div>

            {/* Row 1: Collaborators */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Collaborators</span>
              <span className="text-zinc-400 text-center font-mono">Up to 2</span>
              <span className="text-zinc-400 text-center font-mono">Up to 15</span>
              <span className="text-zinc-400 text-center font-mono">Unlimited</span>
            </div>

            {/* Row 2: Workspaces */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Workspaces</span>
              <span className="text-zinc-400 text-center">Personal only</span>
              <span className="text-zinc-400 text-center">Team + Personal</span>
              <span className="text-zinc-400 text-center">Custom org structure</span>
            </div>

            {/* Row 3: Projects per workspace */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Projects per workspace</span>
              <span className="text-zinc-400 text-center font-mono">5</span>
              <span className="text-zinc-400 text-center font-mono">Unlimited</span>
              <span className="text-zinc-400 text-center font-mono">Unlimited</span>
            </div>

            {/* Row 4: Audio storage & retention */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800 items-center text-xs">
              <span className="text-zinc-300 font-medium">Audio storage retention</span>
              <span className="text-zinc-400 text-center font-mono">30 Days</span>
              <span className="text-zinc-400 text-center font-mono">1 Year</span>
              <span className="text-zinc-400 text-center font-mono">Infinite</span>
            </div>

            {/* Category 2 Header: Platform & Collaboration */}
            <div className="bg-black px-6 sm:px-8 py-3.5 border-b border-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Platform &amp; Workflow Features
            </div>

            {/* Row 5: Real-time collaborative editor */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Real-time collaborative editor</span>
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

            {/* Row 6: Version history and rollbacks */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Version history and rollbacks</span>
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

            {/* Row 7: Comments and review flows */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Comments and review flows</span>
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

            {/* Row 8: Figma and Linear integrations */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800 items-center text-xs">
              <span className="text-zinc-300 font-medium">Figma and Linear integrations</span>
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

            {/* Row 10: Custom data residency & compliance */}
            <div className="grid grid-cols-4 px-6 sm:px-8 py-4 border-b border-zinc-800/60 items-center text-xs">
              <span className="text-zinc-300 font-medium">Custom data residency &amp; HIPAA</span>
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
