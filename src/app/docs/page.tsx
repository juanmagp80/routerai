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
    ExternalLink,
    Key,
    Lock,
    Palette,
    Settings,
    Shield,
    Zap
} from "lucide-react";
import { useState } from "react";

const ApiDocsPage = () => {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Code examples
    const curlExample = `curl -X POST https://api.routerai.com/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "What is artificial intelligence?",
    "model": "auto",
    "max_tokens": 1000,
    "temperature": 0.7
  }'`;

    const nodeJsExample = `const response = await fetch('https://api.routerai.com/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'What is artificial intelligence?',
    model: 'auto', // Let RouterAI choose the best model
    max_tokens: 1000,
    temperature: 0.7
  })
});

const data = await response.json();
console.log(data.response);`;

    const pythonExample = `import requests

url = "https://api.routerai.com/v1/chat"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "message": "What is artificial intelligence?",
    "model": "auto",
    "max_tokens": 1000,
    "temperature": 0.7
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result["response"])`;

    const openAICompatibleExample = `// RouterAI is OpenAI API compatible
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'YOUR_ROUTERAI_API_KEY',
  baseURL: 'https://api.routerai.com/v1',
});

const completion = await client.chat.completions.create({
  messages: [{ role: 'user', content: 'Hello world!' }],
  model: 'auto', // RouterAI will choose the best model
});

console.log(completion.choices[0].message.content);`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            {/* Logo (same as landing) */}
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 40 40"
                                className="transition-all duration-300"
                            >
                                <defs>
                                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="50%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                                <circle cx="20" cy="20" r="4" fill="url(#logoGradient)" />
                                <path d="M20,8 L20,12 M32,20 L28,20 M20,32 L20,28 M8,20 L12,20" stroke="url(#logoGradient)" strokeWidth="2.5" strokeLinecap="round" />
                                <circle cx="20" cy="8" r="2.5" fill="url(#logoGradient)" />
                                <circle cx="32" cy="20" r="2.5" fill="url(#logoGradient)" />
                                <circle cx="20" cy="32" r="2.5" fill="url(#logoGradient)" />
                                <circle cx="8" cy="20" r="2.5" fill="url(#logoGradient)" />
                            </svg>
                            <span className="text-xl font-bold text-slate-900">RouterAI Docs</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="/" className="text-slate-600 hover:text-slate-900 font-medium">Back to Home</a>
                            <a href="/admin" className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                                Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 mb-6">
                        API Documentation
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Build powerful AI applications with RouterAI's intelligent routing system.
                        Access 15+ AI models through a single, unified API that automatically selects
                        the best model for each request.
                    </p>
                </motion.div>

                {/* Quick Start Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <Key className="w-6 h-6 text-blue-600" />
                                </div>
                                <CardTitle>1. Get API Key</CardTitle>
                                <CardDescription>
                                    Create your account and generate your API key in seconds
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" asChild>
                                    <a href="/admin/keys">
                                        Get API Key <ArrowRight className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                                    <Code className="w-6 h-6 text-emerald-600" />
                                </div>
                                <CardTitle>2. Make First Call</CardTitle>
                                <CardDescription>
                                    Send your first request to our intelligent routing endpoint
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    <a href="#examples">View Examples</a>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6 text-purple-600" />
                                </div>
                                <CardTitle>3. Scale & Optimize</CardTitle>
                                <CardDescription>
                                    Monitor usage and optimize costs with our analytics dashboard
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full" asChild>
                                    <a href="/admin/analytics">
                                        View Analytics <ExternalLink className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Table of Contents */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Table of Contents</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <a href="#authentication" className="block text-sm text-slate-600 hover:text-emerald-600 py-1">Authentication</a>
                                    <a href="#endpoints" className="block text-sm text-slate-600 hover:text-emerald-600 py-1">Endpoints</a>
                                    <a href="#examples" className="block text-sm text-slate-600 hover:text-emerald-600 py-1">Code Examples</a>
                                    <a href="#models" className="block text-sm text-slate-600 hover:text-emerald-600 py-1">Available Models</a>
                                    <a href="#responses" className="block text-sm text-slate-600 hover:text-emerald-600 py-1">Response Format</a>
                                    <a href="#errors" className="block text-sm text-slate-600 hover:text-emerald-600 py-1">Error Handling</a>
                                    <a href="#rate-limits" className="block text-sm text-slate-600 hover:text-emerald-600 py-1">Rate Limits</a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Documentation Content */}
                    <div className="lg:col-span-3 space-y-12">
                        {/* Authentication */}
                        <section id="authentication">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Authentication</CardTitle>
                                            <CardDescription>Secure your API requests with bearer tokens</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <p className="text-slate-700 mb-4">
                                            RouterAI uses API keys to authenticate requests. You can manage your API keys in your
                                            <a href="/admin/keys" className="text-emerald-600 hover:text-emerald-700 font-medium ml-1">dashboard</a>.
                                        </p>
                                        <div className="bg-slate-100 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-mono text-slate-600">Authorization Header</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleCopyCode('Authorization: Bearer YOUR_API_KEY', 'auth')}
                                                >
                                                    <Copy className="w-4 h-4" />
                                                    {copiedCode === 'auth' ? 'Copied!' : 'Copy'}
                                                </Button>
                                            </div>
                                            <code className="text-sm text-slate-800">Authorization: Bearer YOUR_API_KEY</code>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-yellow-800">Keep your API key secure</h4>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    Never expose your API key in client-side code. Always make requests from your backend server.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Endpoints */}
                        <section id="endpoints">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <Settings className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">API Endpoints</CardTitle>
                                            <CardDescription>Complete reference for all available endpoints</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* Chat Completion Endpoint */}
                                    <div>
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Badge className="bg-emerald-100 text-emerald-800">POST</Badge>
                                            <code className="text-lg font-mono">/v1/chat</code>
                                        </div>
                                        <p className="text-slate-700 mb-4">
                                            Generate AI responses with automatic model selection. RouterAI intelligently chooses
                                            the best model based on your request complexity, cost preferences, and performance requirements.
                                        </p>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 mb-2">Request Parameters</h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b border-slate-200">
                                                                <th className="text-left py-2 font-medium text-slate-700">Parameter</th>
                                                                <th className="text-left py-2 font-medium text-slate-700">Type</th>
                                                                <th className="text-left py-2 font-medium text-slate-700">Required</th>
                                                                <th className="text-left py-2 font-medium text-slate-700">Description</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="space-y-2">
                                                            <tr className="border-b border-slate-100">
                                                                <td className="py-2 font-mono text-blue-600">message</td>
                                                                <td className="py-2 text-slate-600">string</td>
                                                                <td className="py-2"><Badge variant="destructive" className="text-xs">Required</Badge></td>
                                                                <td className="py-2 text-slate-600">The user message to send to the AI</td>
                                                            </tr>
                                                            <tr className="border-b border-slate-100">
                                                                <td className="py-2 font-mono text-blue-600">model</td>
                                                                <td className="py-2 text-slate-600">string</td>
                                                                <td className="py-2"><Badge variant="outline" className="text-xs">Optional</Badge></td>
                                                                <td className="py-2 text-slate-600">Model to use ("auto" for intelligent routing)</td>
                                                            </tr>
                                                            <tr className="border-b border-slate-100">
                                                                <td className="py-2 font-mono text-blue-600">max_tokens</td>
                                                                <td className="py-2 text-slate-600">integer</td>
                                                                <td className="py-2"><Badge variant="outline" className="text-xs">Optional</Badge></td>
                                                                <td className="py-2 text-slate-600">Maximum tokens to generate (default: 1000)</td>
                                                            </tr>
                                                            <tr className="border-b border-slate-100">
                                                                <td className="py-2 font-mono text-blue-600">temperature</td>
                                                                <td className="py-2 text-slate-600">float</td>
                                                                <td className="py-2"><Badge variant="outline" className="text-xs">Optional</Badge></td>
                                                                <td className="py-2 text-slate-600">Randomness (0.0-2.0, default: 0.7)</td>
                                                            </tr>
                                                            <tr className="border-b border-slate-100">
                                                                <td className="py-2 font-mono text-blue-600">stream</td>
                                                                <td className="py-2 text-slate-600">boolean</td>
                                                                <td className="py-2"><Badge variant="outline" className="text-xs">Optional</Badge></td>
                                                                <td className="py-2 text-slate-600">Stream response (default: false)</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* OpenAI Compatibility */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                        <div className="flex items-start space-x-3">
                                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-blue-900 mb-2">OpenAI API Compatible</h4>
                                                <p className="text-sm text-blue-800 mb-3">
                                                    RouterAI is fully compatible with the OpenAI API. Simply change your base URL and you're ready to go!
                                                </p>
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    Base URL: https://api.routerai.com/v1
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Code Examples */}
                        <section id="examples">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Code className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Code Examples</CardTitle>
                                            <CardDescription>Get started quickly with these code samples</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* cURL Example */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-slate-900 flex items-center">
                                                <span className="w-6 h-6 bg-slate-200 rounded text-xs flex items-center justify-center mr-2">$</span>
                                                cURL
                                            </h4>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCopyCode(curlExample, 'curl')}
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                {copiedCode === 'curl' ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                            <pre className="text-sm text-slate-100">
                                                <code>{curlExample}</code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Node.js Example */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-slate-900 flex items-center">
                                                <span className="w-6 h-6 bg-green-500 rounded text-xs flex items-center justify-center mr-2 text-white">JS</span>
                                                Node.js / JavaScript
                                            </h4>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCopyCode(nodeJsExample, 'nodejs')}
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                {copiedCode === 'nodejs' ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                            <pre className="text-sm text-slate-100">
                                                <code>{nodeJsExample}</code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Python Example */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-slate-900 flex items-center">
                                                <span className="w-6 h-6 bg-blue-500 rounded text-xs flex items-center justify-center mr-2 text-white">PY</span>
                                                Python
                                            </h4>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCopyCode(pythonExample, 'python')}
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                {copiedCode === 'python' ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                            <pre className="text-sm text-slate-100">
                                                <code>{pythonExample}</code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* OpenAI SDK Example */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-slate-900 flex items-center">
                                                <span className="w-6 h-6 bg-emerald-500 rounded text-xs flex items-center justify-center mr-2 text-white">AI</span>
                                                OpenAI SDK Compatible
                                            </h4>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCopyCode(openAICompatibleExample, 'openai')}
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                {copiedCode === 'openai' ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                            <pre className="text-sm text-slate-100">
                                                <code>{openAICompatibleExample}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Available Models */}
                        <section id="models">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Palette className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Available Models</CardTitle>
                                            <CardDescription>Choose from 15+ state-of-the-art AI models</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* OpenAI Models */}
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                                                <div className="w-5 h-5 bg-green-500 rounded mr-2"></div>
                                                OpenAI
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                                    <span className="font-mono text-sm">gpt-4o</span>
                                                    <Badge>Most Capable</Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                                    <span className="font-mono text-sm">gpt-4o-mini</span>
                                                    <Badge variant="outline">Fast & Efficient</Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                                    <span className="font-mono text-sm">gpt-4-turbo</span>
                                                    <Badge variant="outline">Balanced</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Anthropic Models */}
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                                                <div className="w-5 h-5 bg-orange-500 rounded mr-2"></div>
                                                Anthropic
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                                    <span className="font-mono text-sm">claude-3-opus</span>
                                                    <Badge>Most Powerful</Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                                    <span className="font-mono text-sm">claude-3-sonnet</span>
                                                    <Badge variant="outline">Balanced</Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                                    <span className="font-mono text-sm">claude-3-haiku</span>
                                                    <Badge variant="outline">Fast</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Google Models */}
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                                                <div className="w-5 h-5 bg-blue-500 rounded mr-2"></div>
                                                Google
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                                    <span className="font-mono text-sm">gemini-2.5-pro</span>
                                                    <Badge>Advanced</Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                                    <span className="font-mono text-sm">gemini-2.5-flash</span>
                                                    <Badge variant="outline">Ultra Fast</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Grok */}
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                                                <div className="w-5 h-5 bg-purple-500 rounded mr-2"></div>
                                                Grok (X.AI)
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                                    <span className="font-mono text-sm">grok-3</span>
                                                    <Badge>Latest</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <Zap className="w-5 h-5 text-emerald-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-emerald-900 mb-2">Automatic Model Selection</h4>
                                                <p className="text-sm text-emerald-800">
                                                    Use <code className="bg-emerald-100 px-2 py-1 rounded text-emerald-900">"model": "auto"</code>
                                                    {" "}to let RouterAI intelligently choose the best model for your request based on complexity,
                                                    cost, and performance requirements.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Response Format */}
                        <section id="responses">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Response Format</CardTitle>
                                    <CardDescription>Understanding API responses and structure</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-3">Successful Response</h4>
                                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                            <pre className="text-sm text-slate-100">
                                                <code>{`{
  "response": "Artificial intelligence (AI) is a branch of computer science...",
  "model": "gpt-4o",
  "provider": "openai",
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 150,
    "total_tokens": 162
  },
  "routing_info": {
    "selected_reason": "Best balance of quality and cost for this request",
    "considered_models": ["gpt-4o", "claude-3-sonnet", "gemini-2.5-pro"]
  }
}`}</code>
                                            </pre>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-3">Response Fields</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-slate-200">
                                                        <th className="text-left py-2 font-medium text-slate-700">Field</th>
                                                        <th className="text-left py-2 font-medium text-slate-700">Type</th>
                                                        <th className="text-left py-2 font-medium text-slate-700">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b border-slate-100">
                                                        <td className="py-2 font-mono text-blue-600">response</td>
                                                        <td className="py-2 text-slate-600">string</td>
                                                        <td className="py-2 text-slate-600">The AI-generated response text</td>
                                                    </tr>
                                                    <tr className="border-b border-slate-100">
                                                        <td className="py-2 font-mono text-blue-600">model</td>
                                                        <td className="py-2 text-slate-600">string</td>
                                                        <td className="py-2 text-slate-600">The model that generated the response</td>
                                                    </tr>
                                                    <tr className="border-b border-slate-100">
                                                        <td className="py-2 font-mono text-blue-600">provider</td>
                                                        <td className="py-2 text-slate-600">string</td>
                                                        <td className="py-2 text-slate-600">The AI provider used (openai, anthropic, etc.)</td>
                                                    </tr>
                                                    <tr className="border-b border-slate-100">
                                                        <td className="py-2 font-mono text-blue-600">usage</td>
                                                        <td className="py-2 text-slate-600">object</td>
                                                        <td className="py-2 text-slate-600">Token usage information</td>
                                                    </tr>
                                                    <tr className="border-b border-slate-100">
                                                        <td className="py-2 font-mono text-blue-600">routing_info</td>
                                                        <td className="py-2 text-slate-600">object</td>
                                                        <td className="py-2 text-slate-600">Information about the routing decision</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Error Handling */}
                        <section id="errors">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Error Handling</CardTitle>
                                    <CardDescription>Common errors and how to handle them</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3">HTTP Status Codes</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
                                                    <span className="font-mono text-sm">400</span>
                                                    <span className="text-sm text-slate-600">Bad Request</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
                                                    <span className="font-mono text-sm">401</span>
                                                    <span className="text-sm text-slate-600">Unauthorized</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
                                                    <span className="font-mono text-sm">429</span>
                                                    <span className="text-sm text-slate-600">Rate Limited</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
                                                    <span className="font-mono text-sm">500</span>
                                                    <span className="text-sm text-slate-600">Server Error</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3">Error Response Format</h4>
                                            <div className="bg-slate-900 rounded-lg p-4">
                                                <pre className="text-sm text-slate-100">
                                                    <code>{`{
  "error": {
    "message": "Invalid API key",
    "type": "authentication_error",
    "code": 401
  }
}`}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Rate Limits */}
                        <section id="rate-limits">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Rate Limits</CardTitle>
                                    <CardDescription>Usage limits and quotas by plan</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left py-3 font-medium text-slate-700">Plan</th>
                                                    <th className="text-left py-3 font-medium text-slate-700">Requests/Month</th>
                                                    <th className="text-left py-3 font-medium text-slate-700">Rate Limit</th>
                                                    <th className="text-left py-3 font-medium text-slate-700">API Keys</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-3 font-semibold text-slate-900">FREE</td>
                                                    <td className="py-3 text-slate-600">100 requests/week</td>
                                                    <td className="py-3 text-slate-600">5 req/min</td>
                                                    <td className="py-3 text-slate-600">1</td>
                                                </tr>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-3 font-semibold text-slate-900">STARTER</td>
                                                    <td className="py-3 text-slate-600">10,000</td>
                                                    <td className="py-3 text-slate-600">60 req/min</td>
                                                    <td className="py-3 text-slate-600">3</td>
                                                </tr>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-3 font-semibold text-slate-900">PRO</td>
                                                    <td className="py-3 text-slate-600">100,000</td>
                                                    <td className="py-3 text-slate-600">300 req/min</td>
                                                    <td className="py-3 text-slate-600">10</td>
                                                </tr>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-3 font-semibold text-slate-900">ENTERPRISE</td>
                                                    <td className="py-3 text-slate-600">1,000,000</td>
                                                    <td className="py-3 text-slate-600">1000 req/min</td>
                                                    <td className="py-3 text-slate-600">Unlimited</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </div>

                {/* Footer CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-20 py-16 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-3xl border border-emerald-200"
                >
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to get started?</h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                        Create your account and start building with RouterAI's intelligent API routing in minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                            <a href="/register">
                                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <a href="/admin/keys">
                                Get API Key <Key className="w-4 h-4 ml-2" />
                            </a>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ApiDocsPage;