export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

// Comprehensive Indian cities database with aliases
const indianCities: { name: string; aliases: string[]; lat: string; lon: string; state: string }[] = [
  { name: 'Delhi', aliases: ['new delhi', 'dilli'], lat: '28.6139', lon: '77.2090', state: 'Delhi' },
  { name: 'Mumbai', aliases: ['bombay'], lat: '19.0760', lon: '72.8777', state: 'Maharashtra' },
  { name: 'Bangalore', aliases: ['bengaluru', 'blr'], lat: '12.9716', lon: '77.5946', state: 'Karnataka' },
  { name: 'Chennai', aliases: ['madras'], lat: '13.0827', lon: '80.2707', state: 'Tamil Nadu' },
  { name: 'Kolkata', aliases: ['calcutta'], lat: '22.5726', lon: '88.3639', state: 'West Bengal' },
  { name: 'Hyderabad', aliases: ['hyd'], lat: '17.3850', lon: '78.4867', state: 'Telangana' },
  { name: 'Pune', aliases: ['poona'], lat: '18.5204', lon: '73.8567', state: 'Maharashtra' },
  { name: 'Ahmedabad', aliases: ['amdavad'], lat: '23.0225', lon: '72.5714', state: 'Gujarat' },
  { name: 'Jaipur', aliases: ['pink city'], lat: '26.9124', lon: '75.7873', state: 'Rajasthan' },
  { name: 'Lucknow', aliases: [], lat: '26.8467', lon: '80.9462', state: 'Uttar Pradesh' },
  { name: 'Kanpur', aliases: ['cawnpore'], lat: '26.4499', lon: '80.3319', state: 'Uttar Pradesh' },
  { name: 'Nagpur', aliases: [], lat: '21.1458', lon: '79.0882', state: 'Maharashtra' },
  { name: 'Visakhapatnam', aliases: ['vizag', 'vizagapatnam'], lat: '17.6868', lon: '83.2185', state: 'Andhra Pradesh' },
  { name: 'Bhopal', aliases: [], lat: '23.2599', lon: '77.4126', state: 'Madhya Pradesh' },
  { name: 'Patna', aliases: [], lat: '25.5941', lon: '85.1376', state: 'Bihar' },
  { name: 'Indore', aliases: [], lat: '22.7196', lon: '75.8577', state: 'Madhya Pradesh' },
  { name: 'Vadodara', aliases: ['baroda'], lat: '22.3072', lon: '73.1812', state: 'Gujarat' },
  { name: 'Surat', aliases: [], lat: '21.1702', lon: '72.8311', state: 'Gujarat' },
  { name: 'Coimbatore', aliases: ['kovai'], lat: '11.0168', lon: '76.9558', state: 'Tamil Nadu' },
  { name: 'Kochi', aliases: ['cochin', 'ernakulam'], lat: '9.9312', lon: '76.2673', state: 'Kerala' },
  { name: 'Vijayawada', aliases: ['bezwada'], lat: '16.5062', lon: '80.6480', state: 'Andhra Pradesh' },
  { name: 'Madurai', aliases: [], lat: '9.9252', lon: '78.1198', state: 'Tamil Nadu' },
  { name: 'Varanasi', aliases: ['banaras', 'kashi'], lat: '25.3176', lon: '82.9739', state: 'Uttar Pradesh' },
  { name: 'Agra', aliases: [], lat: '27.1767', lon: '78.0081', state: 'Uttar Pradesh' },
  { name: 'Chandigarh', aliases: [], lat: '30.7333', lon: '76.7794', state: 'Punjab' },
  { name: 'Guwahati', aliases: ['gauhati'], lat: '26.1445', lon: '91.7362', state: 'Assam' },
  { name: 'Thiruvananthapuram', aliases: ['trivandrum', 'tvm'], lat: '8.5241', lon: '76.9366', state: 'Kerala' },
  { name: 'Jodhpur', aliases: ['blue city'], lat: '26.2389', lon: '73.0243', state: 'Rajasthan' },
  { name: 'Udaipur', aliases: ['city of lakes'], lat: '24.5854', lon: '73.7125', state: 'Rajasthan' },
  { name: 'Amritsar', aliases: [], lat: '31.6340', lon: '74.8723', state: 'Punjab' },
  { name: 'Ranchi', aliases: [], lat: '23.3441', lon: '85.3096', state: 'Jharkhand' },
  { name: 'Gwalior', aliases: [], lat: '26.2183', lon: '78.1828', state: 'Madhya Pradesh' },
  { name: 'Jabalpur', aliases: [], lat: '23.1815', lon: '79.9864', state: 'Madhya Pradesh' },
  { name: 'Mysore', aliases: ['mysuru'], lat: '12.2958', lon: '76.6394', state: 'Karnataka' },
  { name: 'Mangalore', aliases: ['mangaluru'], lat: '12.9141', lon: '74.8560', state: 'Karnataka' },
  { name: 'Hubli', aliases: ['hubballi'], lat: '15.3647', lon: '75.1240', state: 'Karnataka' },
  { name: 'Belgaum', aliases: ['belagavi'], lat: '15.8497', lon: '74.4977', state: 'Karnataka' },
  { name: 'Tirupati', aliases: [], lat: '13.6288', lon: '79.4192', state: 'Andhra Pradesh' },
  { name: 'Guntur', aliases: [], lat: '16.3067', lon: '80.4365', state: 'Andhra Pradesh' },
  { name: 'Nellore', aliases: [], lat: '14.4426', lon: '79.9865', state: 'Andhra Pradesh' },
  { name: 'Warangal', aliases: [], lat: '17.9784', lon: '79.5941', state: 'Telangana' },
  { name: 'Karimnagar', aliases: [], lat: '18.4386', lon: '79.1288', state: 'Telangana' },
  { name: 'Nizamabad', aliases: [], lat: '18.6725', lon: '78.0940', state: 'Telangana' },
  { name: 'Rajahmundry', aliases: ['rajamahendravaram'], lat: '16.9891', lon: '81.7841', state: 'Andhra Pradesh' },
  { name: 'Kakinada', aliases: [], lat: '16.9891', lon: '82.2475', state: 'Andhra Pradesh' },
  { name: 'Tiruppur', aliases: ['tirupur'], lat: '11.1085', lon: '77.3411', state: 'Tamil Nadu' },
  { name: 'Salem', aliases: [], lat: '11.6643', lon: '78.1460', state: 'Tamil Nadu' },
  { name: 'Tiruchirappalli', aliases: ['trichy'], lat: '10.7905', lon: '78.7047', state: 'Tamil Nadu' },
  { name: 'Vellore', aliases: [], lat: '12.9165', lon: '79.1325', state: 'Tamil Nadu' },
  { name: 'Thane', aliases: [], lat: '19.2183', lon: '72.9781', state: 'Maharashtra' },
  { name: 'Nashik', aliases: ['nasik'], lat: '19.9975', lon: '73.7898', state: 'Maharashtra' },
  { name: 'Aurangabad', aliases: [], lat: '19.8762', lon: '75.3433', state: 'Maharashtra' },
  { name: 'Solapur', aliases: ['sholapur'], lat: '17.6599', lon: '75.9064', state: 'Maharashtra' },
  { name: 'Kolhapur', aliases: [], lat: '16.7050', lon: '74.2433', state: 'Maharashtra' },
  { name: 'Rajkot', aliases: [], lat: '22.3039', lon: '70.8022', state: 'Gujarat' },
  { name: 'Bhavnagar', aliases: [], lat: '21.7645', lon: '72.1519', state: 'Gujarat' },
  { name: 'Jamnagar', aliases: [], lat: '22.4707', lon: '70.0577', state: 'Gujarat' },
  { name: 'Gandhinagar', aliases: [], lat: '23.2156', lon: '72.6369', state: 'Gujarat' },
  { name: 'Dehradun', aliases: [], lat: '30.3165', lon: '78.0322', state: 'Uttarakhand' },
  { name: 'Haridwar', aliases: ['hardwar'], lat: '29.9457', lon: '78.1642', state: 'Uttarakhand' },
  { name: 'Rishikesh', aliases: [], lat: '30.0869', lon: '78.2676', state: 'Uttarakhand' },
  { name: 'Shimla', aliases: ['simla'], lat: '31.1048', lon: '77.1734', state: 'Himachal Pradesh' },
  { name: 'Jammu', aliases: [], lat: '32.7266', lon: '74.8570', state: 'Jammu and Kashmir' },
  { name: 'Srinagar', aliases: [], lat: '34.0837', lon: '74.7973', state: 'Jammu and Kashmir' },
  { name: 'Bhubaneswar', aliases: [], lat: '20.2961', lon: '85.8245', state: 'Odisha' },
  { name: 'Cuttack', aliases: [], lat: '20.4625', lon: '85.8830', state: 'Odisha' },
  { name: 'Puri', aliases: [], lat: '19.8135', lon: '85.8312', state: 'Odisha' },
  { name: 'Raipur', aliases: [], lat: '21.2514', lon: '81.6296', state: 'Chhattisgarh' },
  { name: 'Bilaspur', aliases: [], lat: '22.0797', lon: '82.1391', state: 'Chhattisgarh' },
  { name: 'Goa', aliases: ['panaji', 'panjim'], lat: '15.4909', lon: '73.8278', state: 'Goa' },
  { name: 'Imphal', aliases: [], lat: '24.8170', lon: '93.9368', state: 'Manipur' },
  { name: 'Shillong', aliases: [], lat: '25.5788', lon: '91.8933', state: 'Meghalaya' },
  { name: 'Aizawl', aliases: [], lat: '23.7271', lon: '92.7176', state: 'Mizoram' },
  { name: 'Kohima', aliases: [], lat: '25.6751', lon: '94.1086', state: 'Nagaland' },
  { name: 'Gangtok', aliases: [], lat: '27.3389', lon: '88.6065', state: 'Sikkim' },
  { name: 'Agartala', aliases: [], lat: '23.8315', lon: '91.2868', state: 'Tripura' },
  { name: 'Itanagar', aliases: [], lat: '27.0844', lon: '93.6053', state: 'Arunachal Pradesh' },
  { name: 'Rayachoti', aliases: ['rayachoty'], lat: '14.0555', lon: '78.7510', state: 'Andhra Pradesh' },
  { name: 'Kadapa', aliases: ['cuddapah'], lat: '14.4674', lon: '78.8241', state: 'Andhra Pradesh' },
  { name: 'Anantapur', aliases: [], lat: '14.6819', lon: '77.6006', state: 'Andhra Pradesh' },
  { name: 'Kurnool', aliases: [], lat: '15.8281', lon: '78.0373', state: 'Andhra Pradesh' },
  { name: 'Ongole', aliases: [], lat: '15.5057', lon: '80.0499', state: 'Andhra Pradesh' },
  { name: 'Tenali', aliases: [], lat: '16.2428', lon: '80.6400', state: 'Andhra Pradesh' },
  { name: 'Eluru', aliases: [], lat: '16.7107', lon: '81.0952', state: 'Andhra Pradesh' },
  { name: 'Machilipatnam', aliases: ['masulipatnam', 'bandar'], lat: '16.1875', lon: '81.1389', state: 'Andhra Pradesh' },
  { name: 'Proddatur', aliases: [], lat: '14.7502', lon: '78.5481', state: 'Andhra Pradesh' },
  { name: 'Chittoor', aliases: [], lat: '13.2172', lon: '79.1003', state: 'Andhra Pradesh' },
  { name: 'Hindupur', aliases: [], lat: '13.8299', lon: '77.4910', state: 'Andhra Pradesh' },
  { name: 'Noida', aliases: [], lat: '28.5355', lon: '77.3910', state: 'Uttar Pradesh' },
  { name: 'Gurgaon', aliases: ['gurugram'], lat: '28.4595', lon: '77.0266', state: 'Haryana' },
  { name: 'Faridabad', aliases: [], lat: '28.4089', lon: '77.3178', state: 'Haryana' },
  { name: 'Ghaziabad', aliases: [], lat: '28.6692', lon: '77.4538', state: 'Uttar Pradesh' },
  { name: 'Meerut', aliases: [], lat: '28.9845', lon: '77.7064', state: 'Uttar Pradesh' },
  { name: 'Allahabad', aliases: ['prayagraj'], lat: '25.4358', lon: '81.8463', state: 'Uttar Pradesh' },
  { name: 'Gorakhpur', aliases: [], lat: '26.7606', lon: '83.3732', state: 'Uttar Pradesh' },
  { name: 'Aligarh', aliases: [], lat: '27.8974', lon: '78.0880', state: 'Uttar Pradesh' },
  { name: 'Bareilly', aliases: [], lat: '28.3670', lon: '79.4304', state: 'Uttar Pradesh' },
  { name: 'Moradabad', aliases: [], lat: '28.8389', lon: '78.7768', state: 'Uttar Pradesh' },
  { name: 'Saharanpur', aliases: [], lat: '29.9680', lon: '77.5510', state: 'Uttar Pradesh' },
  { name: 'Mathura', aliases: [], lat: '27.4924', lon: '77.6737', state: 'Uttar Pradesh' },
  { name: 'Firozabad', aliases: [], lat: '27.1591', lon: '78.3957', state: 'Uttar Pradesh' },
  { name: 'Jhansi', aliases: [], lat: '25.4484', lon: '78.5685', state: 'Uttar Pradesh' },
  { name: 'Muzaffarnagar', aliases: [], lat: '29.4727', lon: '77.7085', state: 'Uttar Pradesh' },
  { name: 'Durgapur', aliases: [], lat: '23.5204', lon: '87.3119', state: 'West Bengal' },
  { name: 'Siliguri', aliases: [], lat: '26.7271', lon: '88.3953', state: 'West Bengal' },
  { name: 'Asansol', aliases: [], lat: '23.6739', lon: '86.9524', state: 'West Bengal' },
  { name: 'Howrah', aliases: [], lat: '22.5958', lon: '88.2636', state: 'West Bengal' },
  { name: 'Darjeeling', aliases: [], lat: '27.0360', lon: '88.2627', state: 'West Bengal' },
  { name: 'Jamshedpur', aliases: ['tatanagar'], lat: '22.8046', lon: '86.2029', state: 'Jharkhand' },
  { name: 'Dhanbad', aliases: [], lat: '23.7957', lon: '86.4304', state: 'Jharkhand' },
  { name: 'Bokaro', aliases: [], lat: '23.6693', lon: '86.1511', state: 'Jharkhand' },
  { name: 'Gaya', aliases: [], lat: '24.7914', lon: '85.0002', state: 'Bihar' },
  { name: 'Muzaffarpur', aliases: [], lat: '26.1225', lon: '85.3906', state: 'Bihar' },
  { name: 'Bhagalpur', aliases: [], lat: '25.2425', lon: '87.0169', state: 'Bihar' },
  { name: 'Ludhiana', aliases: [], lat: '30.9010', lon: '75.8573', state: 'Punjab' },
  { name: 'Jalandhar', aliases: [], lat: '31.3260', lon: '75.5762', state: 'Punjab' },
  { name: 'Patiala', aliases: [], lat: '30.3398', lon: '76.3869', state: 'Punjab' },
  { name: 'Bathinda', aliases: ['bhatinda'], lat: '30.2070', lon: '74.9519', state: 'Punjab' },
  { name: 'Kota', aliases: [], lat: '25.2138', lon: '75.8648', state: 'Rajasthan' },
  { name: 'Bikaner', aliases: [], lat: '28.0229', lon: '73.3119', state: 'Rajasthan' },
  { name: 'Ajmer', aliases: [], lat: '26.4499', lon: '74.6399', state: 'Rajasthan' },
  { name: 'Alwar', aliases: [], lat: '27.5530', lon: '76.6346', state: 'Rajasthan' },
  { name: 'Bhilwara', aliases: [], lat: '25.3407', lon: '74.6313', state: 'Rajasthan' },
  { name: 'Ujjain', aliases: [], lat: '23.1765', lon: '75.7885', state: 'Madhya Pradesh' },
  { name: 'Rewa', aliases: [], lat: '24.5362', lon: '81.3037', state: 'Madhya Pradesh' },
  { name: 'Satna', aliases: [], lat: '24.6005', lon: '80.8322', state: 'Madhya Pradesh' },
  { name: 'Sagar', aliases: [], lat: '23.8388', lon: '78.7378', state: 'Madhya Pradesh' },
];

