import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchLocations, NominatimResult } from '@/services/geocodingService';

interface LocationSearchProps {
  value: string;
  onChange: (value: string, coords?: { lat: number; lng: number }) => void;
  placeholder: string;
  icon?: React.ReactNode;
  label?: string;
  error?: string;
}

const LocationSearch = ({ value, onChange, placeholder, icon, label, error }: LocationSearchProps) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Sync external value changes
    if (value !== query && value !== selectedLocation) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    // Check if it's already a coordinate format
    const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    if (coordPattern.test(searchQuery.trim())) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchLocations(searchQuery);
      setResults(data);
      setIsOpen(data.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedLocation(null);
    onChange(newValue);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      handleSearch(newValue);
    }, 300);
  };

  const handleSelect = (result: NominatimResult) => {
    const coords = `${result.lat}, ${result.lon}`;
    setQuery(result.display_name);
    setSelectedLocation(result.display_name);
    onChange(coords, { lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedLocation(null);
    onChange('');
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          {icon}
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`h-11 pl-10 pr-10 ${error ? 'border-danger focus-visible:ring-danger' : ''}`}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
        {!isLoading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger flex items-center gap-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-danger" />
          {error}
        </p>
      )}

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden animate-fade-in">
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3 border-b border-border last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {result.display_name.split(',')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {result.display_name.split(',').slice(1).join(',').trim()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
