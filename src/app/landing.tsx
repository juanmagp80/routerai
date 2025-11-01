"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle,
  Code,
  RefreshCw,
  Target,
  Timer,
  TrendingDown
} from "lucide-react";
import { useEffect, useState } from "react";

// Componente de navegación minimalista y única
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        isScrolled
          ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3"
          >
            {/* Logo Icon - X with Connection Lines */}
            <div className="relative group">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                className="transition-all duration-300"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Background connection network */}
                <g filter="url(#glow)" className="opacity-40">
                  {/* Horizontal and vertical connection lines */}
                  <path d="M8 20 L32 20" stroke="url(#connectionGradient)" strokeWidth="1" />
                  <path d="M20 8 L20 32" stroke="url(#connectionGradient)" strokeWidth="1" />

                  {/* Diagonal connection lines */}
                  <path d="M12 12 L28 28" stroke="url(#connectionGradient)" strokeWidth="0.8" className="opacity-60" />
                  <path d="M28 12 L12 28" stroke="url(#connectionGradient)" strokeWidth="0.8" className="opacity-60" />
                </g>

                {/* Main X structure */}
                <g filter="url(#glow)">
                  {/* Primary X shape */}
                  <path
                    d="M12 12 L28 28 M28 12 L12 28"
                    stroke="url(#logoGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />

                  {/* Central decision node */}
                  <circle
                    cx="20"
                    cy="20"
                    r="4"
                    fill="url(#logoGradient)"
                    className="animate-pulse opacity-90"
                  />

                  {/* Route decision points */}
                  <circle cx="12" cy="12" r="2" fill="#34d399" className="opacity-80" />
                  <circle cx="28" cy="12" r="2" fill="#34d399" className="opacity-80" />
                  <circle cx="12" cy="28" r="2" fill="#34d399" className="opacity-80" />
                  <circle cx="28" cy="28" r="2" fill="#34d399" className="opacity-80" />
                </g>

                {/* Animated pulse effect */}
                <circle
                  cx="20"
                  cy="20"
                  r="6"
                  fill="none"
                  stroke="url(#logoGradient)"
                  strokeWidth="1"
                  className="animate-ping opacity-20"
                />
              </svg>
            </div>

            {/* Brand name */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-100 bg-clip-text text-transparent">
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-300 bg-clip-text text-transparent font-black">Roulyx</span>
              </span>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Features</a>
            <a href="#ahorro" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Savings</a>
            <a href="#dashboard" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Dashboard</a>
            <a href="/docs" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">API Docs</a>
            <a href="#precios" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">Pricing</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/login"
              className="text-slate-300 hover:text-emerald-400 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-800/50"
            >
              Sign In
            </a>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05, backgroundColor: "#10b981" }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-500 text-slate-900 px-6 py-2 rounded-lg font-bold shadow-lg transition-all duration-300"
            >
              Sign Up
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

