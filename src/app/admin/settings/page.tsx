'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUser } from '@clerk/nextjs';
import { BarChart3Icon, BellIcon, BrainIcon, PaletteIcon } from "lucide-react";
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState({
    // Preferencias de modelos
    defaultModel: 'gpt-4o-mini',
    preferredProviders: [] as string[],
    // Notificaciones
    emailNotifications: true,
    usageAlerts: true,
    weeklyReports: false,
    // UI/UX
    theme: 'light',
    language: 'es',
    compactView: false,
    // Límites y alertas
    usageAlertThreshold: 80,
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

          // Aplicar tema inmediatamente
          if (data.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (data.theme === 'light') {
            document.documentElement.classList.remove('dark');
          } else if (data.theme === 'auto') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', isDark);
          }

          // Guardar tema en localStorage
          localStorage.setItem('theme', data.theme);
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
      console.log('Saving settings:', settings);

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
      console.log('Settings saved successfully:', result);

      // Aplicar tema inmediatamente
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (settings.theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
      }

      // Guardar tema en localStorage
      localStorage.setItem('theme', settings.theme);

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
    'gpt-4o-mini',
    'gpt-4o',
    'claude-3-haiku',
    'claude-3-sonnet',
    'gemini-pro',
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
          Configure your Roulix account and preferences
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

            <div className="flex items-center justify-between">
              <div>
                <Label>Reportes Semanales</Label>
                <p className="text-sm text-slate-500">Recibir resumen semanal de uso</p>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, weeklyReports: checked })}
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

        {/* Interfaz de Usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
              <PaletteIcon className="w-5 h-5 mr-2" />
              Interfaz de Usuario
            </CardTitle>
            <CardDescription>
              Personaliza la apariencia de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme">Tema</Label>
              <Select value={settings.theme} onValueChange={(value) =>
                setSettings({ ...settings, theme: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select value={settings.language} onValueChange={(value) =>
                setSettings({ ...settings, language: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Vista Compacta</Label>
                <p className="text-sm text-slate-500">Mostrar más información en menos espacio</p>
              </div>
              <Switch
                checked={settings.compactView}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, compactView: checked })}
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

            <div>
              <Label>Plan Actual</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">Free</Badge>
                <span className="text-sm text-slate-500">0 / 1000 requests mensuales</span>
              </div>
            </div>

            <div>
              <Label>Miembro desde</Label>
              <Input
                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : ''}
                disabled
                className="mt-1 bg-slate-50"
              />
            </div>
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
