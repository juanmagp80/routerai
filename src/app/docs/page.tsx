"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    CheckCircle,
    Clock,
    Code,
    Copy,
    Key,
    Lock,
    Settings,
    Shield,
    TrendingDown,
    Zap
} from "lucide-react";
import { useState } from "react";

export default function DocsPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const chatbotExample = `// Chatbot - Fast responses for customer service
curl -X POST https://api.roulyx.com/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "How can I reset my password?",
    "model": "auto", 
    "routing_mode": "speed",
    "fallback_models": ["gpt-3.5-turbo", "claude-3-haiku"]
  }'`;

    const summaryExample = `// Document summarization - Quality focused
curl -X POST https://api.roulyx.com/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Summarize this research paper: [document content]",
    "model": "auto",
    "routing_mode": "quality",
    "max_tokens": 2000
  }'`;

    const sentimentExample = `// Sentiment analysis - Cost optimized
curl -X POST https://api.roulyx.com/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Analyze sentiment: This product exceeded expectations!",
    "model": "auto",
    "routing_mode": "balanced"
  }'`;

    const errorResponseExample = `{
  "error": {
    "message": "Your API key seems invalid or expired. Check your dashboard.",
    "hint": "Visit https://roulyx.ai/admin/keys to refresh it.",
    "type": "authentication_error", 
    "code": 401,
    "docs": "https://roulyx.ai/docs#authentication"
  }
}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.05)_50%,transparent_75%),linear-gradient(-45deg,transparent_25%,rgba(6,182,212,0.05)_50%,transparent_75%)] bg-[length:60px_60px]"></div>

                <div className="relative max-w-6xl mx-auto px-6 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mr-4">
                                <Code className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">Roulyx Docs</span>
                        </div>

                        <h1 className="text-5xl font-black text-white mb-6 leading-tight">
                            One API, All Models
                        </h1>

                        <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-8">
                            Roulyx automatically routes your AI requests to the best model — faster, cheaper, and smarter than any single provider.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-4 py-2">
                                <TrendingDown className="w-4 h-4 mr-2" />
                                Up to 40% cost savings
                            </Badge>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2">
                                <Clock className="w-4 h-4 mr-2" />
                                Sub-second routing
                            </Badge>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Real-time analytics
                            </Badge>
                        </div>
                    </motion.div>

                    {/* How Roulyx Works - Visual Flow */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-16"
                    >
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <h3 className="text-2xl font-bold text-white mb-8 text-center">How Roulyx Works</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                                <div>
                                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white font-bold text-xl">1</span>
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Your Request</h4>
                                    <p className="text-sm text-slate-300">Send any AI request through our unified API</p>
                                </div>

                                <div className="flex items-center justify-center">
                                    <ArrowRight className="w-6 h-6 text-emerald-400 transform rotate-90 md:rotate-0" />
                                </div>

                                <div>
                                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white font-bold text-xl">2</span>
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Smart Analysis</h4>
                                    <p className="text-sm text-slate-300">AI analyzes complexity, cost, and speed requirements</p>
                                </div>

                                <div className="flex items-center justify-center">
                                    <ArrowRight className="w-6 h-6 text-emerald-400 transform rotate-90 md:rotate-0" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-center">
                                <div>
                                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white font-bold text-xl">3</span>
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Optimal Model</h4>
                                    <p className="text-sm text-slate-300">Routes to best LLM (GPT-4, Claude, Gemini, etc.)</p>
                                </div>
                                <div>
                                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white font-bold text-xl">4</span>
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Real-time Insights</h4>
                                    <p className="text-sm text-slate-300">Track usage, costs, and performance analytics</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-16">

                {/* Cost Savings Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-16"
                >
                    <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl text-slate-900">
                                Smart Routing = Real Savings
                            </CardTitle>
                            <CardDescription>
                                See how Roulyx optimizes costs compared to direct provider calls
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="text-center">
                                    <div className="bg-red-100 rounded-lg p-6 mb-4">
                                        <h4 className="font-semibold text-red-800 mb-2">Direct OpenAI Calls</h4>
                                        <div className="text-3xl font-bold text-red-600">$847/month</div>
                                        <p className="text-sm text-red-600 mt-2">Fixed routing to GPT-4 for all requests</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-emerald-100 rounded-lg p-6 mb-4">
                                        <h4 className="font-semibold text-emerald-800 mb-2">With Roulyx Routing</h4>
                                        <div className="text-3xl font-bold text-emerald-600">$508/month</div>
                                        <p className="text-sm text-emerald-600 mt-2">Intelligent model selection per request</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mt-6">
                                <Badge className="bg-emerald-600 text-white px-6 py-2 text-lg">
                                    40% Cost Reduction = $339 Saved Monthly
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* API Examples by Use Case */}
                <div className="space-y-12 mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
                        Examples by Use Case
                    </h2>

                    {/* Chatbot Example */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                </div>
                                Customer Support Chatbot
                            </CardTitle>
                            <CardDescription>
                                Fast responses optimized for speed and cost efficiency
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-900 rounded-lg p-4 relative">
                                <button
                                    onClick={() => handleCopyCode(chatbotExample, 'chatbot')}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                                >
                                    {copiedCode === 'chatbot' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                                <pre className="text-sm text-slate-300 overflow-x-auto">
                                    <code>{chatbotExample}</code>
                                </pre>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Document Summarization */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                    <BookOpen className="w-4 h-4 text-purple-600" />
                                </div>
                                Document Summarization
                            </CardTitle>
                            <CardDescription>
                                High-quality summaries for long-form content
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-900 rounded-lg p-4 relative">
                                <button
                                    onClick={() => handleCopyCode(summaryExample, 'summary')}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                                >
                                    {copiedCode === 'summary' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                                <pre className="text-sm text-slate-300 overflow-x-auto">
                                    <code>{summaryExample}</code>
                                </pre>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sentiment Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                    <Settings className="w-4 h-4 text-emerald-600" />
                                </div>
                                Sentiment Analysis
                            </CardTitle>
                            <CardDescription>
                                Balanced performance for high-volume text analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-900 rounded-lg p-4 relative">
                                <button
                                    onClick={() => handleCopyCode(sentimentExample, 'sentiment')}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                                >
                                    {copiedCode === 'sentiment' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                                <pre className="text-sm text-slate-300 overflow-x-auto">
                                    <code>{sentimentExample}</code>
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Authentication */}
                <Card className="mb-16">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Lock className="w-6 h-6 text-emerald-600 mr-2" />
                            Authentication
                        </CardTitle>
                        <CardDescription>
                            Roulyx uses API keys to authenticate requests. You can manage your API keys in your{" "}
                            <a href="/admin/keys" className="text-emerald-600 hover:underline">
                                dashboard
                            </a>
                            .
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Include your API key in requests:</h4>
                            <div className="bg-slate-100 rounded-lg p-3">
                                <code className="text-sm text-slate-700">
                                    Authorization: Bearer YOUR_API_KEY
                                </code>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Shield className="w-5 h-5 text-amber-600 mr-2" />
                                <span className="font-medium text-amber-800">Keep your API keys secure</span>
                            </div>
                            <p className="text-sm text-amber-700 mt-1">
                                Never expose API keys in client-side code or public repositories.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Enhanced Error Handling */}
                <Card className="mb-16">
                    <CardHeader>
                        <CardTitle>Enhanced Error Handling</CardTitle>
                        <CardDescription>
                            Roulyx provides developer-friendly error messages with actionable hints
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-slate-900 rounded-lg p-4 relative">
                            <button
                                onClick={() => handleCopyCode(errorResponseExample, 'error')}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                {copiedCode === 'error' ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                            <pre className="text-sm text-slate-300 overflow-x-auto">
                                <code>{errorResponseExample}</code>
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                {/* Coming Soon Section */}
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white mb-16">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">🚀 Coming Soon</CardTitle>
                        <CardDescription className="text-slate-300">
                            Exciting features on our roadmap
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                                    <span>Custom routing profiles per application</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                                    <span>Real-time model benchmarking</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                                    <span>Fine-tuning router with user feedback</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                                    <span>Advanced team usage analytics</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Get Started CTA */}
                <div className="text-center">
                    <Card className="bg-emerald-50 border-emerald-200">
                        <CardContent className="pt-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                Ready to optimize your AI costs?
                            </h3>
                            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                                Create your account and start building with Roulyx&apos;s intelligent API routing in minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" asChild>
                                    <a href="/register">
                                        Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                                <Button variant="outline" size="lg" asChild>
                                    <a href="/admin/keys">
                                        Get API Key <Key className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
