import React from 'react';

interface AuthLogoProps {
  size?: number;
  className?: string;
}

export function AuthLogo({ size = 64, className = "" }: AuthLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className="transition-all duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="authLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="30%" stopColor="#06b6d4" />
            <stop offset="70%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="authNodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="authConnectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="authGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Circle */}
        <circle 
          cx="32" 
          cy="32" 
          r="30" 
          fill="#0f172a" 
          stroke="#1e293b" 
          strokeWidth="2" 
          opacity="0.9"
        />

        {/* Neural Network Connections */}
        <g className="opacity-60" filter="url(#authGlow)">
          {/* Layer 1 to Center connections */}
          <path 
            d="M12 20 Q24 26 32 32" 
            stroke="url(#authConnectionGradient)" 
            strokeWidth="2" 
            fill="none" 
          />
          <path 
            d="M12 32 L32 32" 
            stroke="url(#authConnectionGradient)" 
            strokeWidth="2" 
          />
          <path 
            d="M12 44 Q24 38 32 32" 
            stroke="url(#authConnectionGradient)" 
            strokeWidth="2" 
            fill="none" 
          />
          
          {/* Center to Layer 2 connections */}
          <path 
            d="M32 32 Q40 26 52 20" 
            stroke="url(#authConnectionGradient)" 
            strokeWidth="2" 
            fill="none" 
          />
          <path 
            d="M32 32 L52 32" 
            stroke="url(#authConnectionGradient)" 
            strokeWidth="2" 
          />
          <path 
            d="M32 32 Q40 38 52 44" 
            stroke="url(#authConnectionGradient)" 
            strokeWidth="2" 
            fill="none" 
          />
        </g>

        {/* Input Layer Nodes */}
        <g filter="url(#authGlow)">
          <circle cx="12" cy="20" r="4" fill="url(#authNodeGradient)" className="opacity-80" />
          <circle cx="12" cy="32" r="4" fill="url(#authNodeGradient)" className="opacity-80" />
          <circle cx="12" cy="44" r="4" fill="url(#authNodeGradient)" className="opacity-80" />
        </g>

        {/* Central Router Node */}
        <g filter="url(#authGlow)">
          <circle
            cx="32"
            cy="32"
            r="8"
            fill="url(#authLogoGradient)"
            strokeWidth="2"
            stroke="#10b981"
            className="opacity-95"
          />
          {/* Inner core */}
          <circle
            cx="32"
            cy="32"
            r="3"
            fill="#ffffff"
            className="opacity-90"
          />
        </g>

        {/* Output Layer Nodes */}
        <g filter="url(#authGlow)">
          <circle cx="52" cy="20" r="4" fill="url(#authNodeGradient)" className="opacity-80" />
          <circle cx="52" cy="32" r="4" fill="url(#authNodeGradient)" className="opacity-80" />
          <circle cx="52" cy="44" r="4" fill="url(#authNodeGradient)" className="opacity-80" />
        </g>
      </svg>
    </div>
  );
}