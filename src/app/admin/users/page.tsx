'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UsersIcon, UserPlusIcon, ShieldIcon, MailIcon } from "lucide-react";

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: "Juan Manuel",
      email: "juan@example.com",
      plan: "Free",
      status: "Active",
      apiKeys: 2,
      lastLogin: "2 hours ago",
      joinDate: "2024-01-15"
    },
    {
      id: 2,
      name: "María García",
      email: "maria@example.com",
      plan: "Pro",
      status: "Active",
      apiKeys: 5,
      lastLogin: "1 day ago",
      joinDate: "2024-02-03"
    },
    {
      id: 3,
      name: "Carlos López",
      email: "carlos@example.com",
      plan: "Free",
      status: "Inactive",
      apiKeys: 1,
      lastLogin: "1 week ago",
      joinDate: "2024-01-28"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
            <p className="text-slate-600 mt-1">
              Gestiona los usuarios de tu plataforma RouterAI
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Invitar Usuario
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-slate-900">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShieldIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-slate-900">1,156</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserPlusIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Nuevos Este Mes</p>
                <p className="text-2xl font-bold text-slate-900">73</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MailIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Invitaciones Pendientes</p>
                <p className="text-2xl font-bold text-slate-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Usuarios Registrados
          </CardTitle>
          <CardDescription>
            Lista de todos los usuarios en tu plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 font-medium text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-900">{user.plan}</p>
                    <p className="text-xs text-slate-500">Plan</p>
                  </div>
                  
                  <div className="text-center">
                    <Badge 
                      variant={user.status === 'Active' ? 'default' : 'secondary'}
                      className={user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}
                    >
                      {user.status}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-900">{user.apiKeys}</p>
                    <p className="text-xs text-slate-500">API Keys</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-slate-900">{user.lastLogin}</p>
                    <p className="text-xs text-slate-500">Último login</p>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Actividad Reciente de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { user: "Juan Manuel", action: "Creó una nueva API Key", time: "Hace 2 horas", type: "create" },
              { user: "María García", action: "Actualizó su perfil", time: "Hace 5 horas", type: "update" },
              { user: "Carlos López", action: "Eliminó una API Key", time: "Hace 1 día", type: "delete" },
              { user: "Ana Martínez", action: "Se registró en la plataforma", time: "Hace 2 días", type: "register" },
              { user: "Pedro Sánchez", action: "Cambió a plan Pro", time: "Hace 3 días", type: "upgrade" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'create' ? 'bg-green-100' :
                    activity.type === 'update' ? 'bg-blue-100' :
                    activity.type === 'delete' ? 'bg-red-100' :
                    activity.type === 'register' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'create' ? 'bg-green-500' :
                      activity.type === 'update' ? 'bg-blue-500' :
                      activity.type === 'delete' ? 'bg-red-500' :
                      activity.type === 'register' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {activity.user}
                    </p>
                    <p className="text-sm text-slate-600">
                      {activity.action}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}