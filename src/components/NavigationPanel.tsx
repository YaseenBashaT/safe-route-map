import { NavigationStep } from '@/services/routingService';
import { Navigation, ChevronRight, MapPin } from 'lucide-react';

interface NavigationPanelProps {
  steps: NavigationStep[];
  routeId: number;
}

const NavigationPanel = ({ steps, routeId }: NavigationPanelProps) => {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl shadow-elevated p-5 animate-slide-in-right">
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="w-5 h-5 text-secondary" />
        <h2 className="text-lg font-display font-bold text-foreground">
          Route {routeId} Directions
        </h2>
      </div>

      <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
              index === 0
                ? 'bg-secondary/10'
                : index === steps.length - 1
                ? 'bg-success/10'
                : 'hover:bg-muted'
            }`}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">
              {step.maneuver}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{step.instruction}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">{step.distance}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{step.duration}</span>
              </div>
            </div>
            {index === steps.length - 1 && (
              <MapPin className="w-4 h-4 text-success flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationPanel;
