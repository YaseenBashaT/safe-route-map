import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import InputPanel from '@/components/InputPanel';
import MapView, { RoutePolyline } from '@/components/MapView';
import RouteComparisonPanel from '@/components/RouteComparisonPanel';
import NavigationPanel from '@/components/NavigationPanel';
import StatisticsPanel from '@/components/StatisticsPanel';
import FilterPanel, { FilterState } from '@/components/FilterPanel';
import RouteSummaryCard from '@/components/RouteSummaryCard';
import { fetchRoutes, NavigationStep, RouteRiskInfo } from '@/services/routingService';
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
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
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
          description: `Loaded ${records.length} accident records from CSV.`,
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

  // Load user-reported accidents and convert to hotspots
  useEffect(() => {
    const loadUserReports = async () => {
      try {
        const result = await accidentReportService.getRecentReports(200);
        if (result.success && result.data && Array.isArray(result.data)) {
          // Convert reports to hotspots format matching AccidentHotspot interface
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
    // Refresh every 30 seconds
    const interval = setInterval(loadUserReports, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check for accidents on route and alert
  const checkRouteAlerts = useCallback((reports: AccidentReport[], routeCoords: [number, number][]) => {
    const recentReports = reports.filter(r => {
      const reportTime = new Date(r.reportedAt).getTime();
      const now = Date.now();
      // Only check reports from last 24 hours
      return (now - reportTime) < 24 * 60 * 60 * 1000;
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
        description: `${nearbyAccidents.length} recent accident${nearbyAccidents.length > 1 ? 's' : ''} reported near your route. Drive carefully!`,
        variant: 'destructive',
        duration: 10000,
      });
    }
  }, [toast]);

  // Combined hotspots (CSV + user reports)
  const combinedHotspots = useMemo(() => {
    return [...hotspots, ...userReportedHotspots];
  }, [hotspots, userReportedHotspots]);

  // Apply filters when they change
  const filteredHotspots = useMemo(() => {
    const hasFilters = filters.severity.length > 0 || filters.weather.length > 0 || filters.roadType.length > 0;
    if (!hasFilters) return combinedHotspots;
    return getFilteredHotspots(allRecords, filters);
  }, [allRecords, combinedHotspots, filters]);

  // Calculate statistics - show route-specific stats when a route is selected
  const statistics = useMemo(() => {
    // If a route is selected and has nearby hotspots, show route-specific stats
    if (routes.length > 0 && routeRiskInfo[selectedRoute]?.nearbyHotspots?.length > 0) {
      return getAccidentStatistics(routeRiskInfo[selectedRoute].nearbyHotspots);
    }
    // Otherwise show overall filtered stats
    return getAccidentStatistics(filteredHotspots);
  }, [filteredHotspots, routes, selectedRoute, routeRiskInfo]);

  // Get current risk factors for selected route
  const currentRiskFactors = useMemo(() => {
    if (routes.length > 0 && routeRiskInfo[selectedRoute]) {
      return routeRiskInfo[selectedRoute].riskFactors;
    }
    return [];
  }, [routes, selectedRoute, routeRiskInfo]);

  const handleSearch = async (start: string, destination: string) => {
    setIsLoading(true);
    setRoutes([]);
    setRoutePolylines([]);
    setNavigationSteps([]);
    setShowNavigation(false);

    try {
      const [startLat, startLng] = start.split(',').map((s) => parseFloat(s.trim()));
      const [endLat, endLng] = destination.split(',').map((s) => parseFloat(s.trim()));

      if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
        throw new Error('Invalid coordinates format');
      }

      // Pass combined hotspots (CSV + user reports) to calculate real risk scores
      const result = await fetchRoutes(startLat, startLng, endLat, endLng, combinedHotspots);

      setStartPoint(result.startPoint);
      setEndPoint(result.endPoint);
      setRoutes(result.routes);
      setRoutePolylines(result.polylines);
      setNavigationSteps(result.navigationSteps);
      setRouteRiskInfo(result.routeRiskInfo);

      const safestIndex = result.routes.reduce(
        (minIdx, route, idx, arr) => (route.riskScore < arr[minIdx].riskScore ? idx : minIdx),
        0
      );
      setSelectedRoute(safestIndex);

      // Check for recent accident alerts on all routes
      const reportsResult = await accidentReportService.getRecentReports(100);
      if (reportsResult.success && reportsResult.data) {
        result.polylines.forEach((polyline, index) => {
          if (index === safestIndex) {
            checkRouteAlerts(reportsResult.data, polyline.coordinates);
          }
        });
      }

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


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 p-4 sm:p-6 space-y-4 max-w-screen-2xl mx-auto w-full">
        <InputPanel onSearch={handleSearch} isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 h-[calc(100vh-280px)] min-h-[500px]">
          <MapView
            hotspots={filteredHotspots}
            routeData={routePolylines}
            startPoint={startPoint}
            endPoint={endPoint}
          />

          <div className="lg:max-h-full overflow-auto space-y-4">
            {/* User Report Stats */}
            {userReportedHotspots.length > 0 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-sm text-foreground">
                  <strong>{userReportedHotspots.length}</strong> user-reported accidents included in heatmap
                </span>
              </div>
            )}

            {/* Route Summary Card - Shows before navigation starts */}
            {routes.length > 0 && routes[selectedRoute] && routeRiskInfo[selectedRoute] && !showNavigation && (
              <RouteSummaryCard
                route={routes[selectedRoute]}
                riskInfo={routeRiskInfo[selectedRoute]}
                routeAccidents={routeRiskInfo[selectedRoute]?.nearbyHotspots || []}
                isSelected={true}
                onStartNavigation={() => setShowNavigation(true)}
              />
            )}

            {/* Route Comparison Panel */}
            <RouteComparisonPanel
              routes={routes}
              routeRiskInfo={routeRiskInfo}
              selectedRoute={selectedRoute}
              onRouteSelect={(index) => {
                setSelectedRoute(index);
                setShowNavigation(false);
              }}
            />

            {/* Statistics Panel */}
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

            {/* Filter Panel */}
            <FilterPanel filters={filters} onFilterChange={setFilters} />
            
            {/* Navigation Panel - Shows after "Start Navigation" is clicked */}
            {showNavigation && navigationSteps[selectedRoute] && navigationSteps[selectedRoute].length > 0 && (
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
