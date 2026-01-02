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

export interface RouteETAInfo {
  distance: string;
  duration: string;
  distanceMeters: number;
  durationSeconds: number;
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
  selectedRouteIndex?: number;
  onRouteSelect?: (index: number) => void;
  routeETAInfo?: RouteETAInfo[];
}

const MapView = ({ hotspots, routeData, startPoint, endPoint, selectedRouteIndex = 0, onRouteSelect, routeETAInfo }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const heatLayer = useRef<L.Layer | null>(null);
  const routeLayers = useRef<L.Polyline[]>([]);
  const routeMetricsMarker = useRef<L.Marker | null>(null);
  const etaPopupMarker = useRef<L.Marker | null>(null);
  const dangerMarkers = useRef<L.Marker[]>([]);
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

    // Remove existing ETA popup
    if (etaPopupMarker.current) {
      map.current.removeLayer(etaPopupMarker.current);
      etaPopupMarker.current = null;
    }

    // Remove existing danger markers
    dangerMarkers.current.forEach((marker) => map.current?.removeLayer(marker));
    dangerMarkers.current = [];

    // Calculate route metrics for the selected route and add marker on path
    const selectedRoute = routeData[selectedRouteIndex];
    if (selectedRoute && hotspots.length > 0 && selectedRoute.coordinates.length > 0) {
      const nearbyHotspots = new Set<AccidentHotspot>();
      const dangerZoneLocations: { coord: [number, number]; hotspot: AccidentHotspot }[] = [];
      
      selectedRoute.coordinates.forEach(coord => {
        const hotspot = isNearHotspot(coord, 2);
        if (hotspot && !nearbyHotspots.has(hotspot)) {
          nearbyHotspots.add(hotspot);
          dangerZoneLocations.push({ coord, hotspot });
        }
      });
      
      const hotspotsArray = Array.from(nearbyHotspots);
      const metrics: RouteMetrics = {
        nearbyAccidents: hotspotsArray.reduce((sum, h) => sum + h.totalAccidents, 0),
        fatal: hotspotsArray.reduce((sum, h) => sum + h.fatalAccidents, 0),
        serious: hotspotsArray.reduce((sum, h) => sum + h.seriousAccidents, 0),
        minor: hotspotsArray.reduce((sum, h) => sum + h.minorAccidents, 0),
      };
      setRouteMetrics(metrics);

      // Add danger warning markers at each hotspot location on route
      dangerZoneLocations.forEach(({ coord, hotspot }) => {
        const isFatal = hotspot.fatalAccidents > 0;
        const isSerious = hotspot.seriousAccidents > 2;
        
        const dangerIcon = L.divIcon({
          className: 'danger-warning-marker',
          html: `
            <div style="
              position: relative;
              cursor: pointer;
            ">
              <div style="
                width: 32px;
                height: 32px;
                background: ${isFatal ? '#dc2626' : isSerious ? '#f97316' : '#eab308'};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 2px solid white;
                animation: pulse-danger 2s infinite;
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const popupContent = `
          <div style="padding: 8px; min-width: 180px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: ${isFatal ? '#dc2626' : '#f97316'};">
              ⚠️ ${isFatal ? 'HIGH DANGER ZONE' : 'CAUTION AREA'}
            </div>
            <div style="font-size: 12px; color: #374151; margin-bottom: 4px;">
              📍 ${hotspot.city}, ${hotspot.state}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 8px;">
              <div style="text-align: center; background: #fef2f2; padding: 4px; border-radius: 4px;">
                <div style="font-weight: 700; color: #dc2626;">${hotspot.fatalAccidents}</div>
                <div style="font-size: 10px; color: #6b7280;">Fatal</div>
              </div>
              <div style="text-align: center; background: #fff7ed; padding: 4px; border-radius: 4px;">
                <div style="font-weight: 700; color: #f97316;">${hotspot.seriousAccidents}</div>
                <div style="font-size: 10px; color: #6b7280;">Serious</div>
              </div>
              <div style="text-align: center; background: #f0fdf4; padding: 4px; border-radius: 4px;">
                <div style="font-weight: 700; color: #22c55e;">${hotspot.minorAccidents}</div>
                <div style="font-size: 10px; color: #6b7280;">Minor</div>
              </div>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
              🚗 Reduce speed and stay alert
            </div>
          </div>
        `;

        const marker = L.marker([hotspot.lat, hotspot.lng], { 
          icon: dangerIcon,
          zIndexOffset: 900,
        })
          .bindPopup(popupContent, { maxWidth: 250 })
          .addTo(map.current!);
        
        dangerMarkers.current.push(marker);
      });

      // Place metrics marker at the midpoint of the route
      const midIndex = Math.floor(selectedRoute.coordinates.length / 2);
      const midPoint = selectedRoute.coordinates[midIndex];
      
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
            <div style="margin-left: 8px; font-size: 10px; color: #9ca3af;">ⓘ</div>
          </div>
        `,
        iconSize: [220, 60],
        iconAnchor: [110, 30],
      });

      // Build detailed popup content
      const topLocations = hotspotsArray
        .sort((a, b) => b.totalAccidents - a.totalAccidents)
        .slice(0, 5);
      
      const locationsHtml = topLocations.map(h => `
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f3f4f6;">
          <span style="font-size: 12px; color: #374151;">${h.city}, ${h.state}</span>
          <span style="font-size: 12px; font-weight: 600; color: ${h.fatalAccidents > 0 ? '#dc2626' : h.seriousAccidents > 0 ? '#f97316' : '#22c55e'};">
            ${h.totalAccidents} accidents
          </span>
        </div>
      `).join('');

      const detailedPopupContent = `
        <div style="padding: 12px; min-width: 280px; max-width: 320px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 12px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
            📊 Route Safety Analysis
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
            <div style="text-align: center; background: #fff7ed; padding: 8px 4px; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: 700; color: #f97316;">${metrics.nearbyAccidents}</div>
              <div style="font-size: 10px; color: #6b7280;">Total</div>
            </div>
            <div style="text-align: center; background: #fef2f2; padding: 8px 4px; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: 700; color: #dc2626;">${metrics.fatal}</div>
              <div style="font-size: 10px; color: #6b7280;">Fatal</div>
            </div>
            <div style="text-align: center; background: #fffbeb; padding: 8px 4px; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${metrics.serious}</div>
              <div style="font-size: 10px; color: #6b7280;">Serious</div>
            </div>
            <div style="text-align: center; background: #f0fdf4; padding: 8px 4px; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: 700; color: #22c55e;">${metrics.minor}</div>
              <div style="font-size: 10px; color: #6b7280;">Minor</div>
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <div style="font-weight: 600; font-size: 12px; color: #374151; margin-bottom: 8px;">
              🚨 Danger Zones on Route (${hotspotsArray.length} areas)
            </div>
            ${locationsHtml || '<div style="color: #9ca3af; font-size: 12px;">No specific danger zones identified</div>'}
          </div>

          <div style="background: #f9fafb; padding: 8px; border-radius: 6px; margin-top: 8px;">
            <div style="font-size: 11px; color: #6b7280;">
              💡 <strong>Safety Tip:</strong> ${metrics.fatal > 0 
                ? 'This route passes through high-risk areas. Maintain extra caution and reduce speed in marked zones.' 
                : metrics.serious > 5 
                ? 'Moderate risk areas ahead. Stay alert and follow speed limits.' 
                : 'This route has relatively fewer accident zones. Drive safely!'}
            </div>
          </div>
        </div>
      `;

      routeMetricsMarker.current = L.marker([midPoint[0], midPoint[1]], { 
        icon: metricsIcon,
        zIndexOffset: 1000,
      })
        .bindPopup(detailedPopupContent, { maxWidth: 350 })
        .addTo(map.current);
    } else {
      setRouteMetrics(null);
    }

    // Add Google Maps-style floating ETA popup
    const currentETAInfo = routeETAInfo?.[selectedRouteIndex];
    if (selectedRoute && currentETAInfo && selectedRoute.coordinates.length > 0) {
      // Position ETA popup near start but offset to the side
      const startCoord = selectedRoute.coordinates[0];
      
      // Format duration nicely
      const hours = Math.floor(currentETAInfo.durationSeconds / 3600);
      const minutes = Math.floor((currentETAInfo.durationSeconds % 3600) / 60);
      const durationText = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
      
      // Format distance
      const distanceKm = currentETAInfo.distanceMeters / 1000;
      const distanceText = distanceKm >= 100 ? `${Math.round(distanceKm)} km` : `${distanceKm.toFixed(1)} km`;
      
      // Calculate ETA arrival time
      const arrivalTime = new Date(Date.now() + currentETAInfo.durationSeconds * 1000);
      const arrivalText = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const etaIcon = L.divIcon({
        className: 'eta-popup-marker',
        html: `
          <div style="
            background: #1a73e8;
            color: white;
            padding: 10px 14px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
            font-family: system-ui, -apple-system, sans-serif;
            white-space: nowrap;
            min-width: 120px;
          ">
            <div style="font-size: 18px; font-weight: 700; margin-bottom: 2px;">
              ${durationText}
            </div>
            <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 8px;">
              <span>${distanceText}</span>
              <span style="width: 4px; height: 4px; background: rgba(255,255,255,0.6); border-radius: 50%;"></span>
              <span>Arrive ${arrivalText}</span>
            </div>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #1a73e8;
            margin-left: 20px;
          "></div>
        `,
        iconSize: [150, 70],
        iconAnchor: [30, 70],
      });

      etaPopupMarker.current = L.marker([startCoord[0], startCoord[1]], { 
        icon: etaIcon,
        zIndexOffset: 1100,
      }).addTo(map.current);
    }

    // Draw routes - non-selected first (lower z-index), selected last (higher z-index)
    routeData.forEach((route, routeIndex) => {
      const isSelected = routeIndex === selectedRouteIndex;
      
      if (isSelected && hotspots.length > 0) {
        // For the selected route, split into segments based on hotspot proximity
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
      // Non-selected routes - draw as clickable blue dashed lines (more visible)
        const polyline = L.polyline(route.coordinates, {
          color: isSelected ? '#22c55e' : '#3b82f6', // Blue for alternatives
          weight: isSelected ? 6 : 5,
          opacity: isSelected ? 1 : 0.7,
          dashArray: isSelected ? undefined : '12, 8',
          interactive: !isSelected, // Make non-selected routes interactive
        }).addTo(map.current!);

        // Add click handler for non-selected routes
        if (!isSelected && onRouteSelect) {
          polyline.setStyle({ className: 'cursor-pointer' });
          polyline.on('click', () => {
            onRouteSelect(routeIndex);
          });
          polyline.on('mouseover', () => {
            polyline.setStyle({ 
              color: '#6b7280', 
              weight: 5, 
              opacity: 0.8 
            });
          });
          polyline.on('mouseout', () => {
            polyline.setStyle({ 
              color: '#3b82f6', 
              weight: 5, 
              opacity: 0.7 
            });
          });
          polyline.bindTooltip(`Click to select Route ${routeIndex + 1}`, { sticky: true });
        }

        routeLayers.current.push(polyline);
      }

      // Add route label at the start of each route
      if (route.coordinates.length > 0) {
        const startCoord = route.coordinates[0];
        const routeLabelIcon = L.divIcon({
          className: 'route-label-marker',
          html: `
            <div style="
              background: ${isSelected ? '#1a73e8' : '#3b82f6'};
              color: white;
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              font-family: system-ui, -apple-system, sans-serif;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              border: 2px solid white;
              cursor: ${isSelected ? 'default' : 'pointer'};
            ">
              Route ${routeIndex + 1}${isSelected ? ' ✓' : ''}
            </div>
          `,
          iconSize: [80, 24],
          iconAnchor: [-10, 12],
        });

        const labelMarker = L.marker([startCoord[0], startCoord[1]], { 
          icon: routeLabelIcon,
          zIndexOffset: isSelected ? 1200 : 800,
        }).addTo(map.current!);

        if (!isSelected && onRouteSelect) {
          labelMarker.on('click', () => onRouteSelect(routeIndex));
        }

        routeLayers.current.push(labelMarker as any);
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
  }, [routeData, hotspots, isNearHotspot, selectedRouteIndex, onRouteSelect, routeETAInfo]);

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
            <div className="w-3 h-3 rounded-full bg-destructive border-2 border-white flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">!</span>
            </div>
            <span className="text-xs text-muted-foreground">Danger Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1a73e8] border-2 border-white" />
            <span className="text-xs text-muted-foreground">ETA Popup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6] border-2 border-white" />
            <span className="text-xs text-muted-foreground">Your Location</span>
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
