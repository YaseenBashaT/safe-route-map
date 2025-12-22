import { useState } from 'react';
import { Search, MapPin, Navigation, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LocationSearch from './LocationSearch';

interface InputPanelProps {
  onSearch: (start: string, destination: string) => void;
  isLoading?: boolean;
}

const InputPanel = ({ onSearch, isLoading = false }: InputPanelProps) => {
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [errors, setErrors] = useState<{ start?: string; destination?: string }>({});

  const validateInput = (value: string): boolean => {
    if (!value.trim()) return false;
    // Accept coordinates format
    const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    return coordPattern.test(value.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { start?: string; destination?: string } = {};

    if (!start.trim()) {
      newErrors.start = 'Start location is required';
    } else if (!validateInput(start)) {
      newErrors.start = 'Select a location from suggestions or enter coordinates';
    }

    if (!destination.trim()) {
      newErrors.destination = 'Destination is required';
    } else if (!validateInput(destination)) {
      newErrors.destination = 'Select a location from suggestions or enter coordinates';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSearch(start.trim(), destination.trim());
    }
  };

  const handleStartChange = (value: string, coords?: { lat: number; lng: number }) => {
    if (coords) {
      setStart(`${coords.lat}, ${coords.lng}`);
    } else {
      setStart(value);
    }
    if (errors.start) setErrors((prev) => ({ ...prev, start: undefined }));
  };

  const handleDestinationChange = (value: string, coords?: { lat: number; lng: number }) => {
    if (coords) {
      setDestination(`${coords.lat}, ${coords.lng}`);
    } else {
      setDestination(value);
    }
    if (errors.destination) setErrors((prev) => ({ ...prev, destination: undefined }));
  };

  return (
    <div className="bg-card rounded-2xl shadow-elevated p-5 sm:p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <LocationSearch
            value={start}
            onChange={handleStartChange}
            placeholder="Search for a place or enter coordinates..."
            icon={<MapPin className="w-4 h-4 text-secondary" />}
            label="Start Location"
            error={errors.start}
          />

          <LocationSearch
            value={destination}
            onChange={handleDestinationChange}
            placeholder="Search for a place or enter coordinates..."
            icon={<Navigation className="w-4 h-4 text-success" />}
            label="Destination"
            error={errors.destination}
          />

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
          <span>Search by address or enter coordinates like <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">17.3850, 78.4867</code></span>
        </div>
      </form>
    </div>
  );
};

export default InputPanel;
