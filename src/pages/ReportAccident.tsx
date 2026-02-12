import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { accidentReportService, AccidentReport } from '@/services/accidentReportService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  Loader2, 
  ArrowLeft, 
  Clock,
  CheckCircle,
  Navigation
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { predictSeverity, PredictionResponse } from '@/services/predictService';

const ReportAccident = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [recentReports, setRecentReports] = useState<AccidentReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Form state
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'serious' | 'fatal'>('minor');
  const [accidentType, setAccidentType] = useState('');
  const [weather, setWeather] = useState('');
  const [roadType, setRoadType] = useState('');
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Load recent reports
  useEffect(() => {
    const loadReports = async () => {
      const result = await accidentReportService.getRecentReports(10);
      if (result.success && result.data) {
        setRecentReports(result.data);
      }
      setIsLoadingReports(false);
    };
    loadReports();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Error', description: 'Geolocation is not supported by your browser', variant: 'destructive' });
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        
        // Try to reverse geocode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await response.json();
          if (data.display_name) {
            setLocation(data.display_name);
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        }
        
        setIsLoadingLocation(false);
        toast({ title: 'Location detected', description: 'Your current location has been set.' });
      },
      (error) => {
        setIsLoadingLocation(false);
        toast({ title: 'Location Error', description: error.message, variant: 'destructive' });
      }
    );
  };

  // Geocode address to get coordinates
  const geocodeAddress = async () => {
    if (!location.trim()) {
      toast({ title: 'Error', description: 'Please enter an address first', variant: 'destructive' });
      return;
    }

    setIsLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setLatitude(parseFloat(data[0].lat).toFixed(6));
        setLongitude(parseFloat(data[0].lon).toFixed(6));
        setLocation(data[0].display_name);
        toast({ title: 'Address found', description: 'Coordinates have been set from address.' });
      } else {
        toast({ title: 'Not found', description: 'Could not find coordinates for this address', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      toast({ title: 'Error', description: 'Failed to geocode address', variant: 'destructive' });
    }
    setIsLoadingLocation(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude || !location || !accidentType) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const report: Omit<AccidentReport, '_id' | 'createdAt' | 'verified'> = {
      userId: user?._id,
      userEmail: user?.email,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location,
      description: description || undefined,
      severity,
      accidentType,
      weather: weather || undefined,
      roadType: roadType || undefined,
      reportedAt: new Date().toISOString(),
    };

    const result = await accidentReportService.reportAccident(report);
    setIsSubmitting(false);

    if (result.success) {
      toast({ 
        title: 'Report Submitted', 
        description: 'Thank you for reporting. This will help other travelers stay safe.',
      });
      
      // Clear form
      setLatitude('');
      setLongitude('');
      setLocation('');
      setDescription('');
      setSeverity('minor');
      setAccidentType('');
      setWeather('');
      setRoadType('');
      setPrediction(null);
      
      // Reload recent reports
      const reportsResult = await accidentReportService.getRecentReports(10);
      if (reportsResult.success && reportsResult.data) {
        setRecentReports(reportsResult.data);
      }
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to submit report', variant: 'destructive' });
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'fatal': return 'bg-destructive text-destructive-foreground';
      case 'serious': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handlePredictSeverity = async () => {
    setIsPredicting(true);
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });
    const timeOfDay = now.toTimeString().slice(0, 5);

    const result = await predictSeverity({
      month,
      day_of_week: dayOfWeek,
      time_of_day: timeOfDay,
      weather: weather || 'Clear',
      road_type: roadType || 'Urban Road',
      road_condition: 'Dry',
      lighting: now.getHours() >= 18 || now.getHours() <= 6 ? 'Dark' : 'Daylight',
      traffic_control: 'Signs',
      speed_limit: roadType === 'Highway' || roadType === 'Expressway' ? 80 : 50,
      num_vehicles: 1,
      num_casualties: 0,
      num_fatalities: 0,
      driver_age: 35,
      driver_gender: 'Male',
      license_status: 'Valid',
      alcohol: 'No',
      location_detail: 'Straight Road',
      year: now.getFullYear(),
    });

    setIsPredicting(false);
    if (!result) {
      toast({ title: 'Prediction failed', description: 'Unable to get a model prediction.', variant: 'destructive' });
      return;
    }

    setPrediction(result);
    setSeverity(result.prediction as 'minor' | 'serious' | 'fatal');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-card border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Map</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-danger">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-foreground">Report Accident</h1>
            </div>
            {isAuthenticated ? (
              <span className="text-sm text-muted-foreground">
                Logged in as {user?.name || user?.email}
              </span>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Report a New Accident
              </CardTitle>
              <CardDescription>
                Help others stay safe by reporting accidents in your area. Your report will update the heatmap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Location Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Location</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Navigation className="w-4 h-4 mr-2" />
                      )}
                      Use Current Location
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude *</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="e.g., 19.0760"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude *</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="e.g., 72.8777"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="location" className="text-xs text-muted-foreground">Location Name/Address *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="location"
                          type="text"
                          placeholder="e.g., Marine Drive, Mumbai"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm"
                        onClick={geocodeAddress}
                        disabled={isLoadingLocation || !location.trim()}
                        title="Get coordinates from address"
                      >
                        {isLoadingLocation ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Enter address and click the pin icon to auto-fill coordinates</p>
                  </div>
                </div>

                <Separator />

                {/* Accident Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Severity *</Label>
                    <Select value={severity} onValueChange={(v: 'minor' | 'serious' | 'fatal') => setSeverity(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="serious">Serious</SelectItem>
                        <SelectItem value="fatal">Fatal</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handlePredictSeverity}
                        disabled={isPredicting}
                      >
                        {isPredicting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                            Predicting...
                          </>
                        ) : (
                          <>
                            <Shield className="w-3.5 h-3.5 mr-2" />
                            Predict Severity
                          </>
                        )}
                      </Button>
                      {prediction && (
                        <span className="text-xs text-muted-foreground">
                          Predicted {prediction.prediction} ({Math.round(prediction.confidence * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Accident Type *</Label>
                    <Select value={accidentType} onValueChange={setAccidentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Collision">Collision</SelectItem>
                        <SelectItem value="Hit and Run">Hit and Run</SelectItem>
                        <SelectItem value="Overturning">Overturning</SelectItem>
                        <SelectItem value="Pedestrian Hit">Pedestrian Hit</SelectItem>
                        <SelectItem value="Two-Wheeler">Two-Wheeler</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Weather (optional)</Label>
                    <Select value={weather} onValueChange={setWeather}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select weather" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clear">Clear</SelectItem>
                        <SelectItem value="Rainy">Rainy</SelectItem>
                        <SelectItem value="Foggy">Foggy</SelectItem>
                        <SelectItem value="Cloudy">Cloudy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Road Type (optional)</Label>
                    <Select value={roadType} onValueChange={setRoadType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select road" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Highway">Highway</SelectItem>
                        <SelectItem value="City Road">City Road</SelectItem>
                        <SelectItem value="Rural Road">Rural Road</SelectItem>
                        <SelectItem value="Expressway">Expressway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs text-muted-foreground">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the accident (what happened, vehicles involved, time, etc.)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Reports
              </CardTitle>
              <CardDescription>
                Latest accident reports from the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No reports yet. Be the first to report!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {recentReports.map((report, index) => (
                    <div 
                      key={report._id || index} 
                      className="p-3 rounded-lg bg-muted/50 border border-border space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium line-clamp-1">{report.location}</span>
                        </div>
                        <Badge className={`shrink-0 ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </Badge>
                      </div>
                      {report.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{report.accidentType}</span>
                        <span>•</span>
                        <span>{new Date(report.reportedAt).toLocaleDateString()}</span>
                        {report.verified && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-success">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReportAccident;
