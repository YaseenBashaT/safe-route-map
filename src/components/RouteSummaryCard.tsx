import { Shield, Clock, AlertTriangle, Navigation, Zap, CheckCircle2 } from 'lucide-react';
import { RouteRiskInfo } from '@/services/routingService';
import { RouteData } from '@/components/RouteResults';
import { AccidentHotspot } from '@/services/accidentDataService';

interface RouteSummaryCardProps {
  route: RouteData;
  riskInfo: RouteRiskInfo;
  routeAccidents: AccidentHotspot[];
  isSelected: boolean;
  onStartNavigation: () => void;
}

const RouteSummaryCard = ({ 
  route, 
  riskInfo, 
  routeAccidents,
  isSelected,
  onStartNavigation 
}: RouteSummaryCardProps) => {
  const getSafetyRating = (riskScore: number) => {
    if (riskScore <= 25) return { label: 'Very Safe', color: 'text-success', bg: 'bg-success/10', stars: 5 };
    if (riskScore <= 40) return { label: 'Safe', color: 'text-success', bg: 'bg-success/10', stars: 4 };
    if (riskScore <= 55) return { label: 'Moderate', color: 'text-warning', bg: 'bg-warning/10', stars: 3 };
    if (riskScore <= 70) return { label: 'Risky', color: 'text-orange-500', bg: 'bg-orange-500/10', stars: 2 };
    return { label: 'High Risk', color: 'text-danger', bg: 'bg-danger/10', stars: 1 };
  };

  const calculateSafeTravelTime = (eta: string, dangerZones: number): string => {
    // Parse ETA
    const hoursMatch = eta.match(/(\d+)h/);
    const minsMatch = eta.match(/(\d+)\s*min/);
    
    let totalMinutes = 0;
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
    if (minsMatch) totalMinutes += parseInt(minsMatch[1]);
    
    // Add safety buffer: 2 min per danger zone for safe driving
    const safetyBuffer = dangerZones * 2;
    totalMinutes += safetyBuffer;
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const safety = getSafetyRating(route.riskScore);
  const dangerZoneCount = riskInfo.dangerZones?.length || 0;
  const safeTravelTime = calculateSafeTravelTime(route.eta, dangerZoneCount);
  const totalAccidentsOnRoute = routeAccidents.reduce((sum, h) => sum + h.totalAccidents, 0);
  const fatalOnRoute = routeAccidents.reduce((sum, h) => sum + h.fatalAccidents, 0);

  if (!isSelected) return null;

  return (
    <div className="bg-card rounded-2xl shadow-elevated p-5 animate-fade-in border-2 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-bold text-foreground">Route Summary</h2>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          Route {route.id}
        </span>
      </div>

      {/* Safety Rating */}
      <div className={`p-4 rounded-xl ${safety.bg} mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className={`w-8 h-8 ${safety.color}`} />
            <div>
              <p className={`text-lg font-bold ${safety.color}`}>{safety.label}</p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < safety.stars ? 'text-yellow-400' : 'text-muted-foreground/30'}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{route.riskScore}</p>
            <p className="text-xs text-muted-foreground">Risk Score</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Danger Zones */}
        <div className="p-3 rounded-lg bg-danger/5 border border-danger/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <span className="text-xs text-muted-foreground">Danger Zones</span>
          </div>
          <p className="text-xl font-bold text-foreground">{dangerZoneCount}</p>
        </div>

        {/* Safe Travel Time */}
        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Safe ETA</span>
          </div>
          <p className="text-xl font-bold text-foreground">{safeTravelTime}</p>
        </div>

        {/* Total Accidents */}
        <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Past Accidents</span>
          </div>
          <p className="text-xl font-bold text-foreground">{totalAccidentsOnRoute}</p>
        </div>

        {/* Fatal */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <span className="text-xs text-muted-foreground">Fatal Cases</span>
          </div>
          <p className="text-xl font-bold text-danger">{fatalOnRoute}</p>
        </div>
      </div>

      {/* Distance & Time */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Distance</p>
          <p className="font-semibold text-foreground">{route.distance}</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-xs text-muted-foreground">Normal ETA</p>
          <p className="font-semibold text-foreground">{route.eta}</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-xs text-muted-foreground">Safe ETA</p>
          <p className="font-semibold text-success">{safeTravelTime}</p>
        </div>
      </div>

      {/* Risk Factors */}
      {riskInfo.riskFactors && riskInfo.riskFactors.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Risk Factors:</p>
          <div className="flex flex-wrap gap-1">
            {riskInfo.riskFactors.slice(0, 3).map((factor, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Start Navigation Button */}
      <button
        onClick={onStartNavigation}
        className="w-full py-3 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <CheckCircle2 className="w-5 h-5" />
        Start Navigation
      </button>
    </div>
  );
};

export default RouteSummaryCard;
