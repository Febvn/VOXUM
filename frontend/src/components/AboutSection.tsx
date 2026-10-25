import React, { useState } from 'react';
import { ShinyText } from './react-bits';

export interface AboutTabItem {
  id: string;
  label: string;
  heading: React.ReactNode;
  description: string;
  image: string;
}

export interface AboutSectionProps {
  id?: string;
  tabs?: AboutTabItem[];
  defaultTab?: string;
  className?: string;
}

const DEFAULT_TABS: AboutTabItem[] = [
  {
    id: 'inference',
    label: 'Inference',
    heading: (
      <>
        <div className="mb-1">
          <ShinyText
            text="Local speech"
            speed={2.5}
            color="#d4d4d8"
            shineColor="#ffffff"
            spread={120}
          />
        </div>
        <div>
          <ShinyText
            text="intelligence"
            speed={2.5}
            color="#d4d4d8"
            shineColor="#ffffff"
            spread={120}
          />
        </div>
      </>
    ),
    description: 'Quantized speech models run directly inside the browser or on your private daemon, eliminating third-party media transmission.',
    image: '/earth-night.png'
  },
  {
    id: 'speed',
    label: 'Speed',
    heading: (
      <>
        <div className="mb-1">
          <ShinyText
            text="Sub-second"
            speed={2.5}
            color="#d4d4d8"
            shineColor="#ffffff"
            spread={120}
          />
        </div>
        <div>
          <ShinyText
            text="throughput"
            speed={2.5}
            color="#d4d4d8"
            shineColor="#ffffff"
            spread={120}
          />
        </div>
      </>
    ),
    description: 'Optimized INT8 neural decoders transcribe hour-long recordings in seconds, generating complete text before speakers finish.',
    image: '/earth-night.png'
  },
  {
    id: 'precision',
    label: 'Precision',
    heading: (
      <>
        <div className="mb-1">
          <ShinyText
            text="Word-level"
            speed={2.5}
            color="#d4d4d8"
            shineColor="#ffffff"
            spread={120}
          />
        </div>
        <div>
          <ShinyText
            text="timecodes"
            speed={2.5}
            color="#d4d4d8"
            shineColor="#ffffff"
            spread={120}
          />
        </div>
      </>
    ),
    description: 'Every token maps directly to audio timestamps. Toggle between plain text, seconds, or minute blocks without losing context.',
    image: '/earth-night.png'
  },
  {
    id: 'privacy',
    label: 'Privacy',
    heading: (
      <>
        <div className="mb-1">
          <ShinyText
            text="Air-gapped"
            speed={2.5}
            color="#d4d4d8"
            shineColor="#ffffff"
            spread={120}
          />
        </div>
        <div>
          <ShinyText
            text="readiness"
            speed={2.5}
            color="#d4d4d8"
            shineColor="#ffffff"
            spread={120}
          />
        </div>
      </>
    ),
    description: 'Audio streams stay in volatile RAM and clear immediately after decoding. No external cloud retention and no training on customer files.',
    image: '/earth-night.png'
  }
];

export const AboutSection: React.FC<AboutSectionProps> = ({
  id = 'about',
  tabs = DEFAULT_TABS,
  defaultTab = 'inference',
  className = ''
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultTab);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <section
      id={id}
      aria-label="About Us & Company Values"
      className={`w-full bg-black text-white py-20 sm:py-28 px-4 sm:px-8 lg:px-12 border-t border-zinc-800/80 font-['Geist',system-ui,-apple-system,sans-serif] select-none ${className}`}
    >
      <div className="w-full">
        {/* Section Title Header */}
        <div className="mb-10 sm:mb-14 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
            <ShinyText
              text="ABOUT & CORE PILLARS"
              speed={2.5}
              color="#d4d4d8"
              shineColor="#ffffff"
              spread={120}
            />
          </h2>
        </div>

        {/* Desktop 3-Column Layout / Mobile Stacked Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center min-h-[480px]">
          {/* Left Column: Interactive Value Tabs */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-5 sm:space-y-7">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`text-left text-3xl sm:text-4xl lg:text-5xl tracking-tight transition-all duration-300 block focus:outline-none ${
                    isActive
                      ? 'text-white font-normal translate-x-1.5 sm:translate-x-2'
                      : 'text-zinc-600 hover:text-zinc-400 font-light hover:translate-x-1'
                  }`}
                  aria-pressed={isActive}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Middle Column: Earth Portrait Imagery */}
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-[3/4] sm:h-[450px] overflow-hidden bg-black shadow-2xl flex items-center justify-center">
              <img
                src={activeTab.image}
                alt={`${activeTab.label} visual representation`}
                className="w-full h-full object-cover select-none pointer-events-none transition-opacity duration-500 ease-in-out"
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>

          {/* Right Column: Dynamic Heading & Purpose Narrative */}
          <div className="lg:col-span-4 flex flex-col justify-center lg:pl-6">
            <div
              key={activeTab.id}
              className="animate-in fade-in duration-300 space-y-6"
            >
              <h3 className="text-4xl sm:text-5xl lg:text-[52px] font-light tracking-tight text-white leading-[1.08]">
                {activeTab.heading}
              </h3>

              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-sm font-normal">
                {activeTab.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

