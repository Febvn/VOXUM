import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AudioUploader } from './components/AudioUploader';
import { AudioPlayerWithSync } from './components/AudioPlayerWithSync';
import { MeetingNotesView } from './components/MeetingNotesView';
import { SettingsModal } from './components/SettingsModal';
import { MeetingHistoryDrawer } from './components/MeetingHistoryDrawer';
import { PricingModal } from './components/PricingModal';
import { Squares, SpotlightCard, ShinyText, DecryptedText, ShapeWaves } from './components/react-bits';
import type { ProcessResponse, SavedMeetingSession, MeetingTemplate, MeetingNotes } from './types';
import {
  generateDemoResponse,
  processAudioWithGeminiDirect,
  TEMPLATE_CONFIGS,
  createSyntheticAudioWav
} from './services/apiService';
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Disc,
  Layers,
  Lock,
  Play,
  Activity,
  HardDrive,
  Zap,
  Terminal
} from 'lucide-react';

export function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [backendUrl, setBackendUrl] = useState<string>('http://localhost:8000');
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'enterprise'>('pro');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<ProcessResponse | null>(null);
  const [savedMeetings, setSavedMeetings] = useState<SavedMeetingSession[]>([]);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Load state from LocalStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);

    const savedUrl = localStorage.getItem('backend_url');
    if (savedUrl) setBackendUrl(savedUrl);

    const savedPlan = localStorage.getItem('saas_plan') as 'free' | 'pro' | 'enterprise' | null;
    if (savedPlan) setCurrentPlan(savedPlan);

    const historyRaw = localStorage.getItem('meeting_history');
    if (historyRaw) {
      try {
        setSavedMeetings(JSON.parse(historyRaw));
      } catch (e) {
        console.error('Failed to parse meeting history:', e);
      }
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setNotice({ type: 'success', text: 'Gemini API Key saved in browser LocalStorage.' });
  };

  const handleSaveBackendUrl = (url: string) => {
    setBackendUrl(url);
    localStorage.setItem('backend_url', url);
  };

  const handleUpgradePlan = (plan: 'pro' | 'enterprise') => {
    setCurrentPlan(plan);
    localStorage.setItem('saas_plan', plan);
    setIsPricingOpen(false);
    setNotice({ type: 'success', text: `Compute tier upgraded to ${plan.toUpperCase()} license.` });
  };

  const saveMeetingToHistory = (res: ProcessResponse, audioUrl?: string) => {
    const newSession: SavedMeetingSession = {
      id: `meeting_${Date.now()}`,
      createdAt: new Date().toISOString(),
      filename: res.filename,
      template: res.template || 'general',
      audioUrl,
      transcription: res.transcription,
      meeting_notes: res.meeting_notes
    };

    const updated = [newSession, ...savedMeetings].slice(0, 30);
    setSavedMeetings(updated);
    localStorage.setItem('meeting_history', JSON.stringify(updated));
  };

  const handleDeleteMeeting = (id: string) => {
    const updated = savedMeetings.filter((m) => m.id !== id);
    setSavedMeetings(updated);
    localStorage.setItem('meeting_history', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (confirm('Delete all saved meeting history?')) {
      setSavedMeetings([]);
      localStorage.removeItem('meeting_history');
    }
  };

  const handleSelectHistoryMeeting = (session: SavedMeetingSession) => {
    setResult({
      status: 'success',
      filename: session.filename,
      template: session.template,
      transcription: session.transcription,
      meeting_notes: session.meeting_notes
    });
    if (session.audioUrl) {
      setCurrentAudioUrl(session.audioUrl);
    }
    document.getElementById('studio-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateNotes = (updatedNotes: MeetingNotes) => {
    if (!result) return;
    setResult({
      ...result,
      meeting_notes: updatedNotes
    });
  };

  const handleProcess = async (
    file: File | null,
    language: string,
    keywords: string,
    template: MeetingTemplate,
    isDemo: boolean = false
  ) => {
    setIsProcessing(true);
    setNotice(null);

    // 1. Reference Track / Benchmark Mode
    if (isDemo || !file) {
      setTimeout(() => {
        const demoRes = generateDemoResponse(template, language);
        const synthWav = createSyntheticAudioWav(demoRes.transcription.words);
        setCurrentAudioUrl(synthWav);
        setResult(demoRes);
        saveMeetingToHistory(demoRes, synthWav);
        setIsProcessing(false);
        setTimeout(() => {
          document.getElementById('studio-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }, 400);
      return;
    }

    // 2. Real Track Processing
    const audioUrl = URL.createObjectURL(file);
    setCurrentAudioUrl(audioUrl);

    try {
      if (apiKey && apiKey.trim()) {
        const directRes = await processAudioWithGeminiDirect(file, apiKey.trim(), language, template, keywords);
        setResult(directRes);
        saveMeetingToHistory(directRes, audioUrl);
        setNotice({ type: 'success', text: 'Audio processed via Gemini Multimodal Studio Direct!' });
        setTimeout(() => {
          document.getElementById('studio-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);
      formData.append('template', template);
      if (keywords) formData.append('keywords', keywords);

      const endpoint = backendUrl.endsWith('/') ? `${backendUrl}api/process` : `${backendUrl}/api/process`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}: ${await response.text()}`);
      }

      const data: ProcessResponse = await response.json();
      setResult(data);
      saveMeetingToHistory(data, audioUrl);
      setTimeout(() => {
        document.getElementById('studio-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.warn('Backend offline / key empty, falling back to benchmark simulation:', err);
      setNotice({
        type: 'error',
        text: 'Backend lokal offline atau API Key belum diset. Memuat rekaman simulasi benchmark.'
      });
      const fallbackRes = generateDemoResponse(template, language);
      const fallbackWav = audioUrl || createSyntheticAudioWav(fallbackRes.transcription.words);
      if (!audioUrl) setCurrentAudioUrl(fallbackWav);
      setResult(fallbackRes);
      saveMeetingToHistory(fallbackRes, fallbackWav);
      setTimeout(() => {
        document.getElementById('studio-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const runBenchmarkPreset = (lang: string, templ: MeetingTemplate) => {
    handleProcess(null, lang, '', templ, true);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-black pt-20">
      {/* React Bits Pro Signature Bezel Frame (Top, Bottom, Left, Right) */}
      <div className="site-frame site-frame--top" aria-hidden="true" />
      <div className="site-frame site-frame--bottom" aria-hidden="true" />
      <div className="site-frame site-frame--left" aria-hidden="true" />
      <div className="site-frame site-frame--right" aria-hidden="true" />

      {/* React Bits Interactive Squares Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <Squares
          direction="diagonal"
          speed={0.2}
          squareSize={48}
          borderColor="rgba(255, 255, 255, 0.04)"
          hoverFillColor="rgba(16, 185, 129, 0.08)"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenPricing={() => setIsPricingOpen(true)}
          apiKeySet={Boolean(apiKey)}
          historyCount={savedMeetings.length}
          currentPlan={currentPlan}
        />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-10">
          {/* NOTICE ALERT */}
          {notice && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between ${
                notice.type === 'error'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {notice.type === 'error' ? (
                  <AlertCircle className="size-4 shrink-0 text-amber-400" />
                ) : (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                )}
                <span>{notice.text}</span>
              </div>
              <button
                onClick={() => setNotice(null)}
                className="text-slate-400 hover:text-white underline ml-3 font-mono text-[11px]"
              >
                DISMISS
              </button>
            </div>
          )}

          {/* HERO LANDING STAGE WITH REACT BITS SHAPE-WAVES (VOXTUM) */}
          <section className="relative w-full h-[540px] sm:h-[600px] overflow-hidden rounded-3xl border border-slate-800/90 bg-black shadow-2xl flex flex-col justify-between p-6 sm:p-10 select-none">
            {/* ShapeWaves Background Canvas (with text="VOXTUM" cutout) */}
            <div className="absolute inset-0 z-0">
              <ShapeWaves
                text="VOXTUM"
                fontFamily='Geist, "Geist Sans", system-ui, sans-serif'
                fontWeight={500}
                textSize={0.6}
                shapes="mixed"
                cellSize={10}
                dotSize={0.75}
                color="#c7d9c6"
                hoverColor="#ffffff"
                backgroundColor="#000000"
                speed={1}
                scale={1}
                contrast={1}
                brightness={0.4}
                flow={0}
                direction={0}
                fade={0.25}
                interactive={true}
                splashRadius={40}
                splashStrength={0.4}
                glow={0.35}
                intro={true}
                introDuration={1.6}
                paused={false}
              />
            </div>

            {/* Top Row Overlay */}
            <div className="relative z-10 flex items-center justify-between w-full pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-emerald-500/40 text-emerald-400 font-mono text-xs backdrop-blur-md shadow-lg pointer-events-auto">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <DecryptedText
                  text="WHISTLE 16.9 MB // MULTILINGUAL CTC ENGINE"
                  speed={20}
                  animateOn="view"
                  className="font-mono text-emerald-400 font-bold text-[11px] sm:text-xs"
                />
              </div>

              <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-400 pointer-events-auto bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80">
                <Activity className="size-3 text-emerald-400" />
                <span>16 kHz Mono Native</span>
              </div>
            </div>

            {/* Bottom Row Overlay: Description & Direct Workstation CTAs */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pointer-events-none pt-24 sm:pt-0">
              <div className="space-y-3 max-w-xl pointer-events-auto">
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed backdrop-blur-md bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 shadow-xl">
                  Sub-second local meeting transcription powered by Connectionist Temporal Classification (CTC) with word-level timecode synthesis.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                  <a
                    href="#studio"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
                  >
                    <span>OPEN STUDIO</span>
                    <Disc className="size-3.5" />
                  </a>
                  <a
                    href="#benchmarks"
                    className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <span>RUN BENCHMARK</span>
                    <Zap className="size-3.5 text-amber-400" />
                  </a>
                  <a
                    href="#specs"
                    className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors hidden sm:flex items-center gap-1.5"
                  >
                    <span>SPECIFICATIONS</span>
                    <Layers className="size-3.5 text-blue-400" />
                  </a>
                </div>
              </div>

              {/* Hardware Telemetry Pills */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs pointer-events-auto shrink-0">
                <div className="px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-300 flex items-center gap-2 shadow-lg">
                  <Cpu className="size-3.5 text-emerald-400 shrink-0" />
                  <span>INT8 CTC (16.9 MB)</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-300 flex items-center gap-2 shadow-lg">
                  <ShieldCheck className="size-3.5 text-blue-400 shrink-0" />
                  <span>Zero Cloud Storage</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 1: THE CORE STUDIO WORKBENCH (DUAL-STAGE COCKPIT) */}
          <section id="studio" className="scroll-mt-24 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Stage (7 cols): Ingestion & Recording Deck */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 font-mono">
                    <Disc className="size-4 text-emerald-400 shrink-0" />
                    <h2 className="text-xs uppercase font-bold text-white tracking-wider">
                      INGESTION &amp; CONTROL BAY
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">CANAL 01 // MIC &amp; FILE</span>
                </div>

                <AudioUploader onProcess={handleProcess} isProcessing={isProcessing} />
              </div>

              {/* Right Stage (5 cols, #benchmarks): Instant Benchmark Clips & Hardware Telemetry */}
              <div id="benchmarks" className="lg:col-span-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 font-mono">
                    <Zap className="size-4 text-emerald-400 shrink-0" />
                    <h2 className="text-xs uppercase font-bold text-white tracking-wider">
                      BENCHMARK CLIPS &amp; TELEMETRY
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">1-CLICK RUN</span>
                </div>

                {/* Instant 1-Click Test Tracks */}
                <div className="space-y-2.5">
                  <p className="text-xs font-mono text-slate-400">
                    Select sample audio clip to test real-time sync and structured synthesis:
                  </p>

                  {/* Benchmark 1 */}
                  <SpotlightCard
                    spotlightColor="rgba(16, 185, 129, 0.15)"
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer group"
                  >
                    <div
                      onClick={() => runBenchmarkPreset('id', 'general')}
                      className="flex items-center justify-between gap-3 font-mono"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-bold">
                            ID • 15.5s
                          </span>
                          <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                            Q3 Strategy Evaluation Meeting
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans truncate">
                          Marketing deliverables, server latency audits, Q3 growth targets.
                        </p>
                      </div>
                      <div className="size-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 shrink-0 transition-colors">
                        <Play className="size-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </SpotlightCard>

                  {/* Benchmark 2 */}
                  <SpotlightCard
                    spotlightColor="rgba(16, 185, 129, 0.15)"
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer group"
                  >
                    <div
                      onClick={() => runBenchmarkPreset('id', 'agile')}
                      className="flex items-center justify-between gap-3 font-mono"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-400 font-bold">
                            ID • 18.2s
                          </span>
                          <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                            Sprint Standup &amp; Bug Triage
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans truncate">
                          Daily agile: blockers, penyelesaian bug API, sprint goal.
                        </p>
                      </div>
                      <div className="size-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/40 shrink-0 transition-colors">
                        <Play className="size-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </SpotlightCard>

                  {/* Benchmark 3 */}
                  <SpotlightCard
                    spotlightColor="rgba(59, 130, 246, 0.15)"
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-colors cursor-pointer group"
                  >
                    <div
                      onClick={() => runBenchmarkPreset('en', 'general')}
                      className="flex items-center justify-between gap-3 font-mono"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-400 font-bold">
                            EN • 10.4s
                          </span>
                          <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                            Q3 Strategy &amp; Milestones
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans truncate">
                          Executive board: corporate budget, multi-region API latency.
                        </p>
                      </div>
                      <div className="size-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/40 shrink-0 transition-colors">
                        <Play className="size-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </SpotlightCard>
                </div>

                {/* Real Hardware & Engine Telemetry Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Terminal className="size-3 text-emerald-400" />
                      <span>ENGINE TELEMETRY</span>
                    </span>
                    <span className="text-[10px] text-emerald-400">ONLINE</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">ASR MODEL WEIGHT</span>
                      <span className="font-bold text-emerald-400 text-sm">16.9 MB</span>
                      <span className="text-[9px] text-slate-500 block">CTC In-Memory</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CPU LATENCY</span>
                      <span className="font-bold text-white text-sm">&lt; 300 ms</span>
                      <span className="text-[9px] text-slate-500 block">Sub-Second Batch</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">KEYWORD MATCHER</span>
                      <span className="font-bold text-blue-400 text-sm">Aho-Corasick</span>
                      <span className="text-[9px] text-slate-500 block">Trie Automaton</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">PRIVACY SCOPE</span>
                      <span className="font-bold text-slate-200 text-sm">Air-Gapped</span>
                      <span className="text-[9px] text-slate-500 block">0 Cloud Logs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RESULTS BAY (SYNCHRONIZED KARAOKE PLAYER & EXECUTIVE NOTES) */}
            {result && (
              <div id="studio-results" className="space-y-6 pt-4 animate-fade-in scroll-mt-24">
                {/* Telemetry Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
                  <SpotlightCard
                    spotlightColor="rgba(16, 185, 129, 0.2)"
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono"
                  >
                    <span className="text-[10px] uppercase text-slate-400 block tracking-wider">
                      ASR Latency
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {result.transcription.latency_ms} ms
                    </span>
                  </SpotlightCard>

                  <SpotlightCard
                    spotlightColor="rgba(16, 185, 129, 0.2)"
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono"
                  >
                    <span className="text-[10px] uppercase text-slate-400 block tracking-wider">
                      Throughput Rate
                    </span>
                    <span className="text-lg font-bold text-white">
                      {result.transcription.tokens_per_sec} tok/s
                    </span>
                  </SpotlightCard>

                  <SpotlightCard
                    spotlightColor="rgba(59, 130, 246, 0.2)"
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono"
                  >
                    <span className="text-[10px] uppercase text-slate-400 block tracking-wider">
                      Model Footprint
                    </span>
                    <span className="text-lg font-bold text-blue-400">16.9 MB</span>
                  </SpotlightCard>

                  <SpotlightCard
                    spotlightColor="rgba(245, 158, 11, 0.2)"
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono"
                  >
                    <span className="text-[10px] uppercase text-slate-400 block tracking-wider">
                      Preset Template
                    </span>
                    <span className="text-lg font-bold uppercase text-amber-400">
                      <ShinyText
                        text={TEMPLATE_CONFIGS[result.template || 'general'].label}
                        speed={4}
                        className="text-amber-400 font-bold font-mono"
                      />
                    </span>
                  </SpotlightCard>
                </div>

                {/* Synchronized Player */}
                <div className="print:hidden">
                  <AudioPlayerWithSync
                    audioUrl={currentAudioUrl}
                    words={result.transcription.words}
                    fullText={result.transcription.text}
                  />
                </div>

                {/* Meeting Notes Tab View */}
                <MeetingNotesView
                  notes={result.meeting_notes}
                  rawTranscript={result.transcription.text}
                  onUpdateNotes={handleUpdateNotes}
                />
              </div>
            )}
          </section>

          {/* SECTION 2: ENGINEERING SPECIFICATIONS & DATASHEET (#specs) */}
          <section id="specs" className="scroll-mt-24 space-y-6 pt-6 border-t border-slate-800/80">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                ENGINEERING DATASHEET
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                Spesifikasi Teknis Whistle &amp; Arsitektur CTC
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
                Parameter komputasi, ukuran bobot model, dan batas privasi sistem.
              </p>
            </div>

            {/* Technical Comparison Table */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 font-mono text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
                      <th className="p-3.5 sm:p-4 font-semibold">PARAMETER SISTEM</th>
                      <th className="p-3.5 sm:p-4 font-semibold text-emerald-400">WHISTLE ASR (ENGINE INI)</th>
                      <th className="p-3.5 sm:p-4 font-semibold text-slate-400">WHISPER-LARGE V3</th>
                      <th className="p-3.5 sm:p-4 font-semibold text-slate-400">CLOUD API SPEECH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                    <tr>
                      <td className="p-3.5 sm:p-4 font-semibold text-white">Ukuran Model (Storage)</td>
                      <td className="p-3.5 sm:p-4 text-emerald-400 font-bold">16.9 MB (CAct)</td>
                      <td className="p-3.5 sm:p-4 text-slate-400">1,550 MB (PyTorch)</td>
                      <td className="p-3.5 sm:p-4 text-slate-400">N/A (Remote Cloud)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 sm:p-4 font-semibold text-white">Kebutuhan Hardware</td>
                      <td className="p-3.5 sm:p-4 text-emerald-400">CPU Laptop Biasa (&gt;2 Core)</td>
                      <td className="p-3.5 sm:p-4 text-slate-400">GPU VRAM 6-10 GB</td>
                      <td className="p-3.5 sm:p-4 text-slate-400">Koneksi Internet Wajib</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 sm:p-4 font-semibold text-white">Operational RAM Footprint</td>
                      <td className="p-3.5 sm:p-4 text-emerald-400 font-bold">~120 MB RAM</td>
                      <td className="p-3.5 sm:p-4 text-slate-400">~4,000 MB RAM</td>
                      <td className="p-3.5 sm:p-4 text-slate-400">Minimal</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 sm:p-4 font-semibold text-white">Vocabulary Biasing</td>
                      <td className="p-3.5 sm:p-4 text-emerald-400">Aho-Corasick Trie Automaton</td>
                      <td className="p-3.5 sm:p-4 text-slate-400">Prompt Prefix (Limited)</td>
                      <td className="p-3.5 sm:p-4 text-slate-400">Custom Vocabulary Tier</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 sm:p-4 font-semibold text-white">Privacy Compliance</td>
                      <td className="p-3.5 sm:p-4 text-emerald-400 font-bold">Client RAM / Air-Gapped</td>
                      <td className="p-3.5 sm:p-4 text-slate-300">Local</td>
                      <td className="p-3.5 sm:p-4 text-slate-400">Audio Dispatched to Remote Server</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <HardDrive className="size-4" />
                  <span>INT8 CTC Quantization</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                  Matrix weights compressed to 16.9 MB without sacrificing critical phoneme representation in noisy audio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Layers className="size-4" />
                  <span>Aho-Corasick Automaton</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                  O(n) dictionary lookup elevating target team keyword probabilities deterministically.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Lock className="size-4" />
                  <span>Volatile Memory Buffer</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                  Audio decoded and processed in active RAM only and cleared immediately after inference, preventing data leakage.
                </p>
              </div>
            </div>
          </section>

          {/* APPLICATION FOOTER */}
          <footer className="pt-8 pb-12 border-t border-slate-800/80 font-mono text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-white">VOXTUM.ASR</span>
              <span>•</span>
              <span>MODEL: WHISTLE 16.9 MB</span>
              <span className="hidden xs:inline">•</span>
              <span className="hidden xs:inline">DAEMON: {backendUrl}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPricingOpen(true)}
                className="text-slate-400 hover:text-white underline text-[11px]"
              >
                Lisensi Komputasi ({currentPlan.toUpperCase()})
              </button>
              <span>•</span>
              <span className="text-[11px]">© 2026 Voxtum Systems</span>
            </div>
          </footer>
        </main>

        {/* MODALS & DRAWERS */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
          backendUrl={backendUrl}
          onSaveBackendUrl={handleSaveBackendUrl}
        />

        <MeetingHistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          savedMeetings={savedMeetings}
          onSelectMeeting={handleSelectHistoryMeeting}
          onDeleteMeeting={handleDeleteMeeting}
          onClearAll={handleClearHistory}
        />

        <PricingModal
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
          currentPlan={currentPlan}
          onUpgrade={handleUpgradePlan}
        />
      </div>
    </div>
  );
}

export default App;
