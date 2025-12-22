import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

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
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Check if it's already a coordinate format
    const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    if (coordPattern.test(searchQuery.trim())) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const data = await searchLocations(searchQuery);
      setResults(data);
      setIsOpen(data.length > 0);
      setHighlightedIndex(-1);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Search error:', error);
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedLocation(null);
    onChange(newValue);

    // Debounce search - shorter delay for quick matches
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    const delay = newValue.length < 4 ? 150 : 400;
    debounceRef.current = setTimeout(() => {
      handleSearch(newValue);
    }, delay);
  };

  const handleSelect = (result: NominatimResult) => {
    const coords = `${result.lat}, ${result.lon}`;
    const displayName = result.display_name.split(',').slice(0, 3).join(',');
    setQuery(displayName);
    setSelectedLocation(displayName);
    onChange(coords, { lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setIsOpen(false);
    setResults([]);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedLocation(null);
    onChange('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const getLocationLabel = (result: NominatimResult) => {
    const parts = result.display_name.split(',');
    return {
      primary: parts[0]?.trim() || 'Unknown',
      secondary: parts.slice(1, 4).join(',').trim() || '',
    };
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
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`h-11 pl-10 pr-10 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          autoComplete="off"
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
        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden max-h-64 overflow-y-auto">
          {results.map((result, index) => {
            const location = getLocationLabel(result);
            const isHighlighted = index === highlightedIndex;
            
            return (
              <button
                key={`${result.place_id}-${index}`}
                type="button"
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-4 py-3 text-left transition-colors flex items-start gap-3 border-b border-border last:border-b-0 ${
                  isHighlighted ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <Navigation className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {location.primary}
                  </p>
                  {location.secondary && (
                    <p className="text-xs text-muted-foreground truncate">
                      {location.secondary}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute z-[9999] w-full mt-1 bg-popover border border-border rounded-xl shadow-elevated p-4">
          <p className="text-sm text-muted-foreground text-center">
            No locations found for "{query}"
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Try a different spelling or city name
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
