import { Route, Clock, Ruler, Shield, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouteData } from '@/components/RouteResults';
import { RouteRiskInfo } from '@/services/routingService';

interface RouteComparisonPanelProps {
  routes: RouteData[];
  routeRiskInfo: RouteRiskInfo[];
  selectedRoute: number;
  onRouteSelect: (index: number) => void;
}

const RouteComparisonPanel = ({
  routes,
  routeRiskInfo,
  selectedRoute,
  onRouteSelect,
}: RouteComparisonPanelProps) => {
  if (routes.length === 0) return null;

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { label: 'Low', color: 'text-success', bg: 'bg-success/10', border: 'border-success' };
    if (score <= 60) return { label: 'Medium', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning' };
    return { label: 'High', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive' };
  };

  const safestIndex = routes.reduce(
    (minIdx, route, idx, arr) => (route.riskScore < arr[minIdx].riskScore ? idx : minIdx),
    0
  );

  const fastestIndex = routes.reduce((minIdx, route, idx, arr) => {
    const parseTime = (eta: string) => {
      const match = eta.match(/(\d+)h?\s*(\d+)?/);
      if (!match) return 0;
      const hours = eta.includes('h') ? parseInt(match[1]) : 0;
      const mins = eta.includes('h') ? parseInt(match[2] || '0') : parseInt(match[1]);
      return hours * 60 + mins;
    };
    return parseTime(route.eta) < parseTime(arr[minIdx].eta) ? idx : minIdx;
  }, 0);

  return (
    <Card className="bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Route className="w-4 h-4 text-secondary" />
          Route Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {routes.map((route, index) => {
            const risk = getRiskLevel(route.riskScore);
            const isSafest = index === safestIndex;
            const isFastest = index === fastestIndex;
            const isSelected = index === selectedRoute;
            const riskInfo = routeRiskInfo[index];

            return (
              <button
                key={route.id}
                onClick={() => onRouteSelect(index)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? isSafest
                      ? 'border-success bg-success/5 shadow-md'
                      : 'border-secondary bg-secondary/5 shadow-md'
                    : 'border-border hover:border-muted-foreground/30 bg-background/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isSelected ? (isSafest ? 'text-success' : 'text-secondary') : 'text-foreground'}`}>
                      Route {route.id}
                    </span>
                    <div className="flex gap-1">
                      {isSafest && (
                        <span className="flex items-center gap-0.5 text-[10px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                          <Shield className="w-2.5 h-2.5" />
                          Safest
                        </span>
                      )}
                      {isFastest && !isSafest && (
                        <span className="flex items-center gap-0.5 text-[10px] font-medium text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">
                          <Clock className="w-2.5 h-2.5" />
                          Fastest
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
                      <Ruler className="w-3 h-3" />
                      Distance
                    </div>
                    <div className="text-sm font-semibold text-foreground">{route.distance}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
                      <Clock className="w-3 h-3" />
                      Time
                    </div>
                    <div className="text-sm font-semibold text-foreground">{route.eta}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      Risk
                    </div>
                    <div className={`text-sm font-bold ${risk.color}`}>{route.riskScore}</div>
                  </div>
                </div>

                {/* Risk Bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      route.riskScore <= 30 ? 'bg-success' : route.riskScore <= 60 ? 'bg-warning' : 'bg-destructive'
                    }`}
                    style={{ width: `${route.riskScore}%` }}
                  />
                </div>

                {/* Key Differences */}
                {riskInfo?.nearbyHotspots?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className={`px-1.5 py-0.5 rounded ${risk.bg} ${risk.color}`}>
                      {riskInfo.nearbyHotspots.length} hotspot{riskInfo.nearbyHotspots.length > 1 ? 's' : ''} nearby
                    </span>
                    {riskInfo.riskFactors.length > 0 && (
                      <span className="truncate">• {riskInfo.riskFactors[0]}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Summary */}
        {routes.length > 1 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {routes.length} routes compared
              </span>
              <span className="flex items-center gap-1">
                Route {routes[safestIndex].id} recommended
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteComparisonPanel;