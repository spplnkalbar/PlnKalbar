import React, { useState } from 'react';

interface SpPlnLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  alt?: string;
}

export function SpPlnVectorLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 210" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="Logo Resmi SP PLN"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="100" y1="0" x2="100" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#860120" />
          <stop offset="50%" stopColor="#A30528" />
          <stop offset="100%" stopColor="#5E0015" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF1B8" />
          <stop offset="35%" stopColor="#F5B800" />
          <stop offset="70%" stopColor="#D99B00" />
          <stop offset="100%" stopColor="#FFE58F" />
        </linearGradient>
        <linearGradient id="blueGrad" x1="100" y1="40" x2="100" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B4B8C" />
          <stop offset="100%" stopColor="#05264B" />
        </linearGradient>
        <linearGradient id="lightningGrad" x1="70" y1="45" x2="130" y2="155" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF4D4F" />
          <stop offset="50%" stopColor="#D91638" />
          <stop offset="100%" stopColor="#9E001C" />
        </linearGradient>
        <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Outer Shield with Gold Border */}
      <path
        d="M100 8 C155 8 188 32 188 88 C188 152 135 190 100 204 C65 190 12 152 12 88 C12 32 45 8 100 8 Z"
        fill="url(#shieldGrad)"
        stroke="url(#goldGrad)"
        strokeWidth="6"
        filter="url(#dropShadow)"
      />

      {/* Inner Decorative Shield Contour */}
      <path
        d="M100 18 C148 18 176 40 176 90 C176 144 130 178 100 190 C70 178 24 144 24 90 C24 40 52 18 100 18 Z"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="2"
        strokeDasharray="4 2"
        opacity="0.85"
      />

      {/* Center Circular Emblem */}
      <circle cx="100" cy="96" r="54" fill="url(#blueGrad)" stroke="url(#goldGrad)" strokeWidth="4" />
      <circle cx="100" cy="96" r="48" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />

      {/* Classic 3-Wave Energy Bars (PLN Heritage) */}
      <path d="M62 82 Q80 76 100 82 Q120 88 138 82" stroke="#40A9FF" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M62 96 Q80 90 100 96 Q120 102 138 96" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M62 110 Q80 104 100 110 Q120 116 138 110" stroke="#40A9FF" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Bold Red Lightning Bolt */}
      <path
        d="M108 48 L76 98 L98 98 L88 144 L126 90 L102 90 L116 48 Z"
        fill="url(#lightningGrad)"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinejoin="round"
        filter="url(#dropShadow)"
      />

      {/* Header Banner Text: SERIKAT PEKERJA */}
      <text
        x="100"
        y="34"
        textAnchor="middle"
        fill="#FFE58F"
        fontSize="11.5"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="1.2"
        filter="url(#dropShadow)"
      >
        SERIKAT PEKERJA
      </text>

      {/* Primary Brand: SP PLN */}
      <rect x="52" y="146" width="96" height="22" rx="6" fill="#0B4B8C" stroke="url(#goldGrad)" strokeWidth="1.5" />
      <text
        x="100"
        y="161.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="13"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="1.5"
      >
        SP PLN
      </text>

      {/* Footer Tagline: KALBAR */}
      <text
        x="100"
        y="182"
        textAnchor="middle"
        fill="#FFE58F"
        fontSize="9.5"
        fontWeight="800"
        fontFamily="sans-serif"
        letterSpacing="1"
      >
        UID KALBAR
      </text>
    </svg>
  );
}

export function SpPlnLogo({ 
  className = "", 
  size = 'md',
  alt = "Logo SP PLN UID Kalimantan Barat"
}: SpPlnLogoProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);

  const fallbackUrls = [
    "https://lh3.googleusercontent.com/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M=w1000",
    "https://drive.google.com/thumbnail?id=1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M&sz=w1000",
    "https://lh3.googleusercontent.com/u/0/d/1NcadbSCAmRCiE3RLjXcEy3cEj3_Hul6M",
  ];

  const sizeClasses = {
    sm: "h-[52px] w-[50px] sm:h-[64px] sm:w-[61px] md:h-[74px] md:w-[71px]",
    md: "h-24 w-auto",
    lg: "h-44 sm:h-52 w-auto",
    xl: "h-56 sm:h-64 w-auto",
    custom: ""
  };

  const appliedClass = `${size !== 'custom' ? sizeClasses[size] : ''} ${className}`.trim();

  if (loadFailed) {
    return (
      <div className={`inline-flex items-center justify-center ${appliedClass}`}>
        <SpPlnVectorLogo className="w-full h-full max-h-full object-contain drop-shadow-md" />
      </div>
    );
  }

  return (
    <img
      src={fallbackUrls[currentSrcIndex]}
      alt={alt}
      className={`${appliedClass} object-contain`}
      referrerPolicy="no-referrer"
      onError={() => {
        if (currentSrcIndex < fallbackUrls.length - 1) {
          setCurrentSrcIndex(prev => prev + 1);
        } else {
          setLoadFailed(true);
        }
      }}
    />
  );
}
