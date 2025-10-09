'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCardIcon, DollarSignIcon, TrendingUpIcon, CalendarIcon, DownloadIcon } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-600 mt-1">
          Gestiona tu facturación y uso de RouterAI
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Plan Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-blue-100 text-blue-800 text-base px-4 py-2">
                  Free Plan
                </Badge>
                <span className="text-2xl font-bold text-slate-900">$0/mes</span>
              </div>
              <p className="text-slate-600 mt-2">
                3 API Keys • 10,000 requests/mes • Soporte básico
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Upgrade a Pro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSignIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Gasto Este Mes</p>
                <p className="text-2xl font-bold text-slate-900">$0.00</p>
                <p className="text-xs text-green-600">Plan gratuito</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUpIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Requests Usados</p>
                <p className="text-2xl font-bold text-slate-900">2,847</p>
                <p className="text-xs text-slate-600">de 10,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Días Restantes</p>
                <p className="text-2xl font-bold text-slate-900">18</p>
                <p className="text-xs text-slate-600">hasta reset</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Planes Disponibles
          </CardTitle>
          <CardDescription>
            Elige el plan que mejor se adapte a tus necesidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="border-2 border-slate-200 rounded-lg p-6 relative">
              <Badge className="bg-slate-100 text-slate-800 absolute top-4 right-4">
                Actual
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">
                $0<span className="text-lg text-slate-600">/mes</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  3 API Keys
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  10,000 requests/mes
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Soporte básico
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Plan Actual
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-blue-500 rounded-lg p-6 relative bg-blue-50">
              <Badge className="bg-blue-500 text-white absolute top-4 right-4">
                Recomendado
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">
                $29<span className="text-lg text-slate-600">/mes</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  10 API Keys
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  100,000 requests/mes
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Soporte prioritario
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Analytics avanzados
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Upgrade a Pro
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="border-2 border-slate-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">
                Personalizado
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  API Keys ilimitadas
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Requests ilimitados
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Soporte 24/7
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  SLA garantizado
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Contactar Ventas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Historial de Facturación
              </CardTitle>
              <CardDescription>
                Tus facturas y pagos anteriores
              </CardDescription>
            </div>
            <Button variant="outline">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Descargar Todo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CreditCardIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No hay facturas disponibles
            </h3>
            <p className="text-slate-600 mb-6">
              Como estás en el plan gratuito, no tienes historial de facturación.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Upgrade para ver facturas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Método de Pago
          </CardTitle>
          <CardDescription>
            Gestiona tu método de pago principal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No hay método de pago configurado
            </h3>
            <p className="text-slate-600 mb-6">
              Agrega una tarjeta de crédito para upgradear tu plan
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Agregar Tarjeta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}