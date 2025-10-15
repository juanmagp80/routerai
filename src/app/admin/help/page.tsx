"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BookOpen,
    CheckCircle,
    Code,
    Copy,
    Key,
    Lock,
    Settings,
    Shield,
    Zap,
    TrendingDown,
    BarChart3,
    Clock,
    HelpCircle,
    MessageSquare,
    Users,
    CreditCard,
    FileText,
    Monitor,
    AlertCircle,
    Lightbulb,
    PlayCircle
} from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const quickStartExample = `// Quick Start - Your first API call
curl -X POST https://api.roulix.com/v1/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, world!",
    "model": "auto"
  }'`;

    const apiKeyExample = `// Using your API key in JavaScript
const response = await fetch('https://api.roulix.com/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Your prompt here',
    model: 'auto'
  })
});`;

    const troubleshootingExample = `// Debugging API responses
{
  "error": {
    "message": "Rate limit exceeded",
    "hint": "Wait 60 seconds or upgrade your plan",
    "type": "rate_limit_error",
    "retry_after": 60
  }
}`;

    const helpSections = [
        {
            icon: PlayCircle,
            title: "Getting Started",
            description: "Learn the basics of using Roulix",
            items: [
                "Set up your first API key",
                "Make your first request",
                "Understand routing modes",
                "Configure fallback models"
            ]
        },
        {
            icon: Key,
            title: "API Keys Management",
            description: "Secure access to your account",
            items: [
                "Create and manage API keys",
                "Set key permissions and limits",
                "Rotate keys for security",
                "Monitor key usage"
            ]
        },
        {
            icon: BarChart3,
            title: "Usage & Analytics",
            description: "Track your API consumption",
            items: [
                "View real-time usage stats",
                "Analyze cost breakdowns",
                "Set usage alerts",
                "Download usage reports"
            ]
        },
        {
            icon: CreditCard,
            title: "Billing & Plans",
            description: "Manage your subscription",
            items: [
                "Understand pricing tiers",
                "Upgrade or downgrade plans",
                "View billing history",
                "Set up payment methods"
            ]
        }
    ];

    const faqItems = [
        {
            question: "How does intelligent routing work?",
            answer: "Roulix analyzes your request content, complexity, and requirements to automatically select the best AI model. This ensures optimal performance while minimizing costs."
        },
        {
            question: "Can I force a specific model?",
            answer: "Yes! You can specify a particular model in your request or set it as default in your dashboard. Routing is flexible to meet your needs."
        },
        {
            question: "How are costs calculated?",
            answer: "Costs are based on the actual model used for each request. Our intelligent routing often selects more cost-effective models without sacrificing quality."
        },
        {
            question: "What happens if a model is unavailable?",
            answer: "Roulix automatically fails over to backup models based on your configuration. You can set custom fallback chains in your dashboard."
        },
        {
            question: "How do I monitor my usage?",
            answer: "Real-time usage statistics are available in your dashboard. You can also set up alerts and download detailed reports."
        },
        {
            question: "Is there an API rate limit?",
            answer: "Rate limits depend on your plan. You can view current limits in your dashboard and upgrade for higher throughput."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.05)_50%,transparent_75%),linear-gradient(-45deg,transparent_25%,rgba(6,182,212,0.05)_50%,transparent_75%)] bg-[length:60px_60px]"></div>
                
                <div className="relative max-w-6xl mx-auto px-6 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mr-4">
                                <HelpCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">Roulix Help Center</span>
                        </div>
                        
                        <h1 className="text-4xl font-black text-white mb-6 leading-tight">
                            Get the Most Out of Roulix
                        </h1>
                        
                        <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-8">
                            Everything you need to know about using Roulix's intelligent AI routing platform effectively.
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" variant="secondary" asChild>
                                <a href="/admin/keys">
                                    <Key className="w-4 h-4 mr-2" />
                                    Manage API Keys
                                </a>
                            </Button>
                            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-slate-900" asChild>
                                <a href="/admin/chat">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Test API
                                </a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                
                {/* Quick Start Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16"
                >
                    <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl text-slate-900 flex items-center justify-center">
                                <PlayCircle className="w-6 h-6 mr-2 text-emerald-600" />
                                Quick Start Guide
                            </CardTitle>
                            <CardDescription>
                                Get up and running with Roulix in minutes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white font-bold">1</span>
                                    </div>
                                    <h4 className="font-semibold mb-2">Create API Key</h4>
                                    <p className="text-sm text-slate-600">Generate your first API key in the Keys section</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white font-bold">2</span>
                                    </div>
                                    <h4 className="font-semibold mb-2">Make First Call</h4>
                                    <p className="text-sm text-slate-600">Send your first request using the example below</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white font-bold">3</span>
                                    </div>
                                    <h4 className="font-semibold mb-2">Monitor Usage</h4>
                                    <p className="text-sm text-slate-600">Track your usage in the Analytics dashboard</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-900 rounded-lg p-4 relative">
                                <button
                                    onClick={() => handleCopyCode(quickStartExample, 'quickstart')}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                                >
                                    {copiedCode === 'quickstart' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                                <pre className="text-sm text-slate-300 overflow-x-auto">
                                    <code>{quickStartExample}</code>
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Help Topics Grid */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
                        Help Topics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {helpSections.map((section, index) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                <Card className="h-full hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                                <section.icon className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            {section.title}
                                        </CardTitle>
                                        <CardDescription>
                                            {section.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {section.items.map((item, itemIndex) => (
                                                <li key={itemIndex} className="flex items-center text-sm">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Code Examples Section */}
                <div className="space-y-8 mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
                        Code Examples
                    </h2>

                    {/* JavaScript Example */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                                    <Code className="w-4 h-4 text-yellow-600" />
                                </div>
                                JavaScript Integration
                            </CardTitle>
                            <CardDescription>
                                How to integrate Roulix in your JavaScript applications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-900 rounded-lg p-4 relative">
                                <button
                                    onClick={() => handleCopyCode(apiKeyExample, 'javascript')}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                                >
                                    {copiedCode === 'javascript' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                                <pre className="text-sm text-slate-300 overflow-x-auto">
                                    <code>{apiKeyExample}</code>
                                </pre>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Troubleshooting Example */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                </div>
                                Error Handling & Troubleshooting
                            </CardTitle>
                            <CardDescription>
                                Understanding and handling API errors effectively
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-900 rounded-lg p-4 relative">
                                <button
                                    onClick={() => handleCopyCode(troubleshootingExample, 'troubleshooting')}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                                >
                                    {copiedCode === 'troubleshooting' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                                <pre className="text-sm text-slate-300 overflow-x-auto">
                                    <code>{troubleshootingExample}</code>
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* FAQ Section */}
                <Card className="mb-16">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center">
                            <HelpCircle className="w-6 h-6 mr-2 text-emerald-600" />
                            Frequently Asked Questions
                        </CardTitle>
                        <CardDescription>
                            Quick answers to common questions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {faqItems.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0"
                                >
                                    <h4 className="font-semibold text-slate-900 mb-2 flex items-start">
                                        <Lightbulb className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                        {faq.question}
                                    </h4>
                                    <p className="text-slate-600 ml-6">{faq.answer}</p>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Support Section */}
                <div className="text-center">
                    <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200">
                        <CardContent className="pt-8">
                            <div className="flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                Still Need Help?
                            </h3>
                            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                                Can't find what you're looking for? Our support team is here to help you get the most out of Roulix.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" asChild>
                                    <a href="/admin/chat">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Try Live Chat
                                    </a>
                                </Button>
                                <Button variant="outline" size="lg" asChild>
                                    <a href="/admin/settings">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Account Settings
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
