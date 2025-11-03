import React from 'react';

interface RoulyxLogoProps {
    size?: number;
    className?: string;
    animated?: boolean;
    variant?: 'full' | 'minimal' | 'icon';
}

export const RoulyxLogo: React.FC<RoulyxLogoProps> = ({
    size = 40,
    className = "",
    animated = true,
    variant = 'full'
}) => {
    const logoId = `logo-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`relative group ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 40 40"
                className={`transition-all duration-300 ${animated ? 'group-hover:scale-110' : ''}`}
            >
                <defs>
                    <linearGradient id={`logoGradient-${logoId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="30%" stopColor="#06b6d4" />
                        <stop offset="70%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id={`nodeGradient-${logoId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id={`connectionGradient-${logoId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <filter id={`glow-${logoId}`}>
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id={`centerGlow-${logoId}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Neural Network Connections */}
                <g className="opacity-50" filter={`url(#glow-${logoId})`}>
                    {/* Layer 1 to Center connections */}
                    <path
                        d="M6 10 Q15 15 20 20"
                        stroke={`url(#connectionGradient-${logoId})`}
                        strokeWidth="1.5"
                        fill="none"
                        className={animated ? "animate-pulse" : ""}
                        style={{ animationDelay: '0s' }}
                    />
                    <path
                        d="M6 20 L20 20"
                        stroke={`url(#connectionGradient-${logoId})`}
                        strokeWidth="1.5"
                        className={animated ? "animate-pulse" : ""}
                        style={{ animationDelay: '0.3s' }}
                    />
                    <path
                        d="M6 30 Q15 25 20 20"
                        stroke={`url(#connectionGradient-${logoId})`}
                        strokeWidth="1.5"
                        fill="none"
                        className={animated ? "animate-pulse" : ""}
                        style={{ animationDelay: '0.6s' }}
                    />

                    {/* Center to Layer 2 connections */}
                    <path
                        d="M20 20 Q25 15 34 10"
                        stroke={`url(#connectionGradient-${logoId})`}
                        strokeWidth="1.5"
                        fill="none"
                        className={animated ? "animate-pulse" : ""}
                        style={{ animationDelay: '0.9s' }}
                    />
                    <path
                        d="M20 20 L34 20"
                        stroke={`url(#connectionGradient-${logoId})`}
                        strokeWidth="1.5"
                        className={animated ? "animate-pulse" : ""}
                        style={{ animationDelay: '1.2s' }}
                    />
                    <path
                        d="M20 20 Q25 25 34 30"
                        stroke={`url(#connectionGradient-${logoId})`}
                        strokeWidth="1.5"
                        fill="none"
                        className={animated ? "animate-pulse" : ""}
                        style={{ animationDelay: '1.5s' }}
                    />

                    {variant === 'full' && (
                        <>
                            {/* Cross connections for complexity */}
                            <path d="M6 10 Q12 22 20 20" stroke={`url(#connectionGradient-${logoId})`} strokeWidth="0.8" fill="none" className="opacity-40" />
                            <path d="M6 30 Q12 18 20 20" stroke={`url(#connectionGradient-${logoId})`} strokeWidth="0.8" fill="none" className="opacity-40" />
                        </>
                    )}
                </g>

                {/* Input Layer Nodes */}
                <g filter={`url(#glow-${logoId})`}>
                    <circle cx="6" cy="10" r="2.5" fill={`url(#nodeGradient-${logoId})`} className="opacity-80">
                        {animated && <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" begin="0s" />}
                    </circle>
                    <circle cx="6" cy="20" r="2.5" fill={`url(#nodeGradient-${logoId})`} className="opacity-80">
                        {animated && <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" begin="0.7s" />}
                    </circle>
                    <circle cx="6" cy="30" r="2.5" fill={`url(#nodeGradient-${logoId})`} className="opacity-80">
                        {animated && <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" begin="1.4s" />}
                    </circle>
                </g>

                {/* Central Router Node */}
                <g filter={`url(#centerGlow-${logoId})`}>
                    <circle
                        cx="20"
                        cy="20"
                        r="5"
                        fill={`url(#logoGradient-${logoId})`}
                        strokeWidth="2"
                        stroke="#10b981"
                        className={animated ? "animate-pulse opacity-90" : "opacity-90"}
                    />
                    {/* Inner core */}
                    <circle
                        cx="20"
                        cy="20"
                        r="2"
                        fill="#ffffff"
                        className="opacity-90"
                    >
                        {animated && <animate attributeName="r" values="1.5;2.5;1.5" dur="1.5s" repeatCount="indefinite" />}
                    </circle>
                </g>

                {/* Output Layer Nodes */}
                <g filter={`url(#glow-${logoId})`}>
                    <circle cx="34" cy="10" r="2.5" fill={`url(#nodeGradient-${logoId})`} className="opacity-80">
                        {animated && <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" begin="1s" />}
                    </circle>
                    <circle cx="34" cy="20" r="2.5" fill={`url(#nodeGradient-${logoId})`} className="opacity-80">
                        {animated && <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" begin="1.7s" />}
                    </circle>
                    <circle cx="34" cy="30" r="2.5" fill={`url(#nodeGradient-${logoId})`} className="opacity-80">
                        {animated && <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" begin="0.4s" />}
                    </circle>
                </g>

                {/* Outer Neural Pulse */}
                {animated && (
                    <circle
                        cx="20"
                        cy="20"
                        r="8"
                        fill="none"
                        stroke={`url(#logoGradient-${logoId})`}
                        strokeWidth="0.5"
                        className="animate-ping opacity-20"
                    />
                )}

                {/* Data Flow Indicators */}
                {animated && variant === 'full' && (
                    <g className="opacity-70">
                        <circle cx="13" cy="15" r="1" fill="#34d399">
                            <animateMotion dur="3s" repeatCount="indefinite" path="M0,0 Q7,5 14,0" />
                        </circle>
                        <circle cx="13" cy="25" r="1" fill="#06b6d4">
                            <animateMotion dur="3s" repeatCount="indefinite" begin="1s" path="M0,0 Q7,-5 14,0" />
                        </circle>
                    </g>
                )}
            </svg>
        </div>
    );
};

export default RoulyxLogo;