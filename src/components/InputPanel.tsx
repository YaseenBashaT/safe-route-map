import { useState } from 'react';
import { Search, MapPin, Navigation, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputPanelProps {
  onSearch: (start: string, destination: string) => void;
  isLoading?: boolean;
}

const InputPanel = ({ onSearch, isLoading = false }: InputPanelProps) => {
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [errors, setErrors] = useState<{ start?: string; destination?: string }>({});

  const validateCoordinate = (value: string): boolean => {
    if (!value.trim()) return false;
    const pattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    return pattern.test(value.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { start?: string; destination?: string } = {};

    if (!start.trim()) {
      newErrors.start = 'Start location is required';
    } else if (!validateCoordinate(start)) {
      newErrors.start = 'Invalid format. Use: latitude,longitude';
    }

    if (!destination.trim()) {
      newErrors.destination = 'Destination is required';
    } else if (!validateCoordinate(destination)) {
      newErrors.destination = 'Invalid format. Use: latitude,longitude';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSearch(start.trim(), destination.trim());
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-elevated p-5 sm:p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="start" className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4 text-secondary" />
              Start Location
            </Label>
            <Input
              id="start"
              type="text"
              placeholder="17.3850, 78.4867"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                if (errors.start) setErrors((prev) => ({ ...prev, start: undefined }));
              }}
              className={`h-11 ${errors.start ? 'border-danger focus-visible:ring-danger' : ''}`}
            />
            {errors.start && (
              <p className="text-xs text-danger flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-danger" />
                {errors.start}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2 text-sm font-medium">
              <Navigation className="w-4 h-4 text-success" />
              Destination
            </Label>
            <Input
              id="destination"
              type="text"
              placeholder="17.4400, 78.3489"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                if (errors.destination) setErrors((prev) => ({ ...prev, destination: undefined }));
              }}
              className={`h-11 ${errors.destination ? 'border-danger focus-visible:ring-danger' : ''}`}
            />
            {errors.destination && (
              <p className="text-xs text-danger flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-danger" />
                {errors.destination}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 px-6 bg-gradient-primary hover:opacity-90 transition-opacity font-semibold"
          >
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? 'Searching...' : 'Find Routes'}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Info className="w-3.5 h-3.5" />
          <span>Enter coordinate pairs like <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">17.3850, 78.4867</code></span>
        </div>
      </form>
    </div>
  );
};

export default InputPanel;
