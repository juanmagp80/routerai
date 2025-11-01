import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Shield, TestTube, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DemoUsageStats {
  requestsToday: number;
  remainingRequests: number;
  totalCostToday: number;
  resetTime: string;
}

export function DemoLimitsCard() {
  const [usageStats, setUsageStats] = useState<DemoUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if we're in demo mode
    const checkDemoMode = async () => {
      try {
        const response = await fetch('/api/demo/status');
        const data = await response.json();
        setIsDemoMode(data.isDemoMode);
        
        if (data.isDemoMode) {
          // Get usage stats
          const statsResponse = await fetch('/api/demo/usage-stats');
          if (statsResponse.ok) {
            const stats = await statsResponse.json();
            setUsageStats(stats);
          }
        }
      } catch (error) {
        console.error('Error checking demo status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDemoMode();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(checkDemoMode, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-amber-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-amber-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isDemoMode) {
    return null;
  }

  const usagePercentage = usageStats ? 
    (usageStats.requestsToday / (usageStats.requestsToday + usageStats.remainingRequests)) * 100 : 0;

  const resetDate = usageStats ? new Date(usageStats.resetTime) : new Date();
  const timeUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60));

  return (
    <div className="space-y-4">
      {/* Demo Mode Alert */}
      <Alert className="border-green-200 bg-green-50">
        <TestTube className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Modo Demo Activo</strong> - Límites configurados en proveedores para protección total
        </AlertDescription>
      </Alert>

      {/* Usage Stats Card */}
      {usageStats && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Estado del Demo
              </CardTitle>
              <Badge variant="outline" className="text-green-700 border-green-300">
                Portfolio Demo
              </Badge>
            </div>
            <CardDescription>
              Monitoreo del uso con protección total configurada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Request Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Requests Hoy</span>
                <span className="text-sm text-muted-foreground">
                  {usageStats.requestsToday} / {usageStats.requestsToday + usageStats.remainingRequests}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {usageStats.remainingRequests} requests restantes
              </p>
            </div>

            {/* Cost Today */}
            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm">Costo Hoy:</span>
              <span className="text-sm font-mono">
                ${usageStats.totalCostToday.toFixed(4)}
              </span>
            </div>

            {/* Reset Timer */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Límites se reinician en {timeUntilReset}h
            </div>

            {/* Demo Features */}
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2">
                ✅ Protecciones Configuradas:
              </h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Límites configurados en cada proveedor de AI</li>
                <li>• Todos los modelos disponibles para demostración</li>
                <li>• Protección automática contra gastos excesivos</li>
                <li>• Monitoreo en tiempo real del uso</li>
              </ul>
            </div>

            {/* Portfolio Note */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Proyecto de Portfolio
                  </p>
                  <p className="text-xs text-blue-700">
                    Estas limitaciones protegen contra costos excesivos mientras 
                    demuestran funcionalidad completa del SaaS.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}