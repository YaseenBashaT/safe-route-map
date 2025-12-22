import { Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FilterState {
  severity: string[];
  weather: string[];
  roadType: string[];
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const severityOptions = ['Fatal', 'Serious', 'Minor'];
const weatherOptions = ['Clear', 'Rainy', 'Foggy', 'Hazy', 'Stormy'];
const roadTypeOptions = ['National Highway', 'State Highway', 'Urban Road', 'Village Road'];

const FilterPanel = ({ filters, onFilterChange }: FilterPanelProps) => {
  const toggleFilter = (category: keyof FilterState, value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [category]: updated });
  };

  const clearFilters = () => {
    onFilterChange({ severity: [], weather: [], roadType: [] });
  };

  const hasActiveFilters = filters.severity.length > 0 || filters.weather.length > 0 || filters.roadType.length > 0;

  return (
    <Card className="bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Severity Filter */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Severity</h4>
          <div className="flex flex-wrap gap-1">
            {severityOptions.map(option => (
              <Badge
                key={option}
                variant={filters.severity.includes(option) ? 'default' : 'outline'}
                className={`cursor-pointer text-xs transition-colors ${
                  filters.severity.includes(option)
                    ? option === 'Fatal'
                      ? 'bg-destructive hover:bg-destructive/80'
                      : option === 'Serious'
                      ? 'bg-warning hover:bg-warning/80 text-warning-foreground'
                      : 'bg-success hover:bg-success/80'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleFilter('severity', option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>

        {/* Weather Filter */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Weather</h4>
          <div className="flex flex-wrap gap-1">
            {weatherOptions.map(option => (
              <Badge
                key={option}
                variant={filters.weather.includes(option) ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => toggleFilter('weather', option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>

        {/* Road Type Filter */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Road Type</h4>
          <div className="flex flex-wrap gap-1">
            {roadTypeOptions.map(option => (
              <Badge
                key={option}
                variant={filters.roadType.includes(option) ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => toggleFilter('roadType', option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
