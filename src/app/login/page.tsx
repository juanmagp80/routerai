"use client";

import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoginPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)`
                }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            <div className="relative z-10 min-h-screen flex">
                <motion.div
                    className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="max-w-md">
                        <motion.div className="mb-8" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                            <div className="w-16 h-16 mb-6">
                                <svg
                                    width="64"
                                    height="64"
                                    viewBox="0 0 64 64"
                                    className="transition-all duration-300 hover:scale-105"
                                >
                                    <defs>
                                        <linearGradient id="loginLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="30%" stopColor="#06b6d4" />
                                            <stop offset="70%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                        <linearGradient id="loginNodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#34d399" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                        <linearGradient id="loginConnectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                        <filter id="loginGlow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
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
                                        fill="rgba(15, 23, 42, 0.8)"
                                        stroke="rgba(16, 185, 129, 0.3)"
                                        strokeWidth="2"
                                        className="shadow-lg shadow-emerald-500/25"
                                    />

                                    {/* Neural Network Connections */}
                                    <g className="opacity-70" filter="url(#loginGlow)">
                                        {/* Layer 1 to Center connections */}
                                        <path d="M12 20 Q24 26 32 32" stroke="url(#loginConnectionGradient)" strokeWidth="2" fill="none" />
                                        <path d="M12 32 L32 32" stroke="url(#loginConnectionGradient)" strokeWidth="2" />
                                        <path d="M12 44 Q24 38 32 32" stroke="url(#loginConnectionGradient)" strokeWidth="2" fill="none" />

                                        {/* Center to Layer 2 connections */}
                                        <path d="M32 32 Q40 26 52 20" stroke="url(#loginConnectionGradient)" strokeWidth="2" fill="none" />
                                        <path d="M32 32 L52 32" stroke="url(#loginConnectionGradient)" strokeWidth="2" />
                                        <path d="M32 32 Q40 38 52 44" stroke="url(#loginConnectionGradient)" strokeWidth="2" fill="none" />
                                    </g>

                                    {/* Input Layer Nodes */}
                                    <g filter="url(#loginGlow)">
                                        <circle cx="12" cy="20" r="4" fill="url(#loginNodeGradient)" className="opacity-90" />
                                        <circle cx="12" cy="32" r="4" fill="url(#loginNodeGradient)" className="opacity-90" />
                                        <circle cx="12" cy="44" r="4" fill="url(#loginNodeGradient)" className="opacity-90" />
                                    </g>

                                    {/* Central Router Node */}
                                    <g filter="url(#loginGlow)">
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="8"
                                            fill="url(#loginLogoGradient)"
                                            strokeWidth="2"
                                            stroke="#10b981"
                                            className="opacity-95"
                                        />
                                        <circle cx="32" cy="32" r="3" fill="#ffffff" className="opacity-95" />
                                    </g>

                                    {/* Output Layer Nodes */}
                                    <g filter="url(#loginGlow)">
                                        <circle cx="52" cy="20" r="4" fill="url(#loginNodeGradient)" className="opacity-90" />
                                        <circle cx="52" cy="32" r="4" fill="url(#loginNodeGradient)" className="opacity-90" />
                                        <circle cx="52" cy="44" r="4" fill="url(#loginNodeGradient)" className="opacity-90" />
                                    </g>
                                </svg>
                            </div>
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Welcome back to
                            <span className="block bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                                Roulyx
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            The intelligent AI model router that optimizes cost, speed, and quality for your applications.
                        </p>
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-300">99.9% uptime guarantee</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-300">Multi-provider routing</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-300">Real-time cost optimization</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                            <p className="text-gray-400">Access your Roulyx dashboard</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
                            <SignIn appearance={{
                                elements: {
                                    formButtonPrimary: "w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group",
                                    card: "bg-transparent shadow-none border-none",
                                    headerTitle: "text-3xl font-bold text-white mb-2",
                                    headerSubtitle: "text-gray-400",
                                    socialButtonsBlockButton: "w-full bg-white/5 border border-white/10 text-white py-2 px-4 rounded-xl font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed",
                                    formFieldInput: "w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 transition-all duration-300 placeholder-gray-500 focus:outline-none backdrop-blur-sm",
                                    formFieldLabel: "block text-sm font-medium text-gray-300 mb-2",
                                    // Hide branding elements
                                    footer: "hidden",
                                    footerAction: "hidden",
                                    footerActionText: "hidden",
                                    footerActionLink: "hidden"
                                },
                                variables: {
                                    colorPrimary: "#10b981"
                                }
                            }} redirectUrl="/admin" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
