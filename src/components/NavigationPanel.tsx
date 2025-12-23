import { NavigationStep } from '@/services/routingService';
import { Navigation, ChevronRight, MapPin, AlertTriangle, Gauge, Shield, Clock, Route, Car, Zap } from 'lucide-react';

interface NavigationPanelProps {
  steps: NavigationStep[];
  routeId: number;
  totalDistance?: string;
  totalDuration?: string;
}

const NavigationPanel = ({ steps, routeId, totalDistance, totalDuration }: NavigationPanelProps) => {
  if (steps.length === 0) {
    return null;
  }

  const dangerZoneCount = steps.filter(s => s.isNearDangerZone).length;
  const stepsWithSpeedLimits = steps.filter(s => s.speedLimit);
  const averageSpeedLimit = stepsWithSpeedLimits.length > 0 
    ? Math.round(stepsWithSpeedLimits.reduce((sum, s) => sum + (s.speedLimit || 0), 0) / stepsWithSpeedLimits.length)
    : null;
  const minSpeedLimit = stepsWithSpeedLimits.length > 0 
    ? Math.min(...stepsWithSpeedLimits.map(s => s.speedLimit || 100))
    : null;

  return (
    <div className="bg-card rounded-2xl shadow-elevated p-5 animate-slide-in-right">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-display font-bold text-foreground">
            Route {routeId} Directions
          </h2>
        </div>
        {dangerZoneCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            {dangerZoneCount} danger zone{dangerZoneCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Traffic Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {totalDistance && (
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <Route className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm font-bold text-foreground">{totalDistance}</div>
            <div className="text-xs text-muted-foreground">Distance</div>
          </div>
        )}
        {totalDuration && (
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm font-bold text-foreground">{totalDuration}</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
        )}
        {averageSpeedLimit && (
          <div className="bg-warning/10 rounded-lg p-2 text-center">
            <Car className="w-4 h-4 mx-auto mb-1 text-warning" />
            <div className="text-sm font-bold text-foreground">{averageSpeedLimit} km/h</div>
            <div className="text-xs text-muted-foreground">Avg Speed</div>
          </div>
        )}
        {minSpeedLimit && (
          <div className="bg-destructive/10 rounded-lg p-2 text-center">
            <Zap className="w-4 h-4 mx-auto mb-1 text-destructive" />
            <div className="text-sm font-bold text-foreground">{minSpeedLimit} km/h</div>
            <div className="text-xs text-muted-foreground">Min Speed</div>
          </div>
        )}
      </div>

      {/* Safety Summary */}
      {dangerZoneCount > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-warning" />
            <span className="font-medium text-sm text-foreground">Safety Advisory</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This route passes through {dangerZoneCount} accident-prone area{dangerZoneCount > 1 ? 's' : ''}. 
            Watch for speed limit advisories and caution warnings below.
          </p>
        </div>
      )}

      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
        {steps.map((step, index) => (
          <div key={index}>
            {/* Danger Zone Alert - Show before the step */}
            {step.isNearDangerZone && step.cautionWarning && (
              <div className="mb-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 animate-pulse-slow">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-destructive">{step.cautionWarning}</p>
                    {step.dangerZoneInfo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {step.dangerZoneInfo.city} - {step.dangerZoneInfo.totalAccidents} accidents recorded
                        {step.dangerZoneInfo.fatalAccidents > 0 && (
                          <span className="text-destructive"> ({step.dangerZoneInfo.fatalAccidents} fatal)</span>
                        )}
                      </p>
                    )}
                    {step.speedLimit && (
                      <div className="flex items-center gap-1 mt-2">
                        <Gauge className="w-3 h-3 text-warning" />
                        <span className="text-xs font-medium text-warning">
                          Recommended speed: {step.speedLimit} km/h
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Step */}
            <div
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                index === 0
                  ? 'bg-secondary/10'
                  : index === steps.length - 1
                  ? 'bg-success/10'
                  : step.isNearDangerZone
                  ? 'bg-destructive/5 border-l-2 border-destructive'
                  : 'hover:bg-muted'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                step.isNearDangerZone ? 'bg-destructive/20' : 'bg-muted'
              }`}>
                {step.maneuver}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{step.instruction}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{step.distance}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{step.duration}</span>
                </div>
                
                {/* Speed Suggestion for every step */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {step.isNearDangerZone ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/15 border border-destructive/30">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-xs font-semibold text-destructive">
                        Reduce to {step.speedLimit || 30} km/h
                      </span>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                      step.speedLimit && step.speedLimit <= 40 
                        ? 'bg-warning/15 border border-warning/30' 
                        : 'bg-success/15 border border-success/30'
                    }`}>
                      <Gauge className={`w-3.5 h-3.5 ${
                        step.speedLimit && step.speedLimit <= 40 ? 'text-warning' : 'text-success'
                      }`} />
                      <span className={`text-xs font-medium ${
                        step.speedLimit && step.speedLimit <= 40 ? 'text-warning' : 'text-success'
                      }`}>
                        Suggested: {step.speedLimit || 50} km/h
                      </span>
                    </div>
                  )}
                  
                  {/* Additional warning for accident zone proximity */}
                  {step.dangerZoneInfo && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                      ⚠️ {step.dangerZoneInfo.totalAccidents} accidents nearby
                    </span>
                  )}
                </div>
              </div>
              {index === steps.length - 1 && (
                <MapPin className="w-4 h-4 text-success flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground font-medium mb-2">Legend:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-secondary/30"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success/30"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive/30"></div>
            <span>Danger Zone</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="w-3 h-3 text-warning" />
            <span>Speed Limit</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs mt-2">
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-destructive/20 text-destructive text-[10px]">≤30</span>
            <span>Slow</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-warning/20 text-warning text-[10px]">31-50</span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-success/20 text-success text-[10px]">&gt;50</span>
            <span>Normal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel;