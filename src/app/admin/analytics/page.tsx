'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3Icon, TrendingUpIcon, ClockIcon, DollarSignIcon, ActivityIcon, Users2Icon } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">
          Monitorea el uso y rendimiento de tus API calls
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ActivityIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Requests Hoy</p>
                <p className="text-2xl font-bold text-slate-900">2,847</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUpIcon className="w-3 h-3 mr-1" />
                  +12% vs ayer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Tiempo Respuesta</p>
                <p className="text-2xl font-bold text-slate-900">247ms</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUpIcon className="w-3 h-3 mr-1" />
                  -5ms vs ayer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSignIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Costo Hoy</p>
                <p className="text-2xl font-bold text-slate-900">$12.34</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingUpIcon className="w-3 h-3 mr-1" />
                  +8% vs ayer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users2Icon className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-slate-900">99.8%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUpIcon className="w-3 h-3 mr-1" />
                  +0.2% vs ayer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Requests por Hora
            </CardTitle>
            <CardDescription>
              Últimas 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
              <div className="text-center">
                <BarChart3Icon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">Gráfico de Requests por Hora</p>
                <p className="text-sm text-slate-400">Próximamente disponible</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Modelos Más Utilizados
            </CardTitle>
            <CardDescription>
              Distribución del último mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-900">GPT-4</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm text-slate-600">65%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-900">Claude-3</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm text-slate-600">25%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-900">Gemini</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-sm text-slate-600">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimos requests a la API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '10:34 AM', model: 'GPT-4', status: 'success', response: '287ms', cost: '$0.045' },
              { time: '10:32 AM', model: 'Claude-3', status: 'success', response: '412ms', cost: '$0.032' },
              { time: '10:29 AM', model: 'GPT-4', status: 'error', response: '1.2s', cost: '$0.000' },
              { time: '10:25 AM', model: 'Gemini', status: 'success', response: '156ms', cost: '$0.018' },
              { time: '10:22 AM', model: 'GPT-4', status: 'success', response: '324ms', cost: '$0.051' },
            ].map((request, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-600 w-16">{request.time}</div>
                  <Badge variant="outline" className="text-xs">
                    {request.model}
                  </Badge>
                  <Badge 
                    variant={request.status === 'success' ? 'default' : 'destructive'}
                    className={`text-xs ${
                      request.status === 'success' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                        : 'bg-red-100 text-red-800 hover:bg-red-100'
                    }`}
                  >
                    {request.status === 'success' ? 'Éxito' : 'Error'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-6 text-sm text-slate-600">
                  <span>{request.response}</span>
                  <span className="font-medium">{request.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">99.98%</div>
            <p className="text-sm text-slate-600">Últimos 30 días</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Este mes</span>
                <span>99.98%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.98%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Latencia Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">247ms</div>
            <p className="text-sm text-slate-600">Tiempo de respuesta</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Objetivo: &lt;500ms</span>
                <span>Cumplido</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '49.4%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Requests Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">847K</div>
            <p className="text-sm text-slate-600">Este mes</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>vs mes anterior</span>
                <span className="text-green-600">+23%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}