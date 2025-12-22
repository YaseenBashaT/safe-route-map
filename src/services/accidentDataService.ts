export interface AccidentRecord {
  stateName: string;
  cityName: string;
  year: number;
  month: string;
  dayOfWeek: string;
  timeOfDay: string;
  severity: 'Minor' | 'Serious' | 'Fatal';
  vehiclesInvolved: number;
  vehicleType: string;
  casualties: number;
  fatalities: number;
  weatherConditions: string;
  roadType: string;
  roadCondition: string;
  lightingConditions: string;
  trafficControl: string;
  speedLimit: number;
  driverAge: number;
  driverGender: string;
  licenseStatus: string;
  alcoholInvolvement: boolean;
  locationDetails: string;
}

export interface AccidentHotspot {
  lat: number;
  lng: number;
  intensity: number;
  city: string;
  state: string;
  totalAccidents: number;
  fatalAccidents: number;
  seriousAccidents: number;
  minorAccidents: number;
  weatherBreakdown: Record<string, number>;
  roadTypeBreakdown: Record<string, number>;
  records: AccidentRecord[];
}

// City coordinates mapping for India
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // Major cities
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Kanpur': { lat: 26.4499, lng: 80.3319 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Thane': { lat: 19.2183, lng: 72.9781 },
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Patna': { lat: 25.5941, lng: 85.1376 },
  'Vadodara': { lat: 22.3072, lng: 73.1812 },
  'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'Ludhiana': { lat: 30.9010, lng: 75.8573 },
  'Agra': { lat: 27.1767, lng: 78.0081 },
  'Nashik': { lat: 19.9975, lng: 73.7898 },
  'Faridabad': { lat: 28.4089, lng: 77.3178 },
  'Meerut': { lat: 28.9845, lng: 77.7064 },
  'Rajkot': { lat: 22.3039, lng: 70.8022 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Srinagar': { lat: 34.0837, lng: 74.7973 },
  'Aurangabad': { lat: 19.8762, lng: 75.3433 },
  'Dhanbad': { lat: 23.7957, lng: 86.4304 },
  'Amritsar': { lat: 31.6340, lng: 74.8723 },
  'Allahabad': { lat: 25.4358, lng: 81.8463 },
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Howrah': { lat: 22.5958, lng: 88.2636 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Jabalpur': { lat: 23.1815, lng: 79.9864 },
  'Gwalior': { lat: 26.2183, lng: 78.1828 },
  'Vijayawada': { lat: 16.5062, lng: 80.6480 },
  'Jodhpur': { lat: 26.2389, lng: 73.0243 },
  'Madurai': { lat: 9.9252, lng: 78.1198 },
  'Raipur': { lat: 21.2514, lng: 81.6296 },
  'Kota': { lat: 25.2138, lng: 75.8648 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Guwahati': { lat: 26.1445, lng: 91.7362 },
  'Solapur': { lat: 17.6599, lng: 75.9064 },
  'Hubli': { lat: 15.3647, lng: 75.1240 },
  'Tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'Bareilly': { lat: 28.3670, lng: 79.4304 },
  'Mysore': { lat: 12.2958, lng: 76.6394 },
  'Tirupati': { lat: 13.6288, lng: 79.4192 },
  'Gurgaon': { lat: 28.4595, lng: 77.0266 },
  'Aligarh': { lat: 27.8974, lng: 78.0880 },
  'Jalandhar': { lat: 31.3260, lng: 75.5762 },
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'Salem': { lat: 11.6643, lng: 78.1460 },
  'Warangal': { lat: 17.9784, lng: 79.5941 },
  'Guntur': { lat: 16.3067, lng: 80.4365 },
  'Bhiwandi': { lat: 19.2813, lng: 73.0633 },
  'Saharanpur': { lat: 29.9680, lng: 77.5510 },
  'Gorakhpur': { lat: 26.7606, lng: 83.3732 },
  'Bikaner': { lat: 28.0229, lng: 73.3119 },
  'Amravati': { lat: 20.9320, lng: 77.7523 },
  'Noida': { lat: 28.5355, lng: 77.3910 },
  'Jamshedpur': { lat: 22.8046, lng: 86.2029 },
  'Bhilai': { lat: 21.2167, lng: 81.4333 },
  'Cuttack': { lat: 20.4625, lng: 85.8830 },
  'Firozabad': { lat: 27.1591, lng: 78.3957 },
  'Kochi': { lat: 9.9312, lng: 76.2673 },
  'Nellore': { lat: 14.4426, lng: 79.9865 },
  'Bhavnagar': { lat: 21.7645, lng: 72.1519 },
  'Dehradun': { lat: 30.3165, lng: 78.0322 },
  'Durgapur': { lat: 23.5204, lng: 87.3119 },
  'Asansol': { lat: 23.6739, lng: 86.9524 },
  'Nanded': { lat: 19.1383, lng: 77.3210 },
  'Kolhapur': { lat: 16.7050, lng: 74.2433 },
  'Ajmer': { lat: 26.4499, lng: 74.6399 },
  'Gulbarga': { lat: 17.3297, lng: 76.8343 },
  'Jamnagar': { lat: 22.4707, lng: 70.0577 },
  'Ujjain': { lat: 23.1765, lng: 75.7885 },
  'Loni': { lat: 28.7524, lng: 77.2917 },
  'Siliguri': { lat: 26.7271, lng: 88.3953 },
  'Jhansi': { lat: 25.4484, lng: 78.5685 },
  'Ulhasnagar': { lat: 19.2215, lng: 73.1645 },
  'Jammu': { lat: 32.7266, lng: 74.8570 },
  'Sangli': { lat: 16.8524, lng: 74.5815 },
  'Mangalore': { lat: 12.9141, lng: 74.8560 },
  'Erode': { lat: 11.3410, lng: 77.7172 },
  'Belgaum': { lat: 15.8497, lng: 74.4977 },
  'Ambattur': { lat: 13.1143, lng: 80.1548 },
  'Tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'Malegaon': { lat: 20.5579, lng: 74.5089 },
  'Gaya': { lat: 24.7914, lng: 85.0002 },
  'Jalgaon': { lat: 21.0077, lng: 75.5626 },
  'Udaipur': { lat: 24.5854, lng: 73.7125 },
  'Maheshtala': { lat: 22.5097, lng: 88.2519 },
  'Davanagere': { lat: 14.4644, lng: 75.9218 },
  'Kozhikode': { lat: 11.2588, lng: 75.7804 },
  'Akola': { lat: 20.7002, lng: 77.0082 },
  'Kurnool': { lat: 15.8281, lng: 78.0373 },
  'Bokaro': { lat: 23.6693, lng: 86.1511 },
  'Rajahmundry': { lat: 16.9891, lng: 81.7841 },
  'Ballari': { lat: 15.1394, lng: 76.9214 },
  'Agartala': { lat: 23.8315, lng: 91.2868 },
  'Bhagalpur': { lat: 25.2425, lng: 87.0169 },
  'Latur': { lat: 18.4088, lng: 76.5604 },
  'Dhule': { lat: 20.9042, lng: 74.7749 },
  'Rohtak': { lat: 28.8955, lng: 76.6066 },
  'Korba': { lat: 22.3595, lng: 82.7501 },
  'Bhilwara': { lat: 25.3407, lng: 74.6313 },
  'Brahmapur': { lat: 19.3150, lng: 84.7941 },
  'Muzaffarnagar': { lat: 29.4727, lng: 77.7085 },
  'Ahmednagar': { lat: 19.0948, lng: 74.7480 },
  'Mathura': { lat: 27.4924, lng: 77.6737 },
  'Kollam': { lat: 8.8932, lng: 76.6141 },
  'Avadi': { lat: 13.1067, lng: 80.1010 },
  'Kadapa': { lat: 14.4674, lng: 78.8241 },
  'Rajapur': { lat: 16.6500, lng: 73.5333 },
  'Anantapur': { lat: 14.6819, lng: 77.6006 },
  'Kamarhati': { lat: 22.6718, lng: 88.3740 },
  'Sambalpur': { lat: 21.4669, lng: 83.9756 },
  'Bilaspur': { lat: 22.0797, lng: 82.1391 },
  'Shahjahanpur': { lat: 27.8803, lng: 79.9108 },
  'Satara': { lat: 17.6805, lng: 74.0183 },
  'Bijapur': { lat: 16.8302, lng: 75.7100 },
  'Rampur': { lat: 28.8089, lng: 79.0250 },
  'Shivamogga': { lat: 13.9299, lng: 75.5681 },
  'Chandrapur': { lat: 19.9615, lng: 79.2961 },
  'Junagadh': { lat: 21.5222, lng: 70.4579 },
  'Thrissur': { lat: 10.5276, lng: 76.2144 },
  'Alwar': { lat: 27.5530, lng: 76.6346 },
  'Bardhaman': { lat: 23.2324, lng: 87.8615 },
  'Kulti': { lat: 23.7333, lng: 86.8500 },
  'Kakinada': { lat: 16.9891, lng: 82.2475 },
  'Nizamabad': { lat: 18.6725, lng: 78.0940 },
  'Parbhani': { lat: 19.2704, lng: 76.7747 },
  'Tumkur': { lat: 13.3409, lng: 77.1010 },
  'Hisar': { lat: 29.1492, lng: 75.7217 },
  'Ozhukarai': { lat: 11.9498, lng: 79.7714 },
  'Bihar Sharif': { lat: 25.1982, lng: 85.5204 },
  'Panipat': { lat: 29.3909, lng: 76.9635 },
  'Darbhanga': { lat: 26.1542, lng: 85.8918 },
  'Bally': { lat: 22.6500, lng: 88.3400 },
  'Aizawl': { lat: 23.7271, lng: 92.7176 },
  'Dewas': { lat: 22.9623, lng: 76.0508 },
  'Ichalkaranji': { lat: 16.6986, lng: 74.4621 },
  'Tiruppur': { lat: 11.1085, lng: 77.3411 },
  'Karnal': { lat: 29.6857, lng: 76.9905 },
  'Bathinda': { lat: 30.2070, lng: 74.9519 },
  'Jalna': { lat: 19.8347, lng: 75.8816 },
  'Eluru': { lat: 16.7107, lng: 81.0952 },
  'Barasat': { lat: 22.7236, lng: 88.4803 },
  'Kirari Suleman Nagar': { lat: 28.7676, lng: 77.0593 },
  'Purnia': { lat: 25.7771, lng: 87.4753 },
  'Satna': { lat: 24.6005, lng: 80.8322 },
  'Mau': { lat: 25.9419, lng: 83.5612 },
  'Sonipat': { lat: 28.9288, lng: 77.0913 },
  'Imphal': { lat: 24.8170, lng: 93.9368 },
};

// State coordinates for fallback when city is unknown
const stateCoordinates: Record<string, { lat: number; lng: number }> = {
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
  'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278 },
  'Assam': { lat: 26.2006, lng: 92.9376 },
  'Bihar': { lat: 25.0961, lng: 85.3131 },
  'Chhattisgarh': { lat: 21.2787, lng: 81.8661 },
  'Goa': { lat: 15.2993, lng: 74.1240 },
  'Gujarat': { lat: 22.2587, lng: 71.1924 },
  'Haryana': { lat: 29.0588, lng: 76.0856 },
  'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
  'Jharkhand': { lat: 23.6102, lng: 85.2799 },
  'Karnataka': { lat: 15.3173, lng: 75.7139 },
  'Kerala': { lat: 10.8505, lng: 76.2711 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
  'Maharashtra': { lat: 19.7515, lng: 75.7139 },
  'Manipur': { lat: 24.6637, lng: 93.9063 },
  'Meghalaya': { lat: 25.4670, lng: 91.3662 },
  'Mizoram': { lat: 23.1645, lng: 92.9376 },
  'Nagaland': { lat: 26.1584, lng: 94.5624 },
  'Odisha': { lat: 20.9517, lng: 85.0985 },
  'Punjab': { lat: 31.1471, lng: 75.3412 },
  'Rajasthan': { lat: 27.0238, lng: 74.2179 },
  'Sikkim': { lat: 27.5330, lng: 88.5122 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
  'Telangana': { lat: 18.1124, lng: 79.0193 },
  'Tripura': { lat: 23.9408, lng: 91.9882 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
  'Uttarakhand': { lat: 30.0668, lng: 79.0193 },
  'West Bengal': { lat: 22.9868, lng: 87.8550 },
  'Jammu and Kashmir': { lat: 33.7782, lng: 76.5762 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
};

// Parse CSV string into records
function parseCSV(csvText: string): AccidentRecord[] {
  const lines = csvText.trim().split('\n');
  const records: AccidentRecord[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);

    if (values.length >= 22) {
      records.push({
        stateName: values[0],
        cityName: values[1],
        year: parseInt(values[2]) || 0,
        month: values[3],
        dayOfWeek: values[4],
        timeOfDay: values[5],
        severity: values[6] as 'Minor' | 'Serious' | 'Fatal',
        vehiclesInvolved: parseInt(values[7]) || 0,
        vehicleType: values[8],
        casualties: parseInt(values[9]) || 0,
        fatalities: parseInt(values[10]) || 0,
        weatherConditions: values[11],
        roadType: values[12],
        roadCondition: values[13],
        lightingConditions: values[14],
        trafficControl: values[15],
        speedLimit: parseInt(values[16]) || 0,
        driverAge: parseInt(values[17]) || 0,
        driverGender: values[18],
        licenseStatus: values[19],
        alcoholInvolvement: values[20].toLowerCase() === 'yes',
        locationDetails: values[21],
      });
    }
  }

  return records;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

// Get coordinates for a location
function getCoordinates(city: string, state: string): { lat: number; lng: number } | null {
  // Try city first
  if (city && city !== 'Unknown' && cityCoordinates[city]) {
    // Add small random offset to avoid all points stacking
    const offset = () => (Math.random() - 0.5) * 0.1;
    return {
      lat: cityCoordinates[city].lat + offset(),
      lng: cityCoordinates[city].lng + offset(),
    };
  }

  // Fall back to state coordinates
  if (state && stateCoordinates[state]) {
    // Add larger random offset for state-level data
    const offset = () => (Math.random() - 0.5) * 0.5;
    return {
      lat: stateCoordinates[state].lat + offset(),
      lng: stateCoordinates[state].lng + offset(),
    };
  }

  return null;
}

// Aggregate records into hotspots
export function aggregateToHotspots(records: AccidentRecord[]): AccidentHotspot[] {
  const locationMap = new Map<string, {
    records: AccidentRecord[];
    coords: { lat: number; lng: number };
    city: string;
    state: string;
  }>();

  // Group by location
  for (const record of records) {
    const coords = getCoordinates(record.cityName, record.stateName);
    if (!coords) continue;

    const key = record.cityName !== 'Unknown' 
      ? `${record.cityName}-${record.stateName}` 
      : `${record.stateName}-${Math.round(coords.lat * 10)}-${Math.round(coords.lng * 10)}`;

    if (!locationMap.has(key)) {
      locationMap.set(key, {
        records: [],
        coords,
        city: record.cityName,
        state: record.stateName,
      });
    }
    locationMap.get(key)!.records.push(record);
  }

  // Convert to hotspots
  const hotspots: AccidentHotspot[] = [];
  let maxAccidents = 0;

  locationMap.forEach((data) => {
    if (data.records.length > maxAccidents) {
      maxAccidents = data.records.length;
    }
  });

  locationMap.forEach((data) => {
    const fatalCount = data.records.filter(r => r.severity === 'Fatal').length;
    const seriousCount = data.records.filter(r => r.severity === 'Serious').length;
    const minorCount = data.records.filter(r => r.severity === 'Minor').length;
    
    // Calculate weather breakdown
    const weatherBreakdown: Record<string, number> = {};
    const roadTypeBreakdown: Record<string, number> = {};
    
    data.records.forEach(r => {
      weatherBreakdown[r.weatherConditions] = (weatherBreakdown[r.weatherConditions] || 0) + 1;
      roadTypeBreakdown[r.roadType] = (roadTypeBreakdown[r.roadType] || 0) + 1;
    });
    
    // Calculate intensity based on count and severity
    const severityWeight = (fatalCount * 3 + seriousCount * 2 + data.records.length) / (data.records.length * 4);
    const countWeight = data.records.length / maxAccidents;
    const intensity = Math.min(1, (severityWeight * 0.6 + countWeight * 0.4));

    hotspots.push({
      lat: data.coords.lat,
      lng: data.coords.lng,
      intensity,
      city: data.city,
      state: data.state,
      totalAccidents: data.records.length,
      fatalAccidents: fatalCount,
      seriousAccidents: seriousCount,
      minorAccidents: minorCount,
      weatherBreakdown,
      roadTypeBreakdown,
      records: data.records,
    });
  });

  return hotspots;
}

// Store raw records for filtering
let cachedRecords: AccidentRecord[] = [];

// Fetch and parse accident data from CSV
export async function fetchAccidentData(): Promise<{ hotspots: AccidentHotspot[]; records: AccidentRecord[] }> {
  try {
    const response = await fetch('/data/accident_prediction_india.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch accident data');
    }
    
    const csvText = await response.text();
    cachedRecords = parseCSV(csvText);
    const hotspots = aggregateToHotspots(cachedRecords);
    return { hotspots, records: cachedRecords };
  } catch (error) {
    console.error('Error loading accident data:', error);
    return { hotspots: [], records: [] };
  }
}

// Filter records based on criteria
export interface FilterCriteria {
  severity: string[];
  weather: string[];
  roadType: string[];
}

export function filterRecords(records: AccidentRecord[], filters: FilterCriteria): AccidentRecord[] {
  return records.filter(record => {
    const severityMatch = filters.severity.length === 0 || filters.severity.includes(record.severity);
    const weatherMatch = filters.weather.length === 0 || filters.weather.includes(record.weatherConditions);
    const roadTypeMatch = filters.roadType.length === 0 || filters.roadType.includes(record.roadType);
    return severityMatch && weatherMatch && roadTypeMatch;
  });
}

// Get filtered hotspots
export function getFilteredHotspots(records: AccidentRecord[], filters: FilterCriteria): AccidentHotspot[] {
  const filteredRecords = filterRecords(records, filters);
  return aggregateToHotspots(filteredRecords);
}

// Get statistics from the data
export function getAccidentStatistics(hotspots: AccidentHotspot[]) {
  const totalAccidents = hotspots.reduce((sum, h) => sum + h.totalAccidents, 0);
  const totalFatal = hotspots.reduce((sum, h) => sum + h.fatalAccidents, 0);
  const totalSerious = hotspots.reduce((sum, h) => sum + h.seriousAccidents, 0);
  
  const topCities = [...hotspots]
    .filter(h => h.city !== 'Unknown')
    .sort((a, b) => b.totalAccidents - a.totalAccidents)
    .slice(0, 10);

  const topStates = [...hotspots]
    .reduce((acc, h) => {
      const existing = acc.find(s => s.state === h.state);
      if (existing) {
        existing.total += h.totalAccidents;
        existing.fatal += h.fatalAccidents;
      } else {
        acc.push({ state: h.state, total: h.totalAccidents, fatal: h.fatalAccidents });
      }
      return acc;
    }, [] as { state: string; total: number; fatal: number }[])
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return {
    totalAccidents,
    totalFatal,
    totalSerious,
    totalMinor: totalAccidents - totalFatal - totalSerious,
    topCities,
    topStates,
    locationCount: hotspots.length,
  };
}

// Calculate distance between two points in km (Haversine formula)
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find hotspots near a route
export function getHotspotsNearRoute(
  routeCoordinates: [number, number][],
  hotspots: AccidentHotspot[],
  radiusKm: number = 5
): AccidentHotspot[] {
  const nearbyHotspots: AccidentHotspot[] = [];
  const checkedHotspots = new Set<string>();

  for (const hotspot of hotspots) {
    const hotspotKey = `${hotspot.lat}-${hotspot.lng}`;
    if (checkedHotspots.has(hotspotKey)) continue;

    for (const [lat, lng] of routeCoordinates) {
      const distance = haversineDistance(lat, lng, hotspot.lat, hotspot.lng);
      if (distance <= radiusKm) {
        nearbyHotspots.push(hotspot);
        checkedHotspots.add(hotspotKey);
        break;
      }
    }
  }

  return nearbyHotspots;
}

// Calculate route risk score based on nearby hotspots
export function calculateRouteRiskScore(
  routeCoordinates: [number, number][],
  hotspots: AccidentHotspot[],
  radiusKm: number = 5
): { riskScore: number; nearbyHotspots: AccidentHotspot[]; riskFactors: string[] } {
  const nearbyHotspots = getHotspotsNearRoute(routeCoordinates, hotspots, radiusKm);
  
  if (nearbyHotspots.length === 0) {
    return { riskScore: 10, nearbyHotspots: [], riskFactors: ['No known accident hotspots nearby'] };
  }

  const riskFactors: string[] = [];
  
  // Calculate weighted risk based on hotspot severity and proximity
  let totalRisk = 0;
  let totalFatal = 0;
  let totalSerious = 0;
  let totalAccidents = 0;

  for (const hotspot of nearbyHotspots) {
    totalFatal += hotspot.fatalAccidents;
    totalSerious += hotspot.seriousAccidents;
    totalAccidents += hotspot.totalAccidents;
    
    // Weight: fatal = 10, serious = 5, minor = 1
    const hotspotRisk = 
      hotspot.fatalAccidents * 10 + 
      hotspot.seriousAccidents * 5 + 
      hotspot.minorAccidents * 1;
    totalRisk += hotspotRisk;
  }

  // Normalize risk score to 0-100
  const normalizedRisk = Math.min(95, Math.max(15, 
    20 + // Base risk for having nearby hotspots
    (totalFatal > 0 ? 25 : 0) + // Fatal accidents add 25
    (totalSerious > 5 ? 15 : totalSerious > 0 ? 8 : 0) + // Serious accidents
    Math.min(35, nearbyHotspots.length * 3) // Number of hotspots
  ));

  // Generate risk factors
  if (totalFatal > 0) {
    riskFactors.push(`${totalFatal} fatal accident(s) in nearby areas`);
  }
  if (totalSerious > 0) {
    riskFactors.push(`${totalSerious} serious accident(s) reported`);
  }
  if (nearbyHotspots.length > 5) {
    riskFactors.push(`${nearbyHotspots.length} accident-prone zones on route`);
  } else if (nearbyHotspots.length > 0) {
    riskFactors.push(`${nearbyHotspots.length} known hotspot(s) nearby`);
  }

  return { riskScore: Math.round(normalizedRisk), nearbyHotspots, riskFactors };
}
