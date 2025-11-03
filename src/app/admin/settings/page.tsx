'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUser } from '@clerk/nextjs';
import { BarChart3Icon, BellIcon, BrainIcon, ShieldIcon } from "lucide-react";
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState({
    // Preferencias de modelos
    defaultModel: 'auto',
    preferredProviders: [] as string[],
    // Notificaciones
    emailNotifications: true,
    usageAlerts: true,
    // Límites y alertas
    usageAlertThreshold: 80,
    dailyLimit: undefined as number | undefined,
    costProtection: true,
    autoModelRotation: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saved, setSaved] = useState(false);

  // Cargar configuraciones al iniciar
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {

      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error('Error saving settings');
      }

      const result = await response.json();

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const availableModels = [
    'auto',
    'gpt-4o-mini',
    'gpt-4o',
    'claude-3-haiku',
    'claude-3-sonnet',
    'claude-3.5-sonnet',
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'llama-3.1-8b',
    'mixtral-8x7b'
  ];

  // Mapeo de nombres mostrados a nombres internos (keys del AI_PROVIDERS)
  const providerMapping: Record<string, string> = {
    'OpenAI': 'openai',
    'Anthropic': 'anthropic',
    'Google': 'google',
    'Together/Meta': 'meta',
    'Mistral': 'mistral',
    'Grok': 'grok'
  };

  const availableProviders = [
    'OpenAI',
    'Anthropic',
    'Google',
    'Together/Meta',
    'Mistral',
    'Grok'
  ];

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Configure your Roulyx account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preferencias de Modelos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
              <BrainIcon className="w-5 h-5 mr-2" />
              Preferencias de Modelos
            </CardTitle>
            <CardDescription>
              Configura tus modelos de IA preferidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultModel">Modelo por Defecto</Label>
              <Select value={settings.defaultModel} onValueChange={(value) =>
                setSettings({ ...settings, defaultModel: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Proveedores Preferidos</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableProviders.map(provider => {
                  const internalName = providerMapping[provider];
                  // También check por nombres antiguos para compatibilidad
                  const isChecked = settings.preferredProviders.includes(internalName) ||
                    (provider === 'Together/Meta' && (
                      settings.preferredProviders.includes('Together') ||
                      settings.preferredProviders.includes('Meta (Llama)') ||
                      settings.preferredProviders.includes('meta')
                    ));

                  return (
                    <div key={provider} className="flex items-center space-x-2">
                      <Switch
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Limpiar versiones anteriores y añadir la correcta
                            const cleanProviders = settings.preferredProviders.filter(p =>
                              p !== 'Together' &&
                              p !== 'Meta (Llama)' &&
                              p !== internalName &&
                              p !== 'meta'
                            );
                            setSettings({
                              ...settings,
                              preferredProviders: [...cleanProviders, internalName]
                            });
                          } else {
                            setSettings({
                              ...settings,
                              preferredProviders: settings.preferredProviders.filter(p =>
                                p !== internalName &&
                                p !== 'Together' &&
                                p !== 'Meta (Llama)' &&
                                p !== 'meta'
                              )
                            });
                          }
                        }}
                      />
                      <Label className="text-sm">{provider}</Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
              <BellIcon className="w-5 h-5 mr-2" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Gestiona cómo quieres recibir notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones por Email</Label>
                <p className="text-sm text-slate-500">Recibir notificaciones importantes por email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Uso</Label>
                <p className="text-sm text-slate-500">Notificar cuando se acerque al límite</p>
              </div>
              <Switch
                checked={settings.usageAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, usageAlerts: checked })}
              />
            </div>

            {settings.usageAlerts && (
              <div>
                <Label htmlFor="threshold">Umbral de Alerta (%)</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="50"
                  max="95"
                  value={settings.usageAlertThreshold}
                  onChange={(e) => setSettings({
                    ...settings,
                    usageAlertThreshold: parseInt(e.target.value) || 80
                  })}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Alertar cuando el uso supere este porcentaje
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuración de Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
              <ShieldIcon className="w-5 h-5 mr-2" />
              Límites y Seguridad
            </CardTitle>
            <CardDescription>
              Configura límites de uso y alertas de seguridad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dailyLimit">Límite Diario de Requests (opcional)</Label>
              <Input
                id="dailyLimit"
                type="number"
                min="1"
                max="1000"
                placeholder="Sin límite"
                value={settings.dailyLimit || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  dailyLimit: e.target.value ? parseInt(e.target.value) : undefined
                })}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Opcional: Establece un límite diario para controlar gastos
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Protección de Costos</Label>
                <p className="text-sm text-slate-500">Pausar automáticamente si hay picos inusuales</p>
              </div>
              <Switch
                checked={settings.costProtection || true}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, costProtection: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Rotación Automática de Modelos</Label>
                <p className="text-sm text-slate-500">Cambiar automáticamente si un modelo falla</p>
              </div>
              <Switch
                checked={settings.autoModelRotation || false}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoModelRotation: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información de Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
              <BarChart3Icon className="w-5 h-5 mr-2" />
              Información de Cuenta
            </CardTitle>
            <CardDescription>
              Detalles de tu cuenta y plan actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                value={user?.emailAddresses[0]?.emailAddress || ''}
                disabled
                className="mt-1 bg-slate-50"
              />
            </div>

            <AccountInfoSection />
          </CardContent>
        </Card>
      </div>

      {/* Botón de Guardar */}
      <div className="flex justify-end pt-6 border-t border-slate-200">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </div>
          ) : saved ? (
            '✓ Guardado'
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </div>
  );
}

// Componente para mostrar información real de la cuenta
function AccountInfoSection() {
  const [accountInfo, setAccountInfo] = useState<{
    plan: string;
    usage: number;
    limit: number;
    apiKeys: number;
    memberSince: string | null;
    loading: boolean;
  }>({
    plan: 'loading...',
    usage: 0,
    limit: 0,
    apiKeys: 0,
    memberSince: null,
    loading: true
  });

  useEffect(() => {
    const loadAccountInfo = async () => {
      try {
        const response = await fetch('/api/user/account-info');

        if (response.ok) {
          const data = await response.json();

          setAccountInfo({
            plan: data.plan || 'free',
            usage: data.usage || 0,
            limit: data.limit || 0,
            apiKeys: data.apiKeys || 0,
            memberSince: data.memberSince,
            loading: false
          });
        } else {
          console.error('❌ Failed to load account info:', response.status);
          setAccountInfo(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('❌ Error loading account info:', error);
        setAccountInfo(prev => ({ ...prev, loading: false }));
      }
    };

    loadAccountInfo();
  }, []);

  if (accountInfo.loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const planNames: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise'
  };

  const planColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    free: 'outline',
    starter: 'secondary',
    pro: 'default',
    enterprise: 'destructive'
  };

  return (
    <>
      <div>
        <Label>Plan Actual</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant={planColors[accountInfo.plan]}>
            {planNames[accountInfo.plan] || accountInfo.plan}
          </Badge>
          <span className="text-sm text-slate-500">
            {accountInfo.usage.toLocaleString()} / {accountInfo.limit.toLocaleString()} requests mensuales
          </span>
        </div>
      </div>

      <div>
        <Label>API Keys Activas</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant="outline">{accountInfo.apiKeys}</Badge>
          <span className="text-sm text-slate-500">
            claves API configuradas
          </span>
        </div>
      </div>

      {accountInfo.memberSince && (
        <div>
          <Label>Miembro desde</Label>
          <Input
            value={new Date(accountInfo.memberSince).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            disabled
            className="mt-1 bg-slate-50"
          />
        </div>
      )}
    </>
  );
}