// Hero con estilo terminal/código
const HeroSection = () => {
  const [typedText, setTypedText] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const fullText = "curl -X POST https://api.roulyx.com/v1/route";

  useEffect(() => {
    if (currentStep < fullText.length) {
      const timer = setTimeout(() => {
        setTypedText(fullText.slice(0, currentStep + 1));
        setCurrentStep(currentStep + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, fullText]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center relative overflow-hidden pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Animated circuit lines */}
        <svg className="w-full h-full opacity-30">
          <defs>
            <linearGradient id="circuit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06d6a0" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,200 Q400,100 800,200 T1600,200"
            stroke="url(#circuit)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="drop-shadow-lg"
          />
          <motion.path
            d="M0,400 Q600,300 1200,400 T2400,400"
            stroke="url(#circuit)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
            className="drop-shadow-lg"
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-5rem)]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 rounded-full mb-10 backdrop-blur-sm"
            >
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mr-3 animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-300 font-semibold text-sm tracking-wide">🚀 LIVE • Smart routing active</span>
            </motion.div>

            <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tight">
              <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Smart
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                AI Routing
              </span>
              <br />
              <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent">
                that thinks for you
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-slate-300 mb-10 leading-relaxed max-w-4xl">
              The <span className="text-white font-semibold">intelligent API</span> that automatically selects the most efficient AI model for each task.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-bold text-2xl lg:text-3xl">Save up to 70%</span> in costs without sacrificing quality.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 40px rgba(16, 185, 129, 0.6)",
                  background: "linear-gradient(135deg, #10b981, #06d6a0)"
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center group border border-emerald-400/50"
              >
                🚀 Start Free Today
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </motion.button>

              <motion.a
                href="/docs"
                whileHover={{
                  scale: 1.05,
                  borderColor: "#10b981",
                  color: "#10b981",
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-slate-600 text-slate-300 px-10 py-5 rounded-2xl font-bold text-xl backdrop-blur-sm bg-slate-800/30 hover:bg-slate-700/30 transition-all duration-300 inline-flex items-center justify-center group"
              >
                📖 API Documentation
                <motion.div
                  className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform duration-300"
                >
                  <Code className="w-6 h-6" />
                </motion.div>
              </motion.a>
            </div>

            {/* Stats en formato terminal */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { label: "Average savings", value: "70%", color: "text-emerald-400" },
                { label: "Response time", value: "<100ms", color: "text-blue-400" },
                { label: "Supported models", value: "15+", color: "text-purple-400" },
                { label: "Uptime SLA", value: "99.9%", color: "text-orange-400" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                >
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-slate-400 text-sm font-mono">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Terminal simulado */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative order-1 lg:order-2"
          >
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
              {/* Terminal header */}
              <div className="bg-slate-700 px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-400 text-sm font-mono ml-4">roulyx-api</span>
              </div>

              {/* Terminal content */}
              <div className="p-6 font-mono text-sm">
                <div className="text-emerald-400 mb-2">$ {typedText}<span className="animate-pulse">|</span></div>
                <div className="text-slate-400 mb-4">
                  {currentStep >= fullText.length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="text-blue-400">→ Analyzing task...</div>
                      <div className="text-yellow-400">→ Evaluating available models...</div>
                      <div className="text-emerald-400">→ Optimal model: Claude-3 (cost: $0.003)</div>
                      <div className="text-green-400">✓ Response generated • Savings: 68%</div>
                    </motion.div>
                  )}
                </div>

                {currentStep >= fullText.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    className="bg-slate-700 rounded p-4 border-l-4 border-emerald-500"
                  >
                    <div className="text-emerald-400 text-xs mb-2">RESPONSE</div>
                    <div className="text-white">
                      &quot;Document summary generated successfully...&quot;
                    </div>
                    <div className="text-slate-400 text-xs mt-2">
                      Cost: $0.003 • Model: Claude-3 • Time: 89ms
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Sección de router con estilo técnico
const RouterSection = () => {
  return (
    <section id="features" className="py-24 bg-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            The Platform that <span className="text-emerald-600">Thinks</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Advanced technology that analyzes your task and chooses the perfect model based on cost, speed and quality.
          </p>
        </motion.div>

        {/* Diagrama de decisión único */}
        <div className="relative bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-slate-900 rounded-xl p-6 mb-4">
                <Code className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <div className="text-white font-mono text-sm">
                  POST /v1/route
                </div>
                <div className="text-slate-400 text-xs mt-2">
                  {"{ task: 'Resume PDF' }"}
                </div>
              </div>
              <h3 className="font-bold text-slate-900">Your Task</h3>
            </motion.div>

            {/* Router Logic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-emerald-500 rounded-xl p-6 mb-4 relative overflow-hidden">
                <Brain className="w-12 h-12 text-white mx-auto mb-4" />
                <div className="text-white font-bold">Roulyx</div>
                <div className="text-emerald-100 text-xs mt-2">
                  Analyzing...
                </div>

                {/* Animated thinking dots */}
                <div className="absolute top-2 right-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                </div>
              </div>

              {/* Decision factors */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">Cost</div>
                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">Speed</div>
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">Quality</div>
              </div>
            </motion.div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 mb-4">
                <Target className="w-12 h-12 text-white mx-auto mb-4" />
                <div className="text-white font-bold">Claude-3</div>
                <div className="text-blue-100 text-xs mt-2">
                  Optimal for this task
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold mt-2">
                  68% cheaper
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Sección de ahorro con estilo financiero
const SavingsSection = () => {
  return (
    <section id="ahorro" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            <span className="text-emerald-600">Real</span> and <span className="text-emerald-600">Measurable</span> Savings
          </h2>
          <p className="text-xl text-slate-600">
            Real cost comparison: before vs after Roulyx
          </p>
        </motion.div>

        {/* Comparativa visual única */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Antes */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-700">BEFORE</h3>
                <p className="text-red-600">Using only one model</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Monthly cost</span>
                    <span className="text-2xl font-bold text-red-600">$3,200</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Efficiency</span>
                    <span className="text-red-600 font-bold">Low</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Optimization</span>
                    <span className="text-red-600 font-bold">Manual</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Después */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-8 h-8 text-white rotate-180" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-700">AFTER</h3>
                <p className="text-emerald-600">With Roulyx</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Monthly cost</span>
                    <span className="text-2xl font-bold text-emerald-600">$960</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Efficiency</span>
                    <span className="text-emerald-600 font-bold">Maximum</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">Optimization</span>
                    <span className="text-emerald-600 font-bold">Automatic</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge de ahorro */}
            <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-6 py-3 rounded-full font-black text-lg shadow-lg transform rotate-12">
              $2,240 saved!
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Componente de Dashboard con métricas en tiempo real
const DashboardSection = () => {
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [recentTasks, setRecentTasks] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/metrics');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSummary(data.summary || {});
        setRecentTasks(data.recent_tasks || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);

      // Usar datos mock como fallback para la demo
      console.log('Using fallback mock data for demo...');
      setSummary({
        total_cost: 1.588,
        total_requests: 224,
        avg_cost_per_request: 0.007
      });
      setRecentTasks([
        {
          model: "claude-3",
          cost: 0.015,
          latency: 89,
          status: "completed",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          model: "gpt-4o",
          cost: 0.032,
          latency: 156,
          status: "completed",
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
        }
      ]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const totalRequests = Number(summary.total_requests) || 0;

  return (
    <section id="dashboard" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            <span className="text-emerald-600">Metrics</span> Dashboard
          </h2>
          <p className="text-xl text-slate-600">
            Visualize your AI usage and savings in real time
          </p>

          <div className="mt-6 flex justify-center items-center space-x-4">
            <div className="flex items-center">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm text-slate-500">
                {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
              </span>
            </div>
            <button
              onClick={fetchMetrics}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Resumen de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">API Calls</p>
                <p className="text-3xl font-bold text-slate-900">{totalRequests.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">+12.5% from last month</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active API Keys</p>
                <p className="text-3xl font-bold text-slate-900">3</p>
                <p className="text-xs text-slate-500 mt-1">2 used this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Available Models</p>
                <p className="text-3xl font-bold text-slate-900">15</p>
                <p className="text-xs text-slate-500 mt-1">8 active models</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Avg Response Time</p>
                <p className="text-3xl font-bold text-slate-900">1.2s</p>
                <p className="text-xs text-slate-500 mt-1">Across all models</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Timer className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gráfico de uso por modelo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-12"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
            Model Usage Distribution
          </h3>

          <div className="space-y-4">
            {[
              { model: 'GPT-4o', requests: 1247, percentage: 35, color: 'bg-emerald-500', avgTime: '1.8s' },
              { model: 'Claude-3 Sonnet', requests: 892, percentage: 25, color: 'bg-blue-500', avgTime: '1.2s' },
              { model: 'GPT-4o Mini', requests: 712, percentage: 20, color: 'bg-purple-500', avgTime: '0.9s' },
              { model: 'Llama 3.1', requests: 534, percentage: 15, color: 'bg-orange-500', avgTime: '1.1s' },
              { model: 'Grok-2', requests: 178, percentage: 5, color: 'bg-pink-500', avgTime: '2.1s' }
            ].map((modelData, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center flex-1">
                  <div className={`w-3 h-3 ${modelData.color} rounded-full mr-3`}></div>
                  <div className="flex-1">
                    <span className="font-medium text-slate-900">{modelData.model}</span>
                    <div className="text-xs text-slate-500 mt-1">
                      Avg response: {modelData.avgTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-600">
                    {modelData.requests.toLocaleString()} calls
                  </div>
                  <div className="text-sm font-bold text-emerald-600">
                    {modelData.percentage}%
                  </div>
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className={`${modelData.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${modelData.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Performance Summary */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">98.7%</div>
                <div className="text-sm text-slate-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1.4s</div>
                <div className="text-sm text-slate-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">15</div>
                <div className="text-sm text-slate-600">Active Models</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Últimas tareas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-emerald-600" />
            Recent Tasks
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Model</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task, index) => {
                  const taskData = task as { model?: string; cost?: number; latency?: number; status?: string };
                  return (
                    <tr key={index} className={index < recentTasks.length - 1 ? "border-b border-slate-100" : ""}>
                      <td className="py-4 px-4 font-medium text-slate-900 capitalize">{taskData.model}</td>
                      <td className="py-4 px-4 text-emerald-600 font-bold">${(taskData.cost || 0).toFixed(3)}</td>
                      <td className="py-4 px-4 text-slate-600">{taskData.latency}ms</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskData.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {taskData.status === 'completed' ? 'Completed' : 'Processing'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Precios con estilo más técnico
const PricingSection = () => {
  return (
    <section id="precios" className="py-24 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black mb-4">
            <span className="text-emerald-400">Simple</span> Pricing
          </h2>
          <p className="text-xl text-slate-400">
            Transparent pricing with built-in cost protection. No surprises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "FREE",
              price: "€0",
              tasks: "10 requests/month",
              features: ["3 API keys", "Forever free", "Basic models access", "Community support"],
              highlight: false,
              period: "/forever",
              badge: null
            },
            {
              name: "STARTER",
              price: "€39",
              tasks: "5,000 requests/month",
              features: ["10 API keys", "All AI models", "Priority support", "Analytics dashboard", "Cost protection"],
              highlight: true,
              period: "/month",
              badge: "Most Popular"
            },
            {
              name: "PRO",
              price: "€79",
              tasks: "20,000 requests/month",
              features: ["25 API keys", "All AI models", "Priority support", "Advanced analytics", "Custom integrations", "Enhanced cost protection"],
              highlight: false,
              period: "/month",
              badge: null
            },
            {
              name: "ENTERPRISE",
              price: "€299",
              tasks: "80,000 requests/month",
              features: ["Unlimited API keys", "All AI models", "24/7 dedicated support", "Custom analytics", "On-premise deployment", "SLA guarantees", "Maximum cost protection"],
              highlight: false,
              period: "/month",
              badge: null
            }
          ].map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-2xl p-8 border-2 transition-all duration-300",
                plan.highlight
                  ? "bg-emerald-500 border-emerald-400 shadow-2xl shadow-emerald-500/20"
                  : "bg-slate-800 border-slate-700 hover:border-slate-600"
              )}
            >
              {plan.badge && (
                <div className={cn(
                  "absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold",
                  plan.badge === "Most Popular"
                    ? "bg-slate-900 text-emerald-400"
                    : "bg-blue-600 text-white"
                )}>
                  {plan.badge}
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={cn(
                  "text-2xl font-black mb-2",
                  plan.highlight ? "text-slate-900" : "text-white"
                )}>
                  {plan.name}
                </h3>
                <div className={cn(
                  "text-4xl font-black mb-2",
                  plan.highlight ? "text-slate-900" : "text-emerald-400"
                )}>
                  {plan.price}
                  <span className={cn(
                    "text-lg font-normal",
                    plan.highlight ? "text-slate-600" : "text-slate-500"
                  )}>
                    {plan.period || ""}
                  </span>
                </div>
                <div className={cn(
                  "text-sm font-mono",
                  plan.highlight ? "text-slate-700" : "text-slate-400"
                )}>
                  {plan.tasks}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className={cn(
                      "w-5 h-5 mr-3",
                      plan.highlight ? "text-slate-700" : "text-emerald-400"
                    )} />
                    <span className={cn(
                      "font-medium",
                      plan.highlight ? "text-slate-800" : "text-slate-300"
                    )}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-full py-4 rounded-lg font-bold text-lg transition-all duration-300",
                  plan.highlight
                    ? "bg-slate-900 text-emerald-400 hover:bg-slate-800"
                    : "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                )}
              >
                {plan.name === "FREE" ? "Start Free" :
                  plan.name === "STARTER" ? "Get Started" :
                    plan.name === "PRO" ? "Start Pro" :
                      "Contact Sales"}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Nota técnica */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center px-6 py-3 bg-slate-800 border border-slate-700 rounded-full">
            <Timer className="w-4 h-4 text-emerald-400 mr-2" />
            <span className="text-slate-300 font-mono text-sm">
              Integration: change 1 line of code • Time: &lt;10 minutes
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Testimonios con estilo más auténtico
const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            What <span className="text-emerald-600">Developers</span> Say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              name: "Alex Chen",
              role: "Senior Backend Engineer",
              company: "TechCorp",
              content: "I literally changed one line of code and started saving $2K per month. Roulyx is incredibly smart.",
              savings: "$2,000/month",
              tech: "Node.js + Express"
            },
            {
              name: "Sofia Rodriguez",
              role: "ML Engineer",
              company: "DataFlow",
              content: "The dashboard lets me see exactly which model is best for each type of task. Data-driven decisions.",
              savings: "65% optimization",
              tech: "Python + FastAPI"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-slate-600 text-sm">{testimonial.role}</p>
                  <p className="text-slate-500 text-xs font-mono">{testimonial.tech}</p>
                </div>
              </div>

              <blockquote className="text-slate-700 mb-6 italic border-l-4 border-emerald-500 pl-4">
                &quot;{testimonial.content}&quot;
              </blockquote>

              <div className="bg-emerald-100 border border-emerald-200 rounded-lg p-4 text-center">
                <div className="text-emerald-700 font-bold text-lg">{testimonial.savings}</div>
                <div className="text-emerald-600 text-sm">saved</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer minimalista
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-8 md:mb-0">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                className="transition-all duration-300"
              >
                <defs>
                  <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="footerConnectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Background connection network */}
                <g className="opacity-30">
                  {/* Horizontal and vertical connection lines */}
                  <path d="M6 16 L26 16" stroke="url(#footerConnectionGradient)" strokeWidth="0.8" />
                  <path d="M16 6 L16 26" stroke="url(#footerConnectionGradient)" strokeWidth="0.8" />

                  {/* Diagonal connection lines */}
                  <path d="M10 10 L22 22" stroke="url(#footerConnectionGradient)" strokeWidth="0.6" className="opacity-60" />
                  <path d="M22 10 L10 22" stroke="url(#footerConnectionGradient)" strokeWidth="0.6" className="opacity-60" />
                </g>

                {/* Main X structure */}
                <g>
                  {/* Primary X shape */}
                  <path
                    d="M10 10 L22 22 M22 10 L10 22"
                    stroke="url(#footerLogoGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Central decision node */}
                  <circle
                    cx="16"
                    cy="16"
                    r="3"
                    fill="url(#footerLogoGradient)"
                    className="opacity-90"
                  />

                  {/* Route decision points */}
                  <circle cx="10" cy="10" r="1.5" fill="#34d399" className="opacity-80" />
                  <circle cx="22" cy="10" r="1.5" fill="#34d399" className="opacity-80" />
                  <circle cx="10" cy="22" r="1.5" fill="#34d399" className="opacity-80" />
                  <circle cx="22" cy="22" r="1.5" fill="#34d399" className="opacity-80" />
                </g>
              </svg>
            </div>
            <div>
              <span className="text-lg font-black">Roulyx</span>
              <div className="text-xs text-slate-400 font-mono">v1.0.0</div>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <a href="/docs" className="text-slate-400 hover:text-emerald-400 transition-colors font-mono text-sm">
              API Docs
            </a>
            <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors font-mono text-sm">
              GitHub
            </a>
            <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors font-mono text-sm">
              Status
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm font-mono">
            © 2024 Roulyx • Intelligent routing since 2024
          </p>
        </div>
      </div>
    </footer>
  );
};

// Componente principal
export default function Landing() {
  return (
    <main className="relative">
      <Navigation />
      <HeroSection />
      <RouterSection />
      <SavingsSection />
      <DashboardSection />
      <PricingSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}