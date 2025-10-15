'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ModelConfig } from "@/types/ai";
import { CheckCircle, Clock, Code, Copy, DollarSign, Eye, EyeOff, Play, Settings, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

type RoutingStrategy = 'auto' | 'cost' | 'speed' | 'quality' | 'balanced';

interface ApiTest {
  id: string;
  timestamp: Date;
  request: {
    endpoint: string;
    headers: Record<string, string>;
    body: unknown;
  };
  response: {
    status: number;
    statusText: string;
    data: unknown;
    time: number;
  };
}

export default function ApiConsolePage() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [endpoint, setEndpoint] = useState('/api/chat');
  const [method, setMethod] = useState('POST');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [routingStrategy, setRoutingStrategy] = useState<RoutingStrategy>('auto');
  const [message, setMessage] = useState('Hello! Can you help me understand how AI routing works?');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant specialized in explaining AI and routing concepts.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelConfig[]>([]);
  const [userPlan, setUserPlan] = useState<string>('FREE');
  const [testHistory, setTestHistory] = useState<ApiTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ApiTest | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Cargar modelos disponibles
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvailableModels(data.models);
        }
      })
      .catch(err => console.error('Error loading models:', err));

    // Obtener información del plan del usuario
    fetch('/api/user/limits')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserPlan(data.plan || 'FREE');
        }
      })
      .catch(err => {
        console.error('Error loading user plan:', err);
        setUserPlan('FREE'); // Por defecto FREE si hay error
      });
  }, []);

  // Filtrar modelos según el plan del usuario
  const getFilteredModels = () => {
    if (userPlan === 'FREE') {
      // Usuarios FREE pueden usar modelos económicos específicos
      const allowedFreeModels = [
        'gpt-3.5-turbo',
        'gpt-4o-mini',
        'claude-3-haiku',
        'gemini-2.0-flash'
      ];

      return availableModels.filter(model =>
        allowedFreeModels.some(allowed =>
          model.name.toLowerCase().includes(allowed.toLowerCase()) ||
          model.name.toLowerCase() === allowed.toLowerCase()
        )
      );
    }
    // Otros planes pueden usar todos los modelos
    return availableModels;
  };

  const executeApiTest = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your API key to test the endpoint');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message to test');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const requestData = {
        message: message,
        model: selectedModel === 'auto' ? undefined : selectedModel,
        routingStrategy: routingStrategy,
        systemPrompt: systemPrompt,
        temperature: temperature,
        maxTokens: maxTokens
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: headers,
        body: JSON.stringify(requestData),
      });

      const responseTime = Date.now() - startTime;
      const responseData = await response.json();

      const test: ApiTest = {
        id: Date.now().toString(),
        timestamp: new Date(),
        request: {
          endpoint: endpoint,
          headers: headers,
          body: requestData
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          time: responseTime
        }
      };

      setTestHistory(prev => [test, ...prev]);
      setSelectedTest(test);

    } catch (error) {
      console.error('Error executing API test:', error);

      const errorTest: ApiTest = {
        id: Date.now().toString(),
        timestamp: new Date(),
        request: {
          endpoint: endpoint,
          headers: { 'Authorization': `Bearer ${apiKey}` },
          body: { message, model: selectedModel, routingStrategy }
        },
        response: {
          status: 0,
          statusText: 'Network Error',
          data: { error: error instanceof Error ? error.message : 'Unknown error' },
          time: Date.now() - startTime
        }
      };

      setTestHistory(prev => [errorTest, ...prev]);
      setSelectedTest(errorTest);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const generateCurlCommand = () => {
    const requestData = {
      message: message,
      model: selectedModel === 'auto' ? undefined : selectedModel,
      routingStrategy: routingStrategy,
      systemPrompt: systemPrompt,
      temperature: temperature,
      maxTokens: maxTokens
    };

    return `curl -X ${method} "${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '${JSON.stringify(requestData, null, 2)}'`;
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Router API Console</h2>
        <Badge variant="secondary" className="text-sm">
          <Code className="h-4 w-4 mr-1" />
          Testing Environment
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Request Configuration
              </CardTitle>
              <CardDescription>
                Configure your API request parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="apiKey" className="text-sm font-medium">
                  API Key <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key (rtr_...)"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col space-y-2">
                  <Label className="text-sm font-medium">Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex flex-col space-y-2">
                  <Label className="text-sm font-medium">Endpoint</Label>
                  <Select value={endpoint} onValueChange={setEndpoint}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="/api/chat">Chat Completion</SelectItem>
                      <SelectItem value="/api/models">List Models</SelectItem>
                      <SelectItem value="/api/user/limits">User Limits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <Label className="text-sm font-medium">Routing Strategy</Label>
                  <Select value={routingStrategy} onValueChange={(value) => setRoutingStrategy(value as RoutingStrategy)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>Auto</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cost">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Cheapest</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="speed">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4" />
                          <span>Fastest</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="quality">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4" />
                          <span>Best Quality</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-2">
                  <Label className="text-sm font-medium">Model Override</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto Select</SelectItem>
                      {getFilteredModels().map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your test message..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="temperature" className="text-sm font-medium">
                    Temperature
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value) || 0.7)}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="maxTokens" className="text-sm font-medium">
                    Max Tokens
                  </Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="1"
                    max="4000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1000)}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="systemPrompt" className="text-sm font-medium">
                  System Prompt
                </Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt..."
                  className="min-h-[80px] resize-none"
                />
              </div>

              <Button
                onClick={executeApiTest}
                disabled={!apiKey.trim() || !message.trim() || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Testing API...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Test
                  </>
                )}
              </Button>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">cURL Command</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateCurlCommand())}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                  {generateCurlCommand()}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedTest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Response
                  </span>
                  <Badge
                    variant={selectedTest.response.status >= 200 && selectedTest.response.status < 300 ? "default" : "destructive"}
                  >
                    {selectedTest.response.status} {selectedTest.response.statusText}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedTest.response.time}ms
                    </span>
                    <span>{selectedTest.timestamp.toLocaleTimeString()}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Response Body</Label>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[300px]">
                      {JSON.stringify(selectedTest.response.data, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Request Body</Label>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[200px]">
                      {JSON.stringify(selectedTest.request.body, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Test History
              </CardTitle>
              <CardDescription>
                Previous API test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {testHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No tests executed yet</p>
                    <p className="text-sm">Execute your first API test to see results here</p>
                  </div>
                ) : (
                  testHistory.map((test) => (
                    <div
                      key={test.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedTest?.id === test.id ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                      onClick={() => setSelectedTest(test)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={test.response.status >= 200 && test.response.status < 300 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {test.response.status}
                          </Badge>
                          <span className="text-sm font-medium">{test.request.endpoint}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {test.response.time}ms
                          <span>{test.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Available Models
            <Badge variant={userPlan === 'FREE' ? 'secondary' : 'default'} className="text-xs">
              {userPlan} Plan
            </Badge>
          </CardTitle>
          <CardDescription>
            {userPlan === 'FREE'
              ? 'As a FREE user, you can use: GPT-3.5 Turbo, GPT-4o Mini, Claude-3 Haiku, and Gemini 2.0 Flash'
              : 'Current AI models available in the router'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {getFilteredModels().length > 0 ? (
              getFilteredModels().map((model) => (
                <div
                  key={model.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.provider}</p>
                  </div>
                  <Badge
                    variant={model.available ? "default" : "secondary"}
                    className={model.available ? "bg-green-100 text-green-800" : ""}
                  >
                    {model.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Loading models...</p>
              </div>
            )}
          </div>
          {userPlan === 'FREE' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Want access to more models?</strong> Upgrade your plan to access GPT-4, Claude, and other premium models.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
