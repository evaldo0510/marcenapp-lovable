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
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon
          points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
          fill={active ? "url(#hex-grad)" : "rgba(0,122,255,0.05)"}
          stroke={active ? "#007AFF" : "rgba(0,122,255,0.15)"}
          strokeWidth="2"
          filter={active ? "url(#hex-glow)" : undefined}
        />
        <text
          x="50" y="58"
          textAnchor="middle"
          fill={active ? "white" : "rgba(255,255,255,0.4)"}
          fontSize="28"
          fontWeight="900"
          fontFamily="'Inter', sans-serif"
        >
          M
        </text>
      </svg>
      {active && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse" />
      )}
    </div>
  );
}

export default memo(HexLogo);
