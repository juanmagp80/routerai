'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { ApiKeyService } from "@/lib/api-key-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, KeyIcon, CopyIcon, TrashIcon, AlertTriangleIcon } from "lucide-react";

interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_value: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export default function ApiKeysPage() {
  const { userId, isLoaded } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const loadApiKeys = async () => {
      try {
        const userApiKeys = await ApiKeyService.getApiKeysByUserId(userId);
        setApiKeys(userApiKeys);
      } catch (err) {
        console.error('Error loading API keys:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadApiKeys();
  }, [isLoaded, userId]);

  const createApiKey = async () => {
    if (!userId || !newKeyName.trim()) return;
    
    setIsCreatingKey(true);
    try {
      const keyValue = `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const newKey = await ApiKeyService.createApiKey({
        user_id: userId,
        name: newKeyName.trim(),
        key_value: keyValue,
        is_active: true
      });
      
      if (newKey) {
        setApiKeys([...apiKeys, newKey]);
        setNewKeyName('');
      }
    } catch (err) {
      console.error('Error creating API key:', err);
      setError(err instanceof Error ? err.message : 'Error creando API key');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
        <p className="text-slate-600 mt-1">
          Manage your RouterAI API access keys
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <KeyIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active API Keys</p>
                <p className="text-2xl font-bold text-slate-900">
                  {apiKeys.filter(key => key.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">∞</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Available Requests</p>
                <p className="text-2xl font-bold text-slate-900">Unlimited</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangleIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Key Limit</p>
                <p className="text-2xl font-bold text-slate-900">3 maximum</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Management */}
      <Card>
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Your API Keys
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Manage and monitor your API access keys
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={apiKeys.length >= 3}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nueva API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nueva API Key</DialogTitle>
                  <DialogDescription>
                    Genera una nueva clave API para tus aplicaciones
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="keyName" className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre de la API Key
                    </label>
                    <Input
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Mi Aplicación - Producción"
                      className="w-full"
                    />
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <AlertTriangleIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="ml-2">
                        <p className="text-xs text-yellow-800">
                          Guarda tu API key de forma segura. No podrás verla completa después de crearla.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={createApiKey}
                    disabled={isCreatingKey || !newKeyName.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isCreatingKey ? 'Creando...' : 'Crear API Key'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No hay API Keys configuradas
              </h3>
              <p className="text-slate-600 mb-6">
                Crea tu primera API key para empezar a usar RouterAI
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-slate-900">{key.name}</h3>
                        <Badge 
                          variant={key.is_active ? "default" : "secondary"}
                          className={key.is_active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}
                        >
                          {key.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <code className="bg-slate-100 text-slate-800 px-3 py-1 rounded-md text-sm font-mono">
                            {key.key_value.substring(0, 20)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(key.key_value)}
                            className="h-8 w-8 p-0 hover:bg-slate-200"
                          >
                            <CopyIcon className="w-4 h-4 text-slate-600" />
                          </Button>
                        </div>
                        <span className="text-sm text-slate-500">
                          Creada el {new Date(key.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Cómo usar tu API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">1. Autenticación</h4>
              <p className="text-sm text-slate-600 mb-2">
                Incluye tu API key en el header de autorización:
              </p>
              <div className="bg-slate-100 rounded-md p-3">
                <code className="text-sm font-mono text-slate-800">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-2">2. Endpoint Base</h4>
              <div className="bg-slate-100 rounded-md p-3">
                <code className="text-sm font-mono text-slate-800">
                  https://api.routerai.com/v1/
                </code>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">3. Ejemplo de Uso</h4>
              <div className="bg-slate-100 rounded-md p-3">
                <pre className="text-sm font-mono text-slate-800">
{`curl -X POST https://api.routerai.com/v1/route \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, world!",
    "models": ["gpt-4", "claude-3"]
  }'`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}