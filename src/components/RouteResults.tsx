import { Route, Clock, Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface RouteData {
  id: number;
  distance: string;
  eta: string;
  riskScore: number;
}

interface RouteResultsProps {
  routes: RouteData[];
  safeRouteIndex: number;
  onRouteSelect?: (index: number) => void;
  selectedRoute?: number;
}

const RouteResults = ({ routes, safeRouteIndex, onRouteSelect, selectedRoute }: RouteResultsProps) => {
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { label: 'Low Risk', color: 'text-success', bg: 'bg-success/10' };
    if (score <= 60) return { label: 'Medium Risk', color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'High Risk', color: 'text-danger', bg: 'bg-danger/10' };
  };

  if (routes.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-elevated p-5 animate-slide-in-right">
        <div className="flex items-center gap-2 mb-4">
          <Route className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-display font-bold text-foreground">Route Results</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No routes found</p>
          <p className="text-muted-foreground text-xs mt-1">Enter coordinates to find routes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-elevated p-5 animate-slide-in-right">
      <div className="flex items-center gap-2 mb-4">
        <Route className="w-5 h-5 text-secondary" />
        <h2 className="text-lg font-display font-bold text-foreground">Route Results</h2>
      </div>

      <div className="space-y-3">
        {routes.map((route, index) => {
          const isSafest = index === safeRouteIndex;
          const isSelected = selectedRoute === index;
          const risk = getRiskLevel(route.riskScore);

          return (
            <button
              key={route.id}
              onClick={() => onRouteSelect?.(index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isSafest
                  ? 'border-success bg-success/5 shadow-glow animate-pulse-glow'
                  : isSelected
                  ? 'border-secondary bg-secondary/5'
                  : 'border-border hover:border-muted-foreground/30 bg-background'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isSafest ? 'text-success' : 'text-foreground'}`}>
                    Route {route.id}
                  </span>
                  {isSafest && (
                    <span className="flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Safest
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${risk.bg} ${risk.color}`}>
                  <Gauge className="w-3 h-3" />
                  {risk.label}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Distance</p>
                  <p className="font-semibold text-foreground">{route.distance}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">ETA</p>
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {route.eta}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Risk Score</p>
                  <p className={`font-bold ${risk.color}`}>{route.riskScore}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RouteResults;
