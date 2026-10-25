import { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import type { WordTimestamp } from './types';
import { Navbar } from './components/Navbar';
import { FlatGridWave } from './components/react-bits';
import { useGridSpacing } from './utils/gridSpacing';
import ThreeDButton from './components/ThreeDButton';
import { StatsSection } from './components/StatsSection';
import { AboutSection } from './components/AboutSection';
import { SupportSection } from './components/SupportSection';
import { TranscribeStudio } from './components/TranscribeStudio';
import { ClayContainer } from './components/ClayContainer';
import { PricingSection } from './components/PricingSection';
import { PricingModal } from './components/PricingModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';

export function App() {
  const [gpuError] = useState<string | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('voxtum_gemini_key') || '');
  const [backendUrl, setBackendUrl] = useState<string>(() => localStorage.getItem('voxtum_backend_url') || 'http://localhost:8000');
  const [activePlan, setActivePlan] = useState<string>('free');
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [transcriptFileName, setTranscriptFileName] = useState<string>('voxtum_transcript.txt');
  const [transcriptWords, setTranscriptWords] = useState<WordTimestamp[]>([]);
  const [transcriptSegments, setTranscriptSegments] = useState<{ start: number; end: number; text: string }[]>([]);
  const gridSpacing = useGridSpacing();

  const handleTranscriptionComplete = (
    text: string,
    fileName?: string,
    words?: WordTimestamp[],
    segments?: { start: number; end: number; text: string }[]
  ) => {
    setTranscriptText(text);
    if (fileName) setTranscriptFileName(fileName);
    if (words) setTranscriptWords(words);
    if (segments) setTranscriptSegments(segments);
    const el = document.getElementById('studio-grid-continuation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToStudio = () => {
    const el = document.getElementById('studio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else { 
      setIsPricingModalOpen(true);
    }
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      scrollToPricing();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#120f17] text-zinc-100 flex flex-col items-center p-0 m-0 overflow-x-hidden select-none relative font-['Geist',system-ui,-apple-system,sans-serif]">
      {/* Floating Glassmorphic Navbar */}
      <Navbar
        brandName="VOXTUM"
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
      />

      {gpuError && (
        <aside aria-label="WebGPU notice" className="fixed top-24 z-30 px-4 py-2 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-200 text-xs font-mono max-w-xl text-center shadow-xl">
          WebGPU status: {gpuError}. (Ensure you are using a WebGPU-compatible browser such as Chrome or Edge with hardware acceleration enabled).
        </aside>
      )}

      {/* Full-Screen Landing Hero Container (100% Viewport Height) */}
      <section
        id="hero"
        aria-label="VOXTUM Hero"
        className="relative w-full h-[100dvh] min-h-[700px] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background 2D Planar Orthogonal Grid (Clean static grid, zero distortion/effect, aligned seamlessly to Studio grid) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <FlatGridWave
            lineThickness={2.0}
            linesColor="#f9f6fe"
            lineJitter={0}
            speed={1.0}
            interactive={false}
          />
        </div>

        {/* Hero Central Typography Display & Action CTAs */}
        <div className="relative z-30 flex flex-col items-center justify-center text-center px-4 max-w-full select-none overflow-hidden">
          <h1 className="relative z-30 bg-black px-1 pt-0 pb-2 sm:pb-3 md:pb-4 m-0 inline-block text-[clamp(3.5rem,15vw,21.5rem)] font-black tracking-tighter text-white uppercase drop-shadow-2xl leading-[0.78] max-w-full whitespace-nowrap pointer-events-none">
            VOXTUM
          </h1>
          <p className="-mt-1 sm:-mt-2 md:-mt-3 inline-block bg-black px-2 py-0.5 text-xs sm:text-sm md:text-base font-mono text-zinc-400 tracking-wider uppercase max-w-2xl relative z-30 whitespace-nowrap leading-tight pointer-events-none">
            Audio to Text · Zero Setup
          </p>

          {/* CTA Buttons positioned directly beneath Audio to Text */}
          <div className="mt-8 sm:mt-10 z-30 pointer-events-auto flex items-center justify-center gap-3 sm:gap-6 flex-wrap px-4">
            <ThreeDButton onClick={scrollToStudio}>
              Get Started
            </ThreeDButton>

            <ThreeDButton onClick={scrollToFeatures}>
              Learn More
            </ThreeDButton>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <button
          onClick={scrollToStudio}
          type="button"
          className="absolute bottom-6 sm:bottom-7 z-20 text-white hover:text-zinc-300 transition-all flex items-center justify-center p-2 opacity-90 hover:opacity-100 active:scale-90"
          aria-label="Scroll to transcription studio"
        >
          <ArrowDown className="w-8 h-8 sm:w-9 sm:h-9 text-white animate-bounce stroke-[2.5]" />
        </button>
      </section>

      {/* Interactive Transcription Studio (MP3/MP4 Auto-Convert, Language/Category, Dropdown Results with B/I/U Toolbar) */}
      <TranscribeStudio
        id="studio"
        onTranscriptionComplete={handleTranscriptionComplete}
      />

      {/* Grid Continuation Page directly below Audio Drop (Full screen orthogonal grid with claymorphic container) */}
      <section
        id="studio-grid-continuation"
        aria-label="Studio Grid Continuation"
        className="relative w-full overflow-hidden bg-black select-none min-h-[570px] sm:min-h-[630px]"
        style={{
          height: `${6.18 * gridSpacing}px`,
        }}
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <FlatGridWave
            lineThickness={2.0}
            linesColor="#f9f6fe"
            lineJitter={0}
            speed={1.0}
            interactive={false}
            anchor="top"
          />
        </div>

        {/* Tactile Sculpted Claymorphic Container - 4.18 rows height, micro-adjusted downward */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-auto w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-3rem)] max-w-[1400px] h-[calc(100%-3.5rem)] sm:h-[calc(100%-4.5rem)] max-h-[705px]"
          style={{
            top: `${1 * gridSpacing}px`,
            width: typeof window !== 'undefined' && window.innerWidth >= 8 * gridSpacing ? `${8 * gridSpacing}px` : undefined,
            height: typeof window !== 'undefined' && window.innerWidth >= 8 * gridSpacing ? `${4.18 * gridSpacing}px` : undefined,
          }}
        >
          <ClayContainer
            className="w-full h-full"
            transcriptText={transcriptText}
            onTranscriptChange={setTranscriptText}
            fileName={transcriptFileName}
            words={transcriptWords}
            segments={transcriptSegments}
          />
        </div>
      </section>

      {/* Autonomous Controls & Operational Stats Section (matches uploaded screenshot) */}
      <StatsSection id="features" />

      {/* About Section: Values & Global Vision (matches uploaded screenshot) */}
      <AboutSection id="about" />

      {/* Help & Support Center (matches uploaded screenshot with strictly square borders) */}
      <SupportSection id="support" />

      {/* Pricing Section (matches uploaded screenshot) */}
      <PricingSection
        onSelectPlan={(plan) => {
          setActivePlan(plan);
          alert(`Selected Plan: ${plan.toUpperCase()}`);
        }}
      />

      {/* Modal Popup option when triggered from Navbar */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentPlan={activePlan as 'free' | 'pro' | 'enterprise'}
        onUpgrade={(plan) => {
          setActivePlan(plan);
          setIsPricingModalOpen(false);
        }}
      />

      {/* Settings Modal (Gemini API Key & Backend Endpoint Configuration) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={(key) => {
          setApiKey(key);
          localStorage.setItem('voxtum_gemini_key', key);
        }}
        backendUrl={backendUrl}
        onSaveBackendUrl={(url) => {
          setBackendUrl(url);
          localStorage.setItem('voxtum_backend_url', url);
        }}
      />

      {/* Editorial Dark Footer with PELUIT watermark */}
      <Footer />
    </div>
  );
}

export default App;
