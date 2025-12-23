import { Cloud, Thermometer, Wind, Droplets, Eye, Sun, CloudRain, CloudSnow, CloudFog, CloudLightning, AlertTriangle, CheckCircle } from 'lucide-react';
import { WeatherData, RouteWeatherPoint } from '@/services/weatherService';

interface WeatherPanelProps {
  currentWeather?: WeatherData | null;
  routeWeather?: RouteWeatherPoint[];
  overallAssessment?: {
    overallCondition: WeatherData['drivingCondition'];
    worstCondition: WeatherData['drivingCondition'];
    recommendation: string;
    alerts: string[];
  };
  isLoading?: boolean;
}

const WeatherPanel = ({ currentWeather, routeWeather, overallAssessment, isLoading }: WeatherPanelProps) => {
  const getConditionColor = (condition: WeatherData['drivingCondition']) => {
    switch (condition) {
      case 'excellent': return 'text-success bg-success/10 border-success/30';
      case 'good': return 'text-success bg-success/10 border-success/30';
      case 'fair': return 'text-warning bg-warning/10 border-warning/30';
      case 'poor': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'dangerous': return 'text-destructive bg-destructive/10 border-destructive/30';
      default: return 'text-muted-foreground bg-muted/10 border-muted/30';
    }
  };

  const getConditionIcon = (condition: WeatherData['drivingCondition']) => {
    switch (condition) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-5 h-5" />;
      case 'fair':
        return <AlertTriangle className="w-5 h-5" />;
      case 'poor':
      case 'dangerous':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Cloud className="w-5 h-5" />;
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (code <= 3) return <Cloud className="w-6 h-6 text-muted-foreground" />;
    if (code <= 49) return <CloudFog className="w-6 h-6 text-muted-foreground" />;
    if (code <= 69) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (code <= 79) return <CloudSnow className="w-6 h-6 text-blue-300" />;
    if (code <= 94) return <CloudRain className="w-6 h-6 text-blue-500" />;
    return <CloudLightning className="w-6 h-6 text-yellow-600" />;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-elevated p-5 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-muted rounded-lg"></div>
          <div className="h-20 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Show loading state when no weather data yet
  if (!currentWeather && !routeWeather?.length) {
    return (
      <div className="bg-card rounded-2xl shadow-elevated p-5">
        <div className="flex items-center gap-2 mb-3">
          <Cloud className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-bold text-foreground">Weather Conditions</h2>
        </div>
        <div className="text-center py-4 text-muted-foreground">
          <Cloud className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Fetching weather data...</p>
          <p className="text-xs">Allow location access for current weather</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-elevated p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-bold text-foreground">Weather Conditions</h2>
      </div>

      {/* Current Location Weather */}
      {currentWeather && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Current Location</p>
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getWeatherIcon(currentWeather.conditionCode)}
                <div>
                  <p className="text-2xl font-bold text-foreground">{currentWeather.temperature}°C</p>
                  <p className="text-sm text-muted-foreground">{currentWeather.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Feels like</p>
                <p className="text-lg font-semibold">{currentWeather.feelsLike}°C</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-card/50">
                <Wind className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs font-medium">{currentWeather.windSpeed} km/h</p>
                <p className="text-[10px] text-muted-foreground">{currentWeather.windDirection}</p>
              </div>
              <div className="p-2 rounded-lg bg-card/50">
                <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                <p className="text-xs font-medium">{currentWeather.humidity}%</p>
                <p className="text-[10px] text-muted-foreground">Humidity</p>
              </div>
              <div className="p-2 rounded-lg bg-card/50">
                <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs font-medium">{currentWeather.visibility.toFixed(1)} km</p>
                <p className="text-[10px] text-muted-foreground">Visibility</p>
              </div>
              <div className="p-2 rounded-lg bg-card/50">
                <Cloud className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs font-medium">{currentWeather.cloudCover}%</p>
                <p className="text-[10px] text-muted-foreground">Cloud</p>
              </div>
            </div>

            {/* Driving Condition */}
            <div className={`mt-3 p-3 rounded-lg border ${getConditionColor(currentWeather.drivingCondition)}`}>
              <div className="flex items-center gap-2">
                {getConditionIcon(currentWeather.drivingCondition)}
                <span className="font-medium capitalize">{currentWeather.drivingCondition} Driving Conditions</span>
              </div>
              <p className="text-xs mt-1 opacity-80">{currentWeather.safetyAdvice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Route Weather Assessment */}
      {overallAssessment && routeWeather && routeWeather.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Route Weather</p>
          
          {/* Overall Assessment */}
          <div className={`p-4 rounded-xl border mb-3 ${getConditionColor(overallAssessment.worstCondition)}`}>
            <div className="flex items-start gap-3">
              {getConditionIcon(overallAssessment.worstCondition)}
              <div className="flex-1">
                <p className="font-medium">{overallAssessment.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Weather Along Route */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Weather Along Route:</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {routeWeather.map((point, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 p-3 rounded-lg border min-w-[100px] text-center ${getConditionColor(point.weather.drivingCondition)}`}
                >
                  <p className="text-[10px] text-muted-foreground mb-1">{point.distanceFromStart} km</p>
                  <span className="text-lg">{point.weather.icon}</span>
                  <p className="text-sm font-bold mt-1">{point.weather.temperature}°C</p>
                  <p className="text-[10px] truncate">{point.weather.condition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {overallAssessment.alerts.length > 0 && (
            <div className="mt-3 space-y-1">
              {overallAssessment.alerts.map((alert, index) => (
                <div key={index} className="text-xs p-2 rounded bg-destructive/10 text-destructive">
                  {alert}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherPanel;
