'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Cpu, Clock, TrendingUp, Activity, DollarSign, CheckCircle } from "lucide-react";
import { useUserSync } from "@/hooks/useUserSync";
import { StatsService, DashboardStats } from "@/lib/stats-service";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { dbUser, isLoading: userLoading, error: userError } = useUserSync();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoadingStats(true);
        const dashboardStats = await StatsService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    if (dbUser) {
      loadStats();
    }
  }, [dbUser]);

  if (userLoading || isLoadingStats) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error: {userError}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleViewDetails = (section: string) => {
    console.log(`View details for ${section}`);
  };

  const handleViewAnalytics = (type: string) => {
    console.log(`View analytics for ${type}`);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {dbUser?.name}
          </p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Llamadas API Totales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.api_calls.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className={stats && stats.usage_trend >= 0 ? "text-green-600" : "text-red-600"}>
                {stats && stats.usage_trend >= 0 ? '+' : ''}{stats?.usage_trend.toFixed(1) || 0}%
              </Badge>
              {" "}desde el mes pasado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => handleViewDetails('users')}
              >
                Ver detalles
              </Button>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos Disponibles</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.models_available || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="outline" className="text-green-600">
                {stats?.active_models || 0} activos
              </Badge>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avg_response_time.toFixed(2) || 0}s</div>
            <p className="text-xs text-muted-foreground">
              En todos los modelos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.success_rate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => handleViewAnalytics('performance')}
              >
                Ver análisis
              </Button>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary" className="text-green-600">
                Operativo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Todos los sistemas funcionando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas llamadas API y eventos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.api_calls === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay actividad reciente</p>
                  <p className="text-xs mt-1">Las llamadas API aparecerán aquí</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Llamada API exitosa</p>
                      <p className="text-xs text-muted-foreground">Datos reales disponibles</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Usuario sincronizado</p>
                      <p className="text-xs text-muted-foreground">{dbUser?.name}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Tareas administrativas comunes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Gestionar Usuarios
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Cpu className="mr-2 h-4 w-4" />
              Configurar Modelos
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver Análisis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}