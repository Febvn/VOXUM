import React from 'react';
import { ShinyText } from './react-bits';

export interface StatMetricItem {
  id: string;
  percentage: number;
  title: string;
  subtitle: string;
}

export interface StatsSectionProps {
  id?: string;
  headline?: React.ReactNode;
  description?: string;
  metrics?: StatMetricItem[];
  highlightStat?: {
    percentage: number;
    label: string;
    benchmarkCurrent?: { year: string; percentage: number };
    benchmarkPrevious?: { year: string; percentage: number };
    sampleSizeNote?: string;
  };
  className?: string;
}

const DEFAULT_METRICS: StatMetricItem[] = [
  {
    id: 'word-alignment',
    percentage: 98,
    title: 'Word-level alignment',
    subtitle: 'Sub-second speech decoding with exact start and end timestamps'
  },
  {
    id: 'client-extraction',
    percentage: 100,
    title: 'Client-side extraction',
    subtitle: 'In-browser 16kHz mono PCM conversion from MP4, MP3, and WebM'
  },
  {
    id: 'latency-reduction',
    percentage: 84,
    title: 'Turnaround acceleration',
    subtitle: 'Quantized INT8 inference finishes long recordings in seconds'
  }
];

const SmallProgressRing: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({
  percentage,
  size = 40,
  strokeWidth = 3
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative shrink-0 flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Inactive background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#27272a"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Active progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ffffff"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    </div>
  );
};

export const StatsSection: React.FC<StatsSectionProps> = ({
  id = 'features',
  headline = (
    <>
      <div className="mb-1">
        <ShinyText
          text="The busywork now runs"
          speed={2.5}
          color="#d4d4d8"
          shineColor="#ffffff"
          spread={120}
        />
      </div>
      <div>
        <ShinyText
          text="itself."
          speed={2.5}
          color="#d4d4d8"
          shineColor="#ffffff"
          spread={120}
        />
      </div>
    </>
  ),
  description = 'VOXTUM decodes, aligns, and timestamps audio and video recordings without manual scrubbing or remote cloud retention.',
  metrics = DEFAULT_METRICS,
  highlightStat = {
    percentage: 92,
    label: 'reduction in manual audio transcription time',
    benchmarkCurrent: { year: '2026', percentage: 92 },
    benchmarkPrevious: { year: '2025', percentage: 61 },
    sampleSizeNote: 'Benchmarked across 2,400+ hours of multi-speaker audio'
  },
  className = ''
}) => {
  // Main Concentric Gauge dimensions
  const gaugeSize = 300;
  const center = gaugeSize / 2;

  // Outer ring (2025: 82%)
  const outerRadius = 126;
  const outerStroke = 14;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerOffset =
    outerCircumference - (highlightStat.percentage / 100) * outerCircumference;

  // Inner ring (2024: 54%)
  const innerRadius = 96;
  const innerStroke = 4.5;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const previousPct = highlightStat.benchmarkPrevious?.percentage ?? 54;
  const innerOffset =
    innerCircumference - (previousPct / 100) * innerCircumference;

  return (
    <section
      id={id}
      aria-label="Operational Autonomy Metrics"
      className={`w-full bg-black text-white py-20 sm:py-28 px-4 sm:px-8 lg:px-12 border-t border-zinc-800/80 font-['Geist',system-ui,-apple-system,sans-serif] select-none ${className}`}
    >
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Column: Headline, Description & 3 Metric Rows */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Main Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-medium tracking-tight text-white leading-[1.1] mb-5">
              {headline}
            </h2>

            {/* Subtitle Description */}
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mb-10">
              {description}
            </p>

            {/* Metric Rows */}
            <div className="w-full divide-y divide-zinc-800/80 border-t border-b border-zinc-800/80">
              {metrics.map((item) => (
                <div
                  key={item.id}
                  className="py-4 sm:py-5 flex items-center justify-between gap-4 group transition-colors"
                >
                  {/* Left: Ring Indicator + Text */}
                  <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                    <SmallProgressRing
                      percentage={item.percentage}
                      size={40}
                      strokeWidth={3}
                    />
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-medium text-white tracking-tight">
                        {item.title}
                      </div>
                      <div className="text-xs sm:text-[13px] text-zinc-400 leading-snug mt-0.5 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Right: Percentage Value */}
                  <div className="text-right shrink-0">
                    <span className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                      {item.percentage}
                    </span>
                    <span className="text-sm sm:text-base font-normal text-zinc-400 ml-0.5">
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Concentric Gauge Meter */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center pt-4 lg:pt-0">
            {/* Circular Gauge Display */}
            <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${gaugeSize} ${gaugeSize}`}
                className="-rotate-90 overflow-visible"
                aria-hidden="true"
              >
                {/* Outer Inactive Track */}
                <circle
                  cx={center}
                  cy={center}
                  r={outerRadius}
                  stroke="#27272a"
                  strokeWidth={outerStroke}
                  fill="none"
                />

                {/* Outer Active Progress (82%) */}
                <circle
                  cx={center}
                  cy={center}
                  r={outerRadius}
                  stroke="#ffffff"
                  strokeWidth={outerStroke}
                  fill="none"
                  strokeDasharray={outerCircumference}
                  strokeDashoffset={outerOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Inner Concentric Active Progress (2024: 54%) */}
                <circle
                  cx={center}
                  cy={center}
                  r={innerRadius}
                  stroke="#52525b"
                  strokeWidth={innerStroke}
                  fill="none"
                  strokeDasharray={innerCircumference}
                  strokeDashoffset={innerOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Metric Callout Centered inside the Ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl sm:text-7xl font-bold tracking-tight text-white leading-none">
                    {highlightStat.percentage}
                  </span>
                  <span className="text-3xl sm:text-4xl font-normal text-zinc-400 leading-none ml-1">
                    %
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-snug mt-2.5 max-w-[150px]">
                  {highlightStat.label}
                </p>
              </div>
            </div>

            {/* Bottom Legend & Benchmark Metrics */}
            <div className="mt-8 flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-6 text-xs sm:text-sm font-mono tracking-tight">
                {highlightStat.benchmarkCurrent && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-white inline-block" />
                    <span>
                      {highlightStat.benchmarkCurrent.year} · {highlightStat.benchmarkCurrent.percentage}%
                    </span>
                  </div>
                )}
                {highlightStat.benchmarkPrevious && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" />
                    <span>
                      {highlightStat.benchmarkPrevious.year} · {highlightStat.benchmarkPrevious.percentage}%
                    </span>
                  </div>
                )}
              </div>

              {highlightStat.sampleSizeNote && (
                <p className="text-xs text-zinc-500 font-normal tracking-normal mt-1">
                  {highlightStat.sampleSizeNote}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

