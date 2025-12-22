import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import InputPanel from '@/components/InputPanel';
import MapView, { AccidentPoint, RoutePolyline } from '@/components/MapView';
import RouteResults, { RouteData } from '@/components/RouteResults';
import NavigationPanel from '@/components/NavigationPanel';
import { fetchRoutes, NavigationStep } from '@/services/routingService';
import { fetchAccidentData, AccidentHotspot } from '@/services/accidentDataService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [accidentData, setAccidentData] = useState<AccidentPoint[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [routePolylines, setRoutePolylines] = useState<RoutePolyline[]>([]);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[][]>([]);
  const [startPoint, setStartPoint] = useState<{ lat: number; lng: number } | undefined>();
  const [endPoint, setEndPoint] = useState<{ lat: number; lng: number } | undefined>();
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  // Load accident data from CSV on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const hotspots = await fetchAccidentData();
        const points: AccidentPoint[] = hotspots.map(h => ({
          lat: h.lat,
          lng: h.lng,
          intensity: h.intensity,
        }));
        setAccidentData(points);
        toast({
          title: 'Data Loaded',
          description: `Loaded ${hotspots.length} accident hotspots from CSV.`,
        });
      } catch (error) {
        console.error('Error loading accident data:', error);
        toast({
          title: 'Data Load Error',
          description: 'Failed to load accident data.',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = async (start: string, destination: string) => {
    setIsLoading(true);
    setRoutes([]);
    setRoutePolylines([]);
    setNavigationSteps([]);

    try {
      const [startLat, startLng] = start.split(',').map((s) => parseFloat(s.trim()));
      const [endLat, endLng] = destination.split(',').map((s) => parseFloat(s.trim()));

      if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
        throw new Error('Invalid coordinates format');
      }

      const result = await fetchRoutes(startLat, startLng, endLat, endLng);

      setStartPoint(result.startPoint);
      setEndPoint(result.endPoint);
      setRoutes(result.routes);
      setRoutePolylines(result.polylines);
      setNavigationSteps(result.navigationSteps);

      const safestIndex = result.routes.reduce(
        (minIdx, route, idx, arr) => (route.riskScore < arr[minIdx].riskScore ? idx : minIdx),
        0
      );
      setSelectedRoute(safestIndex);

      toast({
        title: 'Routes Found',
        description: `Found ${result.routes.length} route${result.routes.length > 1 ? 's' : ''} with turn-by-turn directions.`,
      });
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: 'Error Finding Routes',
        description: error instanceof Error ? error.message : 'Failed to calculate routes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const safeRouteIndex = routes.length > 0
    ? routes.reduce((minIdx, route, idx, arr) => (route.riskScore < arr[minIdx].riskScore ? idx : minIdx), 0)
    : -1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 p-4 sm:p-6 space-y-4 max-w-screen-2xl mx-auto w-full">
        <InputPanel onSearch={handleSearch} isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 h-[calc(100vh-280px)] min-h-[500px]">
          <MapView
            accidentData={accidentData}
            routeData={routePolylines}
            startPoint={startPoint}
            endPoint={endPoint}
          />

          <div className="lg:max-h-full overflow-auto space-y-4">
            <RouteResults
              routes={routes}
              safeRouteIndex={safeRouteIndex}
              onRouteSelect={setSelectedRoute}
              selectedRoute={selectedRoute}
            />

            {navigationSteps[selectedRoute] && navigationSteps[selectedRoute].length > 0 && (
              <NavigationPanel
                steps={navigationSteps[selectedRoute]}
                routeId={routes[selectedRoute]?.id || 1}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
