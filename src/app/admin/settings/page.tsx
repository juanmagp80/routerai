'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2Icon, BellIcon, ShieldIcon, KeyIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Configura tu cuenta y preferencias de RouterAI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                <Settings2Icon className="w-5 h-5 mr-2" />
                Configuración General
              </CardTitle>
              <CardDescription>
                Configuraciones básicas de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" placeholder="Tu nombre" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" placeholder="Tu apellido" className="mt-1" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" className="mt-1" />
                <p className="text-xs text-slate-500 mt-1">
                  Tu email principal para notificaciones importantes
                </p>
              </div>

              <div>
                <Label htmlFor="company">Empresa (Opcional)</Label>
                <Input id="company" placeholder="Tu empresa" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona tu zona horaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america/madrid">Europa/Madrid (GMT+1)</SelectItem>
                    <SelectItem value="america/new_york">América/Nueva York (GMT-5)</SelectItem>
                    <SelectItem value="america/los_angeles">América/Los Ángeles (GMT-8)</SelectItem>
                    <SelectItem value="asia/tokyo">Asia/Tokio (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                <KeyIcon className="w-5 h-5 mr-2" />
                Configuración de API
              </CardTitle>
              <CardDescription>
                Configura el comportamiento de tus API calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="defaultModel">Modelo por Defecto</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona modelo por defecto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude-3</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxTokens">Límite de Tokens por Defecto</Label>
                <Input id="maxTokens" type="number" placeholder="2048" className="mt-1" />
                <p className="text-xs text-slate-500 mt-1">
                  Número máximo de tokens para respuestas (máx: 4096)
                </p>
              </div>

              <div>
                <Label htmlFor="temperature">Temperatura por Defecto</Label>
                <Input id="temperature" type="number" step="0.1" placeholder="0.7" className="mt-1" />
                <p className="text-xs text-slate-500 mt-1">
                  Controla la creatividad de las respuestas (0.0 - 1.0)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-fallback</Label>
                  <p className="text-sm text-slate-600">
                    Cambiar automáticamente a otro modelo si falla
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Logging Detallado</Label>
                  <p className="text-sm text-slate-600">
                    Registrar información detallada de requests
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                <ShieldIcon className="w-5 h-5 mr-2" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Configuraciones de seguridad y acceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticación de Dos Factores</Label>
                  <p className="text-sm text-slate-600">
                    Protege tu cuenta con 2FA
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones de Login</Label>
                  <p className="text-sm text-slate-600">
                    Recibir email cuando inicies sesión
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div>
                <Label htmlFor="allowedIPs">IPs Permitidas (Opcional)</Label>
                <Textarea 
                  id="allowedIPs" 
                  placeholder="192.168.1.100&#10;10.0.0.50&#10;203.0.113.45"
                  className="mt-1"
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Restringe el acceso a tu API desde IPs específicas (una por línea)
                </p>
              </div>

              <div>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Revocar Todas las Sesiones
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Plan Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                  Free Plan
                </Badge>
                <p className="text-sm text-slate-600 mt-2">
                  3 API Keys máximo
                </p>
                <p className="text-sm text-slate-600">
                  10,000 requests/mes
                </p>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Uso Este Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>API Calls</span>
                    <span>2,847 / 10,000</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '28.47%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage</span>
                    <span>124 MB / 1 GB</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '12.4%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                <BellIcon className="w-5 h-5 mr-2" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Email Alerts</Label>
                  <p className="text-xs text-slate-600">
                    Errores críticos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Usage Alerts</Label>
                  <p className="text-xs text-slate-600">
                    80% del límite
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Weekly Reports</Label>
                  <p className="text-xs text-slate-600">
                    Resumen semanal
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-900">
                Zona de Peligro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                Eliminar Todos los Datos
              </Button>
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                Cerrar Cuenta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-slate-200">
        <div className="flex space-x-3">
          <Button variant="outline">
            Cancelar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}