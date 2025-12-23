import { useState, useCallback } from 'react';
import { MapPin, Navigation, Plus, X, GripVertical, LocateFixed, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LocationSearch from './LocationSearch';
import { reverseGeocode } from '@/services/geocodingService';
import { useToast } from '@/hooks/use-toast';

export interface StopPoint {
  id: string;
  coords: string;
  display: string;
  type: 'start' | 'stop' | 'end';
}

interface MultiStopInputProps {
  onSearch: (stops: StopPoint[]) => void;
  isLoading?: boolean;
}

const MultiStopInput = ({ onSearch, isLoading = false }: MultiStopInputProps) => {
  const [stops, setStops] = useState<StopPoint[]>([
    { id: 'start', coords: '', display: '', type: 'start' },
    { id: 'end', coords: '', display: '', type: 'end' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gettingLocation, setGettingLocation] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const { toast } = useToast();

  const validateInput = (value: string): boolean => {
    if (!value.trim()) return false;
    const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    return coordPattern.test(value.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    stops.forEach((stop) => {
      if (!stop.coords.trim()) {
        newErrors[stop.id] = `${stop.type === 'start' ? 'Start' : stop.type === 'end' ? 'Destination' : 'Stop'} is required`;
      } else if (!validateInput(stop.coords)) {
        newErrors[stop.id] = 'Select a location from suggestions';
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSearch(stops);
    }
  };

  const handleStopChange = (id: string, value: string, coords?: { lat: number; lng: number }) => {
    setStops(prev => prev.map(stop => {
      if (stop.id === id) {
        return {
          ...stop,
          coords: coords ? `${coords.lat}, ${coords.lng}` : value,
          display: value
        };
      }
      return stop;
    }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const addStop = () => {
    if (stops.length >= 10) {
      toast({
        title: 'Maximum stops reached',
        description: 'You can add up to 8 waypoints between start and destination.',
        variant: 'destructive'
      });
      return;
    }

    const newStop: StopPoint = {
      id: `stop-${Date.now()}`,
      coords: '',
      display: '',
      type: 'stop'
    };

    // Insert before the last item (destination)
    setStops(prev => [...prev.slice(0, -1), newStop, prev[prev.length - 1]]);
  };

  const removeStop = (id: string) => {
    setStops(prev => prev.filter(stop => stop.id !== id));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const getCurrentLocation = useCallback(async () => {
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
        
        let display = `📍 Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        try {
          const address = await reverseGeocode(latitude, longitude);
          const isJustCoords = /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(address.trim());
          if (!isJustCoords) {
            display = address;
          }
        } catch {
          // Use default display
        }

        setStops(prev => prev.map(stop => {
          if (stop.id === 'start') {
            return { ...stop, coords, display };
          }
          return stop;
        }));
        
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
          message = 'Location permission denied.';
        }
        toast({
          title: 'Location Error',
          description: message,
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [toast]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedStop = stops.find(s => s.id === draggedId);
    const targetStop = stops.find(s => s.id === targetId);

    // Don't allow dragging start/end to swap positions
    if (!draggedStop || !targetStop) return;
    if (draggedStop.type === 'start' || draggedStop.type === 'end') return;
    if (targetStop.type === 'start' || targetStop.type === 'end') return;

    const draggedIndex = stops.findIndex(s => s.id === draggedId);
    const targetIndex = stops.findIndex(s => s.id === targetId);

    const newStops = [...stops];
    newStops.splice(draggedIndex, 1);
    newStops.splice(targetIndex, 0, draggedStop);
    setStops(newStops);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const getStopLabel = (stop: StopPoint, index: number) => {
    if (stop.type === 'start') return 'A';
    if (stop.type === 'end') return String.fromCharCode(65 + stops.length - 1);
    return String.fromCharCode(65 + index);
  };

  const getStopIcon = (stop: StopPoint) => {
    if (stop.type === 'start') return <MapPin className="w-4 h-4 text-secondary" />;
    if (stop.type === 'end') return <Navigation className="w-4 h-4 text-success" />;
    return <MapPin className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="bg-card rounded-2xl shadow-elevated p-5 sm:p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-3">
        {stops.map((stop, index) => (
          <div
            key={stop.id}
            draggable={stop.type === 'stop'}
            onDragStart={(e) => handleDragStart(e, stop.id)}
            onDragOver={(e) => handleDragOver(e, stop.id)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 ${draggedId === stop.id ? 'opacity-50' : ''}`}
          >
            {/* Drag Handle */}
            {stop.type === 'stop' && (
              <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            {stop.type !== 'stop' && <div className="w-6" />}

            {/* Label */}
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              stop.type === 'start' ? 'bg-secondary/20 text-secondary' :
              stop.type === 'end' ? 'bg-success/20 text-success' :
              'bg-primary/20 text-primary'
            }`}>
              {getStopLabel(stop, index)}
            </div>

            {/* Input */}
            <div className="flex-1">
              <LocationSearch
                value={stop.display || stop.coords}
                onChange={(value, coords) => handleStopChange(stop.id, value, coords)}
                placeholder={
                  stop.type === 'start' ? 'Start location...' :
                  stop.type === 'end' ? 'Destination...' :
                  'Add stop...'
                }
                icon={getStopIcon(stop)}
                error={errors[stop.id]}
              />
            </div>

            {/* Current Location Button for Start */}
            {stop.type === 'start' && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="h-10 w-10 flex-shrink-0"
                title="Use current location"
              >
                {gettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* Remove Stop Button */}
            {stop.type === 'stop' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStop(stop.id)}
                className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            
            {stop.type !== 'stop' && stop.type !== 'start' && <div className="w-10" />}
          </div>
        ))}

        {/* Add Stop Button */}
        <div className="flex items-center gap-2 pl-8">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStop}
            disabled={stops.length >= 10}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Stop
          </Button>
          <span className="text-xs text-muted-foreground">
            {stops.length - 2}/8 waypoints
          </span>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-primary hover:opacity-90 transition-opacity font-semibold"
          >
            {isLoading ? 'Finding Routes...' : 'Find Routes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MultiStopInput;
