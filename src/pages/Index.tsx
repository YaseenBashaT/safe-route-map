import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import MultiStopInput, { StopPoint } from '@/components/MultiStopInput';
import MapView, { RoutePolyline } from '@/components/MapView';
import RouteComparisonPanel from '@/components/RouteComparisonPanel';
import NavigationPanel from '@/components/NavigationPanel';
import StatisticsPanel from '@/components/StatisticsPanel';
import FilterPanel, { FilterState } from '@/components/FilterPanel';
import RouteSummaryCard from '@/components/RouteSummaryCard';
import WeatherPanel from '@/components/WeatherPanel';
import { fetchRoutes, NavigationStep, RouteRiskInfo, calculateAverageSpeed } from '@/services/routingService';
import { fetchCurrentWeather, fetchRouteWeather, assessRouteWeatherSafety, WeatherData, RouteWeatherPoint } from '@/services/weatherService';
import type { RouteData } from '@/components/RouteResults';
import { 
  fetchAccidentData, 
  AccidentHotspot, 
  AccidentRecord,
  getFilteredHotspots,
  getAccidentStatistics 
} from '@/services/accidentDataService';
import { accidentReportService, AccidentReport, isAccidentNearRoute } from '@/services/accidentReportService';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

const Index = () => {
  const [allRecords, setAllRecords] = useState<AccidentRecord[]>([]);
  const [hotspots, setHotspots] = useState<AccidentHotspot[]>([]);
  const [userReportedHotspots, setUserReportedHotspots] = useState<AccidentHotspot[]>([]);
  const [filters, setFilters] = useState<FilterState>({ severity: [], weather: [], roadType: [] });
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [routePolylines, setRoutePolylines] = useState<RoutePolyline[]>([]);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[][]>([]);
  const [routeRiskInfo, setRouteRiskInfo] = useState<RouteRiskInfo[]>([]);
  const [startPoint, setStartPoint] = useState<{ lat: number; lng: number } | undefined>();
  const [endPoint, setEndPoint] = useState<{ lat: number; lng: number } | undefined>();
  const [waypoints, setWaypoints] = useState<{ lat: number; lng: number }[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Weather state
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [routeWeather, setRouteWeather] = useState<RouteWeatherPoint[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  
  // Raw metrics for accuracy
  const [rawDistances, setRawDistances] = useState<number[]>([]);
  const [rawDurations, setRawDurations] = useState<number[]>([]);
  
  const { toast } = useToast();

  // Load accident data from CSV on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { hotspots: loadedHotspots, records } = await fetchAccidentData();
        setAllRecords(records);
        setHotspots(loadedHotspots);
        toast({
          title: 'Data Loaded',
          description: `Loaded ${records.length} accident records.`,
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

  // Load user-reported accidents
  useEffect(() => {
    const loadUserReports = async () => {
      try {
        const result = await accidentReportService.getRecentReports(200);
        if (result.success && result.data && Array.isArray(result.data)) {
          const reportHotspots: AccidentHotspot[] = result.data.map((report: AccidentReport) => ({
            lat: report.latitude,
            lng: report.longitude,
            intensity: report.severity === 'fatal' ? 1 : report.severity === 'serious' ? 0.7 : 0.4,
            city: report.location.split(',')[0] || 'Unknown',
            state: report.location.split(',')[1]?.trim() || 'Unknown',
            totalAccidents: 1,
            fatalAccidents: report.severity === 'fatal' ? 1 : 0,
            seriousAccidents: report.severity === 'serious' ? 1 : 0,
            minorAccidents: report.severity === 'minor' ? 1 : 0,
            weatherBreakdown: report.weather ? { [report.weather]: 1 } : {},
            roadTypeBreakdown: report.roadType ? { [report.roadType]: 1 } : {},
            records: [],
          }));
          setUserReportedHotspots(reportHotspots);
        }
      } catch (error) {
        console.error('Error loading user reports:', error);
      }
    };

    loadUserReports();
    const interval = setInterval(loadUserReports, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch current location weather on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const weather = await fetchCurrentWeather(position.coords.latitude, position.coords.longitude);
          if (weather) setCurrentWeather(weather);
        },
        () => console.log('Location access denied for weather')
      );
    }
  }, []);

  const checkRouteAlerts = useCallback((reports: AccidentReport[], routeCoords: [number, number][]) => {
    const recentReports = reports.filter(r => {
      const reportTime = new Date(r.reportedAt).getTime();
      return (Date.now() - reportTime) < 24 * 60 * 60 * 1000;
    });

    const nearbyAccidents = recentReports.filter(report => 
      isAccidentNearRoute({ latitude: report.latitude, longitude: report.longitude }, routeCoords, 1)
    );

    if (nearbyAccidents.length > 0) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span>Route Alert!</span>
          </div>
        ) as any,
        description: `${nearbyAccidents.length} recent accident${nearbyAccidents.length > 1 ? 's' : ''} reported near your route.`,
        variant: 'destructive',
        duration: 10000,
      });
    }
  }, [toast]);

  const combinedHotspots = useMemo(() => [...hotspots, ...userReportedHotspots], [hotspots, userReportedHotspots]);

  const filteredHotspots = useMemo(() => {
    const hasFilters = filters.severity.length > 0 || filters.weather.length > 0 || filters.roadType.length > 0;
    if (!hasFilters) return combinedHotspots;
    return getFilteredHotspots(allRecords, filters);
  }, [allRecords, combinedHotspots, filters]);

  const statistics = useMemo(() => {
    if (routes.length > 0 && routeRiskInfo[selectedRoute]?.nearbyHotspots?.length > 0) {
      return getAccidentStatistics(routeRiskInfo[selectedRoute].nearbyHotspots);
    }
    return getAccidentStatistics(filteredHotspots);
  }, [filteredHotspots, routes, selectedRoute, routeRiskInfo]);

  const currentRiskFactors = useMemo(() => {
    if (routes.length > 0 && routeRiskInfo[selectedRoute]) {
      return routeRiskInfo[selectedRoute].riskFactors;
    }
    return [];
  }, [routes, selectedRoute, routeRiskInfo]);

  const weatherAssessment = useMemo(() => {
    if (routeWeather.length > 0) {
      return assessRouteWeatherSafety(routeWeather);
    }
    return undefined;
  }, [routeWeather]);

  const handleMultiStopSearch = async (stops: StopPoint[]) => {
    setIsLoading(true);
    setRoutes([]);
    setRoutePolylines([]);
    setNavigationSteps([]);
    setShowNavigation(false);
    setRouteWeather([]);

    try {
      const startStop = stops.find(s => s.type === 'start');
      const endStop = stops.find(s => s.type === 'end');
      const waypointStops = stops.filter(s => s.type === 'stop');

      if (!startStop || !endStop) throw new Error('Start and destination required');

      const [startLat, startLng] = startStop.coords.split(',').map(s => parseFloat(s.trim()));
      const [endLat, endLng] = endStop.coords.split(',').map(s => parseFloat(s.trim()));

      const waypointCoords = waypointStops.map(wp => {
        const [lat, lng] = wp.coords.split(',').map(s => parseFloat(s.trim()));
        return { lat, lng };
      }).filter(wp => !isNaN(wp.lat) && !isNaN(wp.lng));

      if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
        throw new Error('Invalid coordinates format');
      }

      const result = await fetchRoutes(startLat, startLng, endLat, endLng, combinedHotspots, waypointCoords.length > 0 ? waypointCoords : undefined);

      setStartPoint(result.startPoint);
      setEndPoint(result.endPoint);
      setWaypoints(waypointCoords);
      setRoutes(result.routes);
      setRoutePolylines(result.polylines);
      setNavigationSteps(result.navigationSteps);
      setRouteRiskInfo(result.routeRiskInfo);
      setRawDistances(result.rawDistanceMeters);
      setRawDurations(result.rawDurationSeconds);

      const safestIndex = result.routes.reduce(
        (minIdx, route, idx, arr) => (route.riskScore < arr[minIdx].riskScore ? idx : minIdx),
        0
      );
      setSelectedRoute(safestIndex);

      // Fetch weather along route
      setWeatherLoading(true);
      const routeWeatherData = await fetchRouteWeather(result.polylines[safestIndex].coordinates);
      setRouteWeather(routeWeatherData);
      setWeatherLoading(false);

      // Check for alerts
      const reportsResult = await accidentReportService.getRecentReports(100);
      if (reportsResult.success && reportsResult.data) {
        checkRouteAlerts(reportsResult.data, result.polylines[safestIndex].coordinates);
      }

      toast({
        title: 'Routes Found',
        description: `Found ${result.routes.length} route${result.routes.length > 1 ? 's' : ''}${waypointCoords.length > 0 ? ` with ${waypointCoords.length} stop${waypointCoords.length > 1 ? 's' : ''}` : ''}.`,
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

  // Calculate accurate metrics
  const currentRouteMetrics = useMemo(() => {
    if (rawDistances[selectedRoute] && rawDurations[selectedRoute]) {
      return {
        distanceKm: rawDistances[selectedRoute] / 1000,
        durationMin: rawDurations[selectedRoute] / 60,
        avgSpeedKmh: calculateAverageSpeed(rawDistances[selectedRoute], rawDurations[selectedRoute])
      };
    }
    return null;
  }, [rawDistances, rawDurations, selectedRoute]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 p-4 sm:p-6 space-y-4 max-w-screen-2xl mx-auto w-full">
        <MultiStopInput onSearch={handleMultiStopSearch} isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 h-[calc(100vh-280px)] min-h-[500px]">
          <MapView
            hotspots={filteredHotspots}
            routeData={routePolylines}
            startPoint={startPoint}
            endPoint={endPoint}
            selectedRouteIndex={selectedRoute}
            onRouteSelect={(index) => {
              setSelectedRoute(index);
              setShowNavigation(false);
            }}
          />

          <div className="lg:max-h-full overflow-auto space-y-4">
            {userReportedHotspots.length > 0 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-sm text-foreground">
                  <strong>{userReportedHotspots.length}</strong> user-reported accidents included
                </span>
              </div>
            )}

            {/* Weather Panel */}
            <WeatherPanel
              currentWeather={currentWeather}
              routeWeather={routeWeather}
              overallAssessment={weatherAssessment}
              isLoading={weatherLoading}
            />

            {/* Route Summary Card */}
            {routes.length > 0 && routes[selectedRoute] && routeRiskInfo[selectedRoute] && !showNavigation && (
              <RouteSummaryCard
                route={routes[selectedRoute]}
                riskInfo={routeRiskInfo[selectedRoute]}
                routeAccidents={routeRiskInfo[selectedRoute]?.nearbyHotspots || []}
                isSelected={true}
                onStartNavigation={() => setShowNavigation(true)}
              />
            )}

            <RouteComparisonPanel
              routes={routes}
              routeRiskInfo={routeRiskInfo}
              selectedRoute={selectedRoute}
              onRouteSelect={(index) => {
                setSelectedRoute(index);
                setShowNavigation(false);
              }}
            />

            <StatisticsPanel
              totalAccidents={statistics.totalAccidents}
              totalFatal={statistics.totalFatal}
              totalSerious={statistics.totalSerious}
              totalMinor={statistics.totalMinor}
              locationCount={statistics.locationCount}
              topCities={statistics.topCities}
              isRouteMode={routes.length > 0 && routeRiskInfo[selectedRoute]?.nearbyHotspots?.length > 0}
              riskFactors={currentRiskFactors}
              routeRiskScore={routes[selectedRoute]?.riskScore}
            />

            <FilterPanel filters={filters} onFilterChange={setFilters} />
            
            {showNavigation && navigationSteps[selectedRoute] && navigationSteps[selectedRoute].length > 0 && (
              <NavigationPanel
                steps={navigationSteps[selectedRoute]}
                routeId={routes[selectedRoute]?.id || 1}
                totalDistance={routes[selectedRoute]?.distance}
                totalDuration={routes[selectedRoute]?.eta}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
