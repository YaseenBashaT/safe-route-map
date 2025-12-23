import { useState } from 'react';
import { Search, MapPin, Navigation, Info, LocateFixed, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LocationSearch from './LocationSearch';
import { reverseGeocode } from '@/services/geocodingService';
import { useToast } from '@/hooks/use-toast';

interface InputPanelProps {
  onSearch: (start: string, destination: string) => void;
  isLoading?: boolean;
}

const InputPanel = ({ onSearch, isLoading = false }: InputPanelProps) => {
  const [start, setStart] = useState('');
  const [startDisplay, setStartDisplay] = useState('');
  const [destination, setDestination] = useState('');
  const [errors, setErrors] = useState<{ start?: string; destination?: string }>({});
  const [gettingLocation, setGettingLocation] = useState(false);
  const { toast } = useToast();

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
      setStartDisplay(value);
    } else {
      setStart(value);
      setStartDisplay(value);
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = `${latitude}, ${longitude}`;
        
        // Set coordinates immediately - this always works
        setStart(coords);
        
        // Try to get the address for display, but use coordinates if it fails
        try {
          const address = await reverseGeocode(latitude, longitude);
          // Check if the address is just coordinates (fallback case)
          const isJustCoords = /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(address.trim());
          if (isJustCoords) {
            setStartDisplay(`📍 Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          } else {
            setStartDisplay(address);
          }
        } catch {
          // Use coordinates with a nice display
          setStartDisplay(`📍 Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }
        
        if (errors.start) setErrors((prev) => ({ ...prev, start: undefined }));
        setGettingLocation(false);
        
        toast({
          title: 'Location found',
          description: 'Your current location has been set as the start point.',
        });
      },
      (error) => {
        setGettingLocation(false);
        let message = 'Could not get your location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied. Please allow location access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out.';
        }
        toast({
          title: 'Location Error',
          description: message,
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="bg-card rounded-2xl shadow-elevated p-5 sm:p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4 text-secondary" />
              Start Location
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <LocationSearch
                  value={startDisplay || start}
                  onChange={handleStartChange}
                  placeholder="Search or use current location..."
                  error={errors.start}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="h-11 w-11 flex-shrink-0"
                title="Use current location"
              >
                {gettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

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
