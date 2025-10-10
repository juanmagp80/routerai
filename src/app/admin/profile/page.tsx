'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3, Key, DollarSign, Activity, TrendingUp } from "lucide-react";
import { useUserSync } from "@/hooks/useUserSync";
import { StatsService, UserStats } from "@/lib/stats-service";
import { useEffect, useState } from "react";

export default function UserProfile() {
  const { dbUser, clerkUser, isLoading: userLoading, error: userError } = useUserSync();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function loadUserStats() {
      if (!dbUser?.id) return;
      
      try {
        setIsLoadingStats(true);
        const stats = await StatsService.getUserStats(dbUser.id);
        setUserStats(stats);
      } catch (error) {
        console.error('Error cargando estadísticas del usuario:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    loadUserStats();
  }, [dbUser]);

  if (userLoading || isLoadingStats) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (userError || !dbUser) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error: {userError || 'Usuario no encontrado'}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={clerkUser?.imageUrl} alt={dbUser.name} />
          <AvatarFallback className="text-lg">
            {getInitials(dbUser.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dbUser.name}</h1>
          <p className="text-muted-foreground">{dbUser.email}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={dbUser.is_active ? "default" : "secondary"}>
              {dbUser.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
            <Badge variant="outline">{dbUser.plan}</Badge>
            {dbUser.email_verified && (
              <Badge variant="secondary" className="text-green-600">
                Email Verificado
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.total_api_calls.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              llamadas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.active_api_keys || 0}</div>
            <p className="text-xs text-muted-foreground">
              de {dbUser.api_key_limit} permitidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${userStats?.total_cost.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              gasto acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Éxito</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.success_rate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              tasa de éxito
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>
              Detalles de tu cuenta y configuración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Plan:</span>
              <Badge variant="outline">{dbUser.plan}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Límite API Keys:</span>
              <span className="text-sm">{dbUser.api_key_limit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Fecha de registro:</span>
              <span className="text-sm">{formatDate(dbUser.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Última actualización:</span>
              <span className="text-sm">{formatDate(dbUser.updated_at)}</span>
            </div>
            {dbUser.company && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Empresa:</span>
                <span className="text-sm">{dbUser.company}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Tu uso más reciente de la API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats?.last_api_call ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Última llamada API</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(userStats.last_api_call)}
                      </p>
                    </div>
                  </div>
                  {userStats.favorite_model && (
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Modelo favorito</p>
                        <p className="text-xs text-muted-foreground">
                          {userStats.favorite_model}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Sin actividad reciente</p>
                  <p className="text-xs mt-1">Realiza tu primera llamada API</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <Button>
          <Key className="mr-2 h-4 w-4" />
          Gestionar API Keys
        </Button>
        <Button variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Ver Estadísticas Detalladas
        </Button>
      </div>
    </div>
  );
}