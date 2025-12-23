import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

import { Button } from '@/components/ui/button';
import { AccidentHotspot } from '@/services/accidentDataService';
import { Compass, LocateFixed, Plus, Minus, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface RoutePolyline {
  coordinates: [number, number][];
  isSafest: boolean;
}

interface RouteMetrics {
  nearbyAccidents: number;
  fatal: number;
  serious: number;
  minor: number;
}

interface MapViewProps {
  hotspots: AccidentHotspot[];
  routeData: RoutePolyline[];
  startPoint?: { lat: number; lng: number };
  endPoint?: { lat: number; lng: number };
}

const MapView = ({ hotspots, routeData, startPoint, endPoint }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const heatLayer = useRef<L.Layer | null>(null);
  const routeLayers = useRef<L.Polyline[]>([]);
  const routeMetricsMarker = useRef<L.Marker | null>(null);
  const markerLayers = useRef<L.Marker[]>([]);
  const hotspotMarkers = useRef<L.CircleMarker[]>([]);
  const currentLocationMarker = useRef<L.Marker | null>(null);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [markersVisible, setMarkersVisible] = useState(true);
  const [mapRotation, setMapRotation] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [routeMetrics, setRouteMetrics] = useState<RouteMetrics | null>(null);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: false,
    });

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

    if (hotspots.length > 0 && heatmapVisible) {
      const heatData: [number, number, number][] = hotspots.map((point) => [
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
  }, [hotspots, heatmapVisible]);

  // Update clickable hotspot markers
  useEffect(() => {
    if (!map.current) return;

    // Remove existing hotspot markers
    hotspotMarkers.current.forEach((marker) => map.current?.removeLayer(marker));
    hotspotMarkers.current = [];

    if (hotspots.length > 0 && markersVisible) {
      hotspots.forEach((hotspot) => {
        if (hotspot.city === 'Unknown') return; // Skip unknown locations

        const color = hotspot.fatalAccidents > 0 
          ? '#ef4444' 
          : hotspot.seriousAccidents > 0 
          ? '#f97316' 
          : '#22c55e';

        const marker = L.circleMarker([hotspot.lat, hotspot.lng], {
          radius: Math.min(8 + hotspot.totalAccidents / 2, 20),
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.7,
        }).addTo(map.current!);

        // Create popup content
        const weatherEntries = Object.entries(hotspot.weatherBreakdown || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([weather, count]) => `<span class="text-xs">${weather}: ${count}</span>`)
          .join('<br/>');

        const roadEntries = Object.entries(hotspot.roadTypeBreakdown || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([road, count]) => `<span class="text-xs">${road}: ${count}</span>`)
          .join('<br/>');

        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <h3 class="font-bold text-sm mb-2">${hotspot.city}, ${hotspot.state}</h3>
            <div class="grid grid-cols-3 gap-2 mb-3 text-center">
              <div class="bg-red-50 p-1 rounded">
                <div class="font-bold text-red-600">${hotspot.fatalAccidents}</div>
                <div class="text-xs text-gray-600">Fatal</div>
              </div>
              <div class="bg-orange-50 p-1 rounded">
                <div class="font-bold text-orange-600">${hotspot.seriousAccidents}</div>
                <div class="text-xs text-gray-600">Serious</div>
              </div>
              <div class="bg-green-50 p-1 rounded">
                <div class="font-bold text-green-600">${hotspot.minorAccidents}</div>
                <div class="text-xs text-gray-600">Minor</div>
              </div>
            </div>
            <div class="text-xs font-semibold mb-1">Total: ${hotspot.totalAccidents} accidents</div>
            ${weatherEntries ? `<div class="mt-2"><div class="text-xs font-semibold text-gray-700">Weather Conditions:</div>${weatherEntries}</div>` : ''}
            ${roadEntries ? `<div class="mt-2"><div class="text-xs font-semibold text-gray-700">Road Types:</div>${roadEntries}</div>` : ''}
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 300 });
        hotspotMarkers.current.push(marker);
      });
    }
  }, [hotspots, markersVisible]);

  // Check if a coordinate is near any hotspot (within threshold distance)
  const isNearHotspot = useCallback((coord: [number, number], thresholdKm: number = 2): AccidentHotspot | null => {
    for (const hotspot of hotspots) {
      const distance = getDistanceFromLatLonInKm(coord[0], coord[1], hotspot.lat, hotspot.lng);
      if (distance <= thresholdKm) {
        return hotspot;
      }
    }
    return null;
  }, [hotspots]);

  // Haversine formula for distance calculation
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number): number => deg * (Math.PI / 180);

  // Update route polylines with danger zone highlighting
  useEffect(() => {
    if (!map.current) return;

    // Remove existing routes
    routeLayers.current.forEach((layer) => map.current?.removeLayer(layer));
    routeLayers.current = [];

    // Remove existing route metrics marker
    if (routeMetricsMarker.current) {
      map.current.removeLayer(routeMetricsMarker.current);
      routeMetricsMarker.current = null;
    }

    // Calculate route metrics for the safest route and add marker on path
    const safestRoute = routeData.find(r => r.isSafest);
    if (safestRoute && hotspots.length > 0 && safestRoute.coordinates.length > 0) {
      const nearbyHotspots = new Set<AccidentHotspot>();
      safestRoute.coordinates.forEach(coord => {
        const hotspot = isNearHotspot(coord, 2);
        if (hotspot) nearbyHotspots.add(hotspot);
      });
      
      const hotspotsArray = Array.from(nearbyHotspots);
      const metrics: RouteMetrics = {
        nearbyAccidents: hotspotsArray.reduce((sum, h) => sum + h.totalAccidents, 0),
        fatal: hotspotsArray.reduce((sum, h) => sum + h.fatalAccidents, 0),
        serious: hotspotsArray.reduce((sum, h) => sum + h.seriousAccidents, 0),
        minor: hotspotsArray.reduce((sum, h) => sum + h.minorAccidents, 0),
      };
      setRouteMetrics(metrics);

      // Place metrics marker at the midpoint of the route
      const midIndex = Math.floor(safestRoute.coordinates.length / 2);
      const midPoint = safestRoute.coordinates[midIndex];
      
      const metricsIcon = L.divIcon({
        className: 'route-metrics-marker',
        html: `
          <div style="
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border-radius: 12px;
            padding: 8px 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border: 1px solid rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: system-ui, -apple-system, sans-serif;
            white-space: nowrap;
          ">
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: 700; color: #f97316;">${metrics.nearbyAccidents}</div>
              <div style="font-size: 9px; color: #6b7280; text-transform: uppercase;">Nearby</div>
            </div>
            <div style="width: 1px; height: 24px; background: #e5e7eb;"></div>
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: 700; color: #dc2626;">${metrics.fatal}</div>
              <div style="font-size: 9px; color: #6b7280; text-transform: uppercase;">Fatal</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: 700; color: #f97316;">${metrics.serious}</div>
              <div style="font-size: 9px; color: #6b7280; text-transform: uppercase;">Serious</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: 700; color: #22c55e;">${metrics.minor}</div>
              <div style="font-size: 9px; color: #6b7280; text-transform: uppercase;">Minor</div>
            </div>
          </div>
        `,
        iconSize: [200, 60],
        iconAnchor: [100, 30],
      });

      routeMetricsMarker.current = L.marker([midPoint[0], midPoint[1]], { 
        icon: metricsIcon,
        zIndexOffset: 1000,
      }).addTo(map.current);
    } else {
      setRouteMetrics(null);
    }

    // Add new routes (non-safest first, safest last for z-index)
    const sortedRoutes = [...routeData].sort((a, b) => (a.isSafest ? 1 : 0) - (b.isSafest ? 1 : 0));

    sortedRoutes.forEach((route) => {
      if (route.isSafest && hotspots.length > 0) {
        // For the safest route, split into segments based on hotspot proximity
        let currentSegment: [number, number][] = [];
        let isCurrentSegmentDanger = false;
        let segments: { coords: [number, number][]; isDanger: boolean }[] = [];

        route.coordinates.forEach((coord, index) => {
          const nearHotspot = isNearHotspot(coord, 1.5); // 1.5km threshold
          const isDanger = nearHotspot !== null;

          if (index === 0) {
            currentSegment.push(coord);
            isCurrentSegmentDanger = isDanger;
          } else if (isDanger === isCurrentSegmentDanger) {
            currentSegment.push(coord);
          } else {
            // Transition point - close current segment and start new one
            currentSegment.push(coord); // Add overlap point
            segments.push({ coords: [...currentSegment], isDanger: isCurrentSegmentDanger });
            currentSegment = [coord]; // Start new segment with overlap
            isCurrentSegmentDanger = isDanger;
          }
        });

        // Push final segment
        if (currentSegment.length > 0) {
          segments.push({ coords: currentSegment, isDanger: isCurrentSegmentDanger });
        }

        // Draw each segment with appropriate styling
        segments.forEach((segment) => {
          if (segment.coords.length < 2) return;

          if (segment.isDanger) {
            // Red glow effect for danger zones - draw glow first
            const glowLine = L.polyline(segment.coords, {
              color: '#ef4444',
              weight: 12,
              opacity: 0.3,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map.current!);
            routeLayers.current.push(glowLine);

            // Main red line
            const dangerLine = L.polyline(segment.coords, {
              color: '#dc2626',
              weight: 6,
              opacity: 1,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map.current!);
            dangerLine.bindTooltip('⚠️ Accident-Prone Area', { sticky: true, className: 'danger-tooltip' });
            routeLayers.current.push(dangerLine);
          } else {
            // Normal green segment
            const safeLine = L.polyline(segment.coords, {
              color: '#22c55e',
              weight: 6,
              opacity: 1,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map.current!);
            routeLayers.current.push(safeLine);
          }
        });
      } else {
        // Non-safest routes - draw normally
        const polyline = L.polyline(route.coordinates, {
          color: route.isSafest ? '#22c55e' : '#9ca3af',
          weight: route.isSafest ? 6 : 4,
          opacity: route.isSafest ? 1 : 0.6,
          dashArray: route.isSafest ? undefined : '10, 10',
        }).addTo(map.current!);

        routeLayers.current.push(polyline);
      }
    });

    // Fit bounds to routes
    if (routeData.length > 0) {
      const allCoords = routeData.flatMap((r) => r.coordinates);
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords.map((c) => L.latLng(c[0], c[1])));
        map.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [routeData, hotspots, isNearHotspot]);

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

  const toggleMarkers = () => {
    setMarkersVisible(!markersVisible);
  };

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    map.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    map.current?.zoomOut();
  }, []);

  // Reset map orientation (compass)
  const handleResetOrientation = useCallback(() => {
    if (map.current) {
      // Reset to north-facing
      setMapRotation(0);
      toast({
        title: 'Map Reset',
        description: 'Map orientation reset to north.',
      });
    }
  }, [toast]);

  // Go to current location
  const handleGoToCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: 'Not Supported',
        description: 'Geolocation is not supported by your browser.',
        variant: 'destructive',
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        if (map.current) {
          // Remove existing current location marker
          if (currentLocationMarker.current) {
            map.current.removeLayer(currentLocationMarker.current);
          }

          // Create pulsing current location marker
          const locationIcon = L.divIcon({
            className: 'current-location-marker',
            html: `
              <div class="relative">
                <div style="position: absolute; width: 40px; height: 40px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; animation: pulse 2s infinite; transform: translate(-50%, -50%);"></div>
                <div style="position: absolute; width: 16px; height: 16px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 10px rgba(0,0,0,0.3); transform: translate(-50%, -50%);"></div>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });

          currentLocationMarker.current = L.marker([latitude, longitude], { icon: locationIcon })
            .addTo(map.current)
            .bindPopup(`Your Location<br/><small>Accuracy: ~${Math.round(accuracy)}m</small>`);

          // Zoom to current location with animation
          map.current.flyTo([latitude, longitude], 16, {
            animate: true,
            duration: 1.5,
          });

          toast({
            title: 'Location Found',
            description: `Accuracy: ~${Math.round(accuracy)} meters`,
          });
        }

        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let message = 'Could not get your location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location unavailable.';
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
  }, [toast]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-elevated">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Left Controls - Layer toggles */}
      <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2">
        <div className="bg-card/95 backdrop-blur-sm shadow-card rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleHeatmap}
            className={`w-full justify-start gap-2 text-xs ${heatmapVisible ? 'bg-secondary/20' : ''}`}
            title={heatmapVisible ? 'Hide Heatmap' : 'Show Heatmap'}
          >
            <Layers className="w-4 h-4" />
            Heatmap
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMarkers}
            className={`w-full justify-start gap-2 text-xs ${markersVisible ? 'bg-secondary/20' : ''}`}
            title={markersVisible ? 'Hide Markers' : 'Show Markers'}
          >
            <Layers className="w-4 h-4" />
            Markers
          </Button>
        </div>
      </div>

      {/* Right Controls - Zoom, Compass, Location */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="bg-card/95 backdrop-blur-sm shadow-card rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="rounded-none h-10 w-10 hover:bg-muted"
            title="Zoom in"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <div className="h-px bg-border" />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="rounded-none h-10 w-10 hover:bg-muted"
            title="Zoom out"
          >
            <Minus className="w-5 h-5" />
          </Button>
        </div>

        {/* Compass */}
        <Button
          variant="secondary"
          size="icon"
          onClick={handleResetOrientation}
          className="bg-card/95 backdrop-blur-sm shadow-card h-10 w-10 hover:bg-card"
          title="Reset to north"
          style={{ transform: `rotate(${mapRotation}deg)` }}
        >
          <Compass className="w-5 h-5 text-destructive" />
        </Button>

        {/* Current Location */}
        <Button
          variant="secondary"
          size="icon"
          onClick={handleGoToCurrentLocation}
          disabled={isLocating}
          className="bg-card/95 backdrop-blur-sm shadow-card h-10 w-10 hover:bg-card"
          title="Go to my location"
        >
          <LocateFixed className={`w-5 h-5 ${isLocating ? 'animate-pulse text-primary' : ''}`} />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[500] bg-card/95 backdrop-blur-sm rounded-xl shadow-card p-3">
        <span className="text-xs font-semibold text-foreground block mb-2">Legend</span>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-success" />
            <span className="text-xs text-muted-foreground">Safe Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-destructive" />
            <span className="text-xs text-muted-foreground">Accident-Prone Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-muted-foreground opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0px, currentColor 4px, transparent 4px, transparent 8px)' }} />
            <span className="text-xs text-muted-foreground">Alternative Routes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded" style={{ background: 'linear-gradient(90deg, #22c55e, #facc15, #f97316, #ef4444)' }} />
            <span className="text-xs text-muted-foreground">Accident Density</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6] border-2 border-white" />
            <span className="text-xs text-muted-foreground">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive border-2 border-white" />
            <span className="text-xs text-muted-foreground">Click for Details</span>
          </div>
        </div>
      </div>

      {/* Scale Indicator */}
      <div className="absolute bottom-4 right-4 z-[500] bg-card/95 backdrop-blur-sm rounded-lg shadow-card px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-12 h-1 border-l border-r border-muted-foreground bg-muted-foreground/30"></div>
          <span>Scale</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
