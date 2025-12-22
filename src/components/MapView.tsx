import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Eye, EyeOff, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface AccidentPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

export interface RoutePolyline {
  coordinates: [number, number][];
  isSafest: boolean;
}

interface MapViewProps {
  accidentData: AccidentPoint[];
  routeData: RoutePolyline[];
  startPoint?: { lat: number; lng: number };
  endPoint?: { lat: number; lng: number };
}

const MapView = ({ accidentData, routeData, startPoint, endPoint }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const heatLayer = useRef<L.Layer | null>(null);
  const routeLayers = useRef<L.Polyline[]>([]);
  const markerLayers = useRef<L.Marker[]>([]);
  const [heatmapVisible, setHeatmapVisible] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: false,
    });

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map.current);

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update heatmap layer
  useEffect(() => {
    if (!map.current) return;

    // Remove existing heatmap
    if (heatLayer.current) {
      map.current.removeLayer(heatLayer.current);
      heatLayer.current = null;
    }

    if (accidentData.length > 0 && heatmapVisible) {
      const heatData: [number, number, number][] = accidentData.map((point) => [
        point.lat,
        point.lng,
        point.intensity || 0.5,
      ]);

      heatLayer.current = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.2: '#22c55e',
          0.4: '#facc15',
          0.6: '#f97316',
          0.8: '#ef4444',
          1.0: '#dc2626',
        },
      }).addTo(map.current);
    }
  }, [accidentData, heatmapVisible]);

  // Update route polylines
  useEffect(() => {
    if (!map.current) return;

    // Remove existing routes
    routeLayers.current.forEach((layer) => map.current?.removeLayer(layer));
    routeLayers.current = [];

    // Add new routes (non-safest first, safest last for z-index)
    const sortedRoutes = [...routeData].sort((a, b) => (a.isSafest ? 1 : 0) - (b.isSafest ? 1 : 0));

    sortedRoutes.forEach((route) => {
      const polyline = L.polyline(route.coordinates, {
        color: route.isSafest ? '#22c55e' : '#9ca3af',
        weight: route.isSafest ? 6 : 4,
        opacity: route.isSafest ? 1 : 0.6,
        dashArray: route.isSafest ? undefined : '10, 10',
      }).addTo(map.current!);

      routeLayers.current.push(polyline);
    });

    // Fit bounds to routes
    if (routeData.length > 0) {
      const allCoords = routeData.flatMap((r) => r.coordinates);
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords.map((c) => L.latLng(c[0], c[1])));
        map.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [routeData]);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markerLayers.current.forEach((marker) => map.current?.removeLayer(marker));
    markerLayers.current = [];

    // Add start marker
    if (startPoint) {
      const startIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: linear-gradient(135deg, #14b8a6, #0d9488); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon })
        .addTo(map.current)
        .bindPopup('Start Location');
      markerLayers.current.push(marker);
    }

    // Add end marker
    if (endPoint) {
      const endIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: linear-gradient(135deg, #ef4444, #dc2626); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon })
        .addTo(map.current)
        .bindPopup('Destination');
      markerLayers.current.push(marker);
    }

    // Fit bounds to include markers and routes
    if (startPoint && endPoint) {
      const bounds = L.latLngBounds([
        [startPoint.lat, startPoint.lng],
        [endPoint.lat, endPoint.lng],
      ]);
      map.current.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [startPoint, endPoint]);

  const toggleHeatmap = () => {
    setHeatmapVisible(!heatmapVisible);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-elevated">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Heatmap Toggle Button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleHeatmap}
          className="bg-card/95 backdrop-blur-sm shadow-card hover:bg-card"
        >
          {heatmapVisible ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Heatmap
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Heatmap
            </>
          )}
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm rounded-xl shadow-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Legend</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-success" />
            <span className="text-xs text-muted-foreground">Safest Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-muted-foreground opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0px, currentColor 4px, transparent 4px, transparent 8px)' }} />
            <span className="text-xs text-muted-foreground">Alternative Routes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded" style={{ background: 'linear-gradient(90deg, #22c55e, #facc15, #f97316, #ef4444)' }} />
            <span className="text-xs text-muted-foreground">Accident Density</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
