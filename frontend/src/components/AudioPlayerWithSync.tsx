import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Search, Copy, Check, Volume2, VolumeX, Activity } from 'lucide-react';
import { SpotlightCard, DecryptedText } from './react-bits';
import type { WordTimestamp } from '../types';

interface AudioPlayerWithSyncProps {
  audioUrl?: string;
  words: WordTimestamp[];
  fullText: string;
}

export const AudioPlayerWithSync: React.FC<AudioPlayerWithSyncProps> = ({ audioUrl, words, fullText }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () =>
      setDuration(audio.duration || (words.length ? words[words.length - 1].end : 0));
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [words]);

  // Smooth auto-scroll to current active word in transcript
  useEffect(() => {
    if (isPlaying && activeWordRef.current && containerRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [currentTime, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTime(time);
    }
  };

  const changeSpeed = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      audioRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    setIsMuted(v === 0);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = v === 0;
    }
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SpotlightCard
      spotlightColor="rgba(16, 185, 129, 0.12)"
      className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5"
    >
      {/* Hidden audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Audio Controller Bar */}
      <div className="bg-slate-950/80 rounded-xl p-3 sm:p-4 border border-slate-800 flex flex-col gap-3">
        {/* Top Transport & Timeline Row */}
        <div className="flex items-center gap-3 w-full">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="size-10 sm:size-11 rounded-none bg-white hover:bg-zinc-200 flex items-center justify-center text-black shadow-md transition-transform active:scale-95 shrink-0"
          >
            {isPlaying ? <Pause className="size-4 sm:size-5 fill-current" /> : <Play className="size-4 sm:size-5 fill-current ml-0.5" />}
          </button>

          {/* Waveform Visualizer Animation */}
          <div className="hidden sm:flex items-center gap-0.5 h-6 px-1 shrink-0">
            {[40, 70, 30, 90, 60, 80, 45, 95].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-none transition-all duration-150 ${
                  isPlaying ? 'bg-white' : 'bg-slate-700'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : '20%',
                  animationDelay: `${i * 70}ms`
                }}
              />
            ))}
          </div>

          {/* Timeline Slider */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-[11px] sm:text-xs font-mono text-slate-400 shrink-0">{formatSecs(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || (words.length ? words[words.length - 1].end : 100)}
              step={0.1}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-none appearance-none cursor-pointer accent-white min-w-0"
            />
            <span className="text-[11px] sm:text-xs font-mono text-slate-400 shrink-0">
              {formatSecs(duration || (words.length ? words[words.length - 1].end : 0))}
            </span>
          </div>
        </div>

        {/* Bottom Utility Controls Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-900 font-mono text-xs">
          {/* Volume Control */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <button onClick={toggleMute} className="hover:text-white p-1">
              {isMuted || volume === 0 ? <VolumeX className="size-3.5 text-red-400" /> : <Volume2 className="size-3.5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-14 sm:w-20 h-1 bg-slate-800 rounded-none appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Toggle */}
            <button
              onClick={changeSpeed}
              className="text-[11px] sm:text-xs font-mono font-semibold px-2 py-1 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              {playbackRate}x
            </button>

            {/* Copy Button */}
            <button
              onClick={copyTranscript}
              className="text-[11px] sm:text-xs flex items-center gap-1 px-2.5 py-1 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors font-mono"
            >
              {copied ? <Check className="size-3 text-white" /> : <Copy className="size-3" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2 font-mono">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
            <Activity className="size-3.5 sm:size-4 text-white shrink-0" />
            <DecryptedText text="KARAOKE TIMECODE SYNC" speed={25} animateOn="view" className="text-white font-mono text-xs" />
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Tap any word token to scrub playback position</p>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="size-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audio token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-none text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-white w-full font-mono"
          />
        </div>
      </div>

      {/* Word-Synchronized Stream with auto-scroll container */}
      <div
        ref={containerRef}
        className="max-h-56 sm:max-h-72 overflow-y-auto p-3 sm:p-4 bg-slate-950/60 rounded-none border border-slate-800/80 leading-relaxed text-xs sm:text-sm select-text scroll-smooth"
      >
        {words && words.length > 0 ? (
          <div className="flex flex-wrap gap-x-1 sm:gap-x-1.5 gap-y-1.5 sm:gap-y-2">
            {words.map((w, idx) => {
              const isCurrent = currentTime >= w.start && currentTime <= w.end;
              const matchesSearch = searchQuery && w.word.toLowerCase().includes(searchQuery.toLowerCase());

              return (
                <span
                  key={idx}
                  ref={isCurrent ? activeWordRef : null}
                  onClick={() => seekTo(w.start)}
                  className={`cursor-pointer px-1 py-0.5 rounded-none transition-all ${
                    isCurrent
                      ? 'bg-white text-black font-bold scale-105 shadow-sm shadow-white/20'
                      : matchesSearch
                      ? 'bg-amber-400/20 text-amber-300 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`${w.start}s - ${w.end}s (Prob: ${(w.probability * 100).toFixed(0)}%)`}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-xs font-mono">{fullText || 'NO TRANSCRIPTION TEXT'}</p>
        )}
      </div>
    </SpotlightCard>
  );
};

export default AudioPlayerWithSync;
