import React from 'react';

interface VoxtumLogoProps {
  className?: string;
  size?: number;
}

export const VoxtumLogo: React.FC<VoxtumLogoProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="VOXTUM Logo (V-O-X Monogram)"
    >
      {/* Outer Sleek Rounded Container */}
      <rect width="64" height="64" rx="14" fill="#000000" />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="13.25" stroke="#27272a" strokeWidth="1.5" />

      {/* Synergized V + O + X Monogram Structure */}
      {/* 1. The "X" Inverted Upper Diagonal Cross */}
      <path
        d="M20 18 L32 32 L44 18"
        stroke="#71717a"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. The Central "O" Acoustic Orbit Ring */}
      <circle
        cx="32"
        cy="32"
        r="11"
        stroke="#ffffff"
        strokeWidth="3.5"
      />
      {/* Glowing Inner Audio Core for "O" */}
      <circle
        cx="32"
        cy="32"
        r="4.5"
        fill="#ffffff"
      />

      {/* 3. The Dominant "V" Base (completing the lower intersection of "X") */}
      <path
        d="M14 26 L32 50 L50 26"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. Subtle Intersecting Audio Ray Nodes */}
      <circle cx="14" cy="26" r="2" fill="#a1a1aa" />
      <circle cx="50" cy="26" r="2" fill="#a1a1aa" />
      <circle cx="32" cy="50" r="2.5" fill="#ffffff" />
    </svg>
  );
};

export default VoxtumLogo;
