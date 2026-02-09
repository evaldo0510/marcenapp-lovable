
import React from 'react';

export const LogoSVG: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = "#D97706" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#09090b" />
    <path d="M25 75V25H45L50 40L55 25H75V75H62V40L50 65L38 40V75H25Z" fill="white" />
    <circle cx="50" cy="15" r="4" fill={color} />
  </svg>
);

export const BrandHeading: React.FC<{ children: React.ReactNode; subtitle?: string; align?: "left" | "center" | "right" }> = ({ children, subtitle, align = "left" }) => (
  <div className={`flex flex-col text-${align}`}>
    <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 truncate max-w-[140px] leading-none">
      {children}
    </h1>
    {subtitle && (
      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">
        {subtitle}
      </p>
    )}
  </div>
);
