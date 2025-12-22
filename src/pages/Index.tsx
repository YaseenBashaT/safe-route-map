import { useState } from 'react';
import Header from '@/components/Header';
import InputPanel from '@/components/InputPanel';
import MapView, { AccidentPoint, RoutePolyline } from '@/components/MapView';
import RouteResults, { RouteData } from '@/components/RouteResults';

// Mock accident data for demonstration
const mockAccidentData: AccidentPoint[] = [
  { lat: 17.385, lng: 78.4867, intensity: 0.8 },
  { lat: 17.42, lng: 78.45, intensity: 0.6 },
  { lat: 17.35, lng: 78.52, intensity: 0.9 },
  { lat: 17.4, lng: 78.4, intensity: 0.7 },
  { lat: 17.38, lng: 78.55, intensity: 0.5 },
  { lat: 17.45, lng: 78.35, intensity: 0.8 },
  { lat: 17.32, lng: 78.48, intensity: 0.6 },
  { lat: 17.44, lng: 78.42, intensity: 0.9 },
  { lat: 17.36, lng: 78.38, intensity: 0.4 },
  { lat: 17.41, lng: 78.51, intensity: 0.7 },
  { lat: 17.39, lng: 78.44, intensity: 0.8 },
  { lat: 17.43, lng: 78.47, intensity: 0.5 },
];

// Placeholder function to simulate route finding
const findRoutes = (start: string, destination: string): { routes: RouteData[]; polylines: RoutePolyline[] } => {
  const [startLat, startLng] = start.split(',').map((s) => parseFloat(s.trim()));
  const [endLat, endLng] = destination.split(',').map((s) => parseFloat(s.trim()));

  // Generate mock routes
  const routes: RouteData[] = [
    { id: 1, distance: '12.4 km', eta: '28 min', riskScore: 25 },
    { id: 2, distance: '10.8 km', eta: '24 min', riskScore: 65 },
    { id: 3, distance: '14.2 km', eta: '32 min', riskScore: 45 },
  ];

  // Generate mock polylines
  const midLat1 = (startLat + endLat) / 2 + 0.02;
  const midLng1 = (startLng + endLng) / 2 - 0.02;

  const midLat2 = (startLat + endLat) / 2 - 0.01;
  const midLng2 = (startLng + endLng) / 2 + 0.01;

  const midLat3 = (startLat + endLat) / 2 + 0.03;
  const midLng3 = (startLng + endLng) / 2 + 0.02;

  const polylines: RoutePolyline[] = [
    {
      coordinates: [
        [startLat, startLng],
        [midLat1, midLng1],
        [endLat, endLng],
      ],
      isSafest: true,
    },
    {
      coordinates: [
        [startLat, startLng],
        [midLat2, midLng2],
        [endLat, endLng],
      ],
      isSafest: false,
    },
    {
      coordinates: [
        [startLat, startLng],
        [midLat3, midLng3],
        [endLat, endLng],
      ],
      isSafest: false,
    },
  ];

  return { routes, polylines };
};

const Index = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [routePolylines, setRoutePolylines] = useState<RoutePolyline[]>([]);
  const [startPoint, setStartPoint] = useState<{ lat: number; lng: number } | undefined>();
  const [endPoint, setEndPoint] = useState<{ lat: number; lng: number } | undefined>();
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (start: string, destination: string) => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const [startLat, startLng] = start.split(',').map((s) => parseFloat(s.trim()));
    const [endLat, endLng] = destination.split(',').map((s) => parseFloat(s.trim()));

    setStartPoint({ lat: startLat, lng: startLng });
    setEndPoint({ lat: endLat, lng: endLng });

    const { routes: newRoutes, polylines } = findRoutes(start, destination);
    setRoutes(newRoutes);
    setRoutePolylines(polylines);

    // Find safest route index
    const safestIndex = newRoutes.reduce(
      (minIdx, route, idx, arr) => (route.riskScore < arr[minIdx].riskScore ? idx : minIdx),
      0
    );
    setSelectedRoute(safestIndex);

    setIsLoading(false);
  };

  const safeRouteIndex = routes.length > 0
    ? routes.reduce((minIdx, route, idx, arr) => (route.riskScore < arr[minIdx].riskScore ? idx : minIdx), 0)
    : -1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 p-4 sm:p-6 space-y-4 max-w-screen-2xl mx-auto w-full">
        {/* Input Panel */}
        <InputPanel onSearch={handleSearch} isLoading={isLoading} />

        {/* Map and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 h-[calc(100vh-280px)] min-h-[500px]">
          {/* Map */}
          <MapView
            accidentData={mockAccidentData}
            routeData={routePolylines}
            startPoint={startPoint}
            endPoint={endPoint}
          />

          {/* Route Results */}
          <div className="lg:max-h-full overflow-auto">
            <RouteResults
              routes={routes}
              safeRouteIndex={safeRouteIndex}
              onRouteSelect={setSelectedRoute}
              selectedRoute={selectedRoute}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