// Simple fuzzy matching - checks if query matches start of word or contains query
const fuzzyMatch = (text: string, query: string): number => {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  
  // Exact match
  if (t === q) return 100;
  // Starts with
  if (t.startsWith(q)) return 90 + (q.length / t.length) * 10;
  // Word starts with
  const words = t.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(q)) return 70 + (q.length / word.length) * 10;
  }
  // Contains
  if (t.includes(q)) return 50 + (q.length / t.length) * 20;
  
  return 0;
};

// Search local city database
const searchLocalCities = (query: string): NominatimResult[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const matches: { city: typeof indianCities[0]; score: number }[] = [];

  for (const city of indianCities) {
    // Check main name
    let bestScore = fuzzyMatch(city.name, normalizedQuery);
    
    // Check aliases
    for (const alias of city.aliases) {
      const aliasScore = fuzzyMatch(alias, normalizedQuery);
      if (aliasScore > bestScore) bestScore = aliasScore;
    }
    
    // Check state
    const stateScore = fuzzyMatch(city.state, normalizedQuery);
    if (stateScore > 0 && stateScore > bestScore * 0.7) {
      bestScore = Math.max(bestScore, stateScore * 0.5);
    }

    if (bestScore > 30) {
      matches.push({ city, score: bestScore });
    }
  }

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ city }, index) => ({
      place_id: index + 1000,
      display_name: `${city.name}, ${city.state}, India`,
      lat: city.lat,
      lon: city.lon,
      type: 'city',
      importance: 1,
    }));
};

