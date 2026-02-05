import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const LogoSVG: React.FC<{ size?: number }> = ({ size = 100 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary"
  >
    <path 
      d="M20 80V20H40L50 40L60 20H80V80H65V45L50 70L35 45V80H20Z" 
      fill="currentColor" 
    />
    <path 
      d="M10 90H90V95H10V90Z" 
      fill="currentColor" 
    />
    <circle cx="50" cy="15" r="5" fill="currentColor" />
  </svg>
);

export const LogoMarcenApp: React.FC<LogoProps> = ({ size = 24, className = "" }) => (
  <div className={className} style={{ display: 'inline-block', lineHeight: 0 }}>
    <LogoSVG size={size} />
  </div>
);

export default LogoMarcenApp;
