import React, { memo } from 'react';

function HexLogo({ size = 48, active = false, onClick, className = '' }) {
  return (
    <div
      className={`relative cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <defs>
          <linearGradient id="hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#007AFF" />
            <stop offset="100%" stopColor="#0055CC" />
          </linearGradient>
          <filter id="hex-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="50" cy="50" r="45"
          fill={active ? "url(#hex-grad)" : "rgba(0,122,255,0.02)"}
          stroke={active ? "#007AFF" : "rgba(0,122,255,0.1)"}
          strokeWidth="1.5"
          filter={active ? "url(#hex-glow)" : undefined}
        />
        <circle
          cx="50" cy="50" r="38"
          fill="none"
          stroke={active ? "rgba(255,255,255,0.2)" : "rgba(0,122,255,0.05)"}
          strokeWidth="1"
          strokeDasharray="4 2"
        />
        <text
          x="50" y="58"
          textAnchor="middle"
          fill={active ? "white" : "rgba(0,122,255,0.3)"}
          fontSize="32"
          fontWeight="900"
          fontFamily="'Orbitron', sans-serif"
          className="tracking-tighter"
        >
          I
        </text>
      </svg>
      {active && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse" />
      )}
    </div>
  );
}

export default memo(HexLogo);