export const searchLocations = async (query: string): Promise<NominatimResult[]> => {
  if (!query || query.length < 1) return [];

  const normalizedQuery = query.toLowerCase().trim();
  
  // Get local matches immediately
  const localMatches = searchLocalCities(normalizedQuery);
  
  // For very short queries, just return local matches
  if (query.length < 3) {
    return localMatches;
  }

  // For longer queries, also search Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' India')}&limit=5&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AccidentHeatmapApp/1.0',
      },
    });

    if (!response.ok) {
      return localMatches;
    }

    const apiResults = await response.json();
    
    // Combine results, prioritizing local matches
    const combined = [...localMatches];
    const seenCoords = new Set(localMatches.map(r => `${parseFloat(r.lat).toFixed(2)},${parseFloat(r.lon).toFixed(2)}`));
    
    for (const result of apiResults) {
      const coordKey = `${parseFloat(result.lat).toFixed(2)},${parseFloat(result.lon).toFixed(2)}`;
      if (!seenCoords.has(coordKey)) {
        seenCoords.add(coordKey);
        combined.push(result);
      }
    }
    
    return combined.slice(0, 8);
  } catch (error) {
    console.error('Geocoding error:', error);
    return localMatches;
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AccidentHeatmapApp/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }

  const data = await response.json();
  return data.display_name || `${lat}, ${lng}`;
};
