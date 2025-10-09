"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Chrome, Eye, EyeOff, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
// Ajusta las rutas de importación según tu estructura
// import { supabase } from '../../config/database';
// import { OAUTH_CONFIG } from '../../config/oauth';
// import { useAuth } from '../../contexts/AuthContext';
import { SignIn } from '@clerk/nextjs';
// import { useNotifications } from '../../hooks/useNotifications';

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
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                    <div className="w-4 h-4 bg-emerald-500 rounded-sm" />
                                </div>
                            </div>
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Bienvenido de vuelta a
                            <span className="block bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                                RouterAI
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            El router inteligente de modelos de IA que optimiza costo, velocidad y calidad para tus aplicaciones.
                        </p>
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-300">99.9% de tiempo de actividad</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-300">Enrutamiento multi-proveedor</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-300">Optimización de costos en tiempo real</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Iniciar sesión</h2>
                            <p className="text-gray-400">Accede a tu panel de RouterAI</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
                            <SignIn appearance={{
                                elements: {
                                    formButtonPrimary: "w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group",
                                    card: "bg-transparent shadow-none border-none",
                                    headerTitle: "text-3xl font-bold text-white mb-2",
                                    headerSubtitle: "text-gray-400",
                                    socialButtonsBlockButton: "w-full bg-white/5 border border-white/10 text-white py-2 px-4 rounded-xl font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed",
                                    footerActionText: "text-gray-400",
                                    footerActionLink: "font-medium text-emerald-400 hover:text-emerald-300 transition-colors",
                                    formFieldInput: "w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 transition-all duration-300 placeholder-gray-500 focus:outline-none backdrop-blur-sm",
                                    formFieldLabel: "block text-sm font-medium text-gray-300 mb-2",
                                }
                            }} redirectUrl="/admin" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
