import { AlertTriangle, Skull, Car, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticsPanelProps {
  totalAccidents: number;
  totalFatal: number;
  totalSerious: number;
  totalMinor: number;
  locationCount: number;
  topCities: { city: string; state: string; totalAccidents: number; fatalAccidents: number }[];
}

const StatisticsPanel = ({
  totalAccidents,
  totalFatal,
  totalSerious,
  totalMinor,
  locationCount,
  topCities,
}: StatisticsPanelProps) => {
  return (
    <Card className="bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Accident Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-foreground">{totalAccidents.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Accidents</div>
          </div>
          <div className="bg-destructive/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-destructive">{totalFatal.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Fatal</div>
          </div>
          <div className="bg-warning/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-warning">{totalSerious.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Serious</div>
          </div>
          <div className="bg-success/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-success">{totalMinor.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Minor</div>
          </div>
        </div>

        {/* Location count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{locationCount} hotspot locations mapped</span>
        </div>

        {/* Top Cities */}
        {topCities.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Top Accident-Prone Cities
            </h4>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {topCities.slice(0, 5).map((city, index) => (
                <div
                  key={`${city.city}-${city.state}`}
                  className="flex items-center justify-between text-xs bg-muted/30 rounded px-2 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground w-4">{index + 1}.</span>
                    <span className="font-medium text-foreground">{city.city}</span>
                    <span className="text-muted-foreground">({city.state})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{city.totalAccidents}</span>
                    {city.fatalAccidents > 0 && (
                      <span className="text-destructive flex items-center gap-0.5">
                        <Skull className="w-3 h-3" />
                        {city.fatalAccidents}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatisticsPanel;
