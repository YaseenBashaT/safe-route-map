import { mongodbService } from '@/services/mongodbService';

export interface AccidentReport {
  _id?: string;
  userId?: string;
  userEmail?: string;
  latitude: number;
  longitude: number;
  location: string;
  description: string;
  severity: 'minor' | 'serious' | 'fatal';
  accidentType: string;
  weather?: string;
  roadType?: string;
  reportedAt: string;
  verified: boolean;
  createdAt?: string;
}

export const accidentReportService = {
  async reportAccident(report: Omit<AccidentReport, '_id' | 'createdAt' | 'verified'>) {
    return mongodbService.insertOne('accident_reports', {
      ...report,
      verified: false,
    });
  },

  async getRecentReports(limit = 100) {
    return mongodbService.find<AccidentReport[]>('accident_reports', {}, {
      limit,
      sort: { createdAt: -1 },
    });
  },

  async getReportsNearLocation(lat: number, lng: number, radiusKm = 5) {
    // Get all reports and filter by distance (MongoDB geo queries need special setup)
    const result = await mongodbService.find<AccidentReport[]>('accident_reports', {}, {
      limit: 500,
      sort: { createdAt: -1 },
    });

    if (!result.success || !result.data) return result;

    // Filter by distance
    const filtered = result.data.filter((report: AccidentReport) => {
      const distance = getDistanceKm(lat, lng, report.latitude, report.longitude);
      return distance <= radiusKm;
    });

    return { success: true, data: filtered };
  },

  async getReportsInBounds(minLat: number, maxLat: number, minLng: number, maxLng: number) {
    const result = await mongodbService.find<AccidentReport[]>('accident_reports', {
      latitude: { $gte: minLat, $lte: maxLat },
      longitude: { $gte: minLng, $lte: maxLng },
    }, {
      limit: 500,
      sort: { createdAt: -1 },
    });

    return result;
  },

  async getLocationFrequency() {
    // Aggregate reports to count frequency by location
    return mongodbService.aggregate<{ _id: string; count: number; avgLat: number; avgLng: number }[]>(
      'accident_reports',
      [
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 },
            avgLat: { $avg: '$latitude' },
            avgLng: { $avg: '$longitude' },
            latestReport: { $max: '$reportedAt' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 100 },
      ]
    );
  },

  async getUserReports(userId: string) {
    return mongodbService.find<AccidentReport[]>('accident_reports', { userId }, {
      sort: { createdAt: -1 },
    });
  },
};

// Helper function to calculate distance between two points
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Check if a point is near a route (within a certain distance)
export function isAccidentNearRoute(
  accident: { latitude: number; longitude: number },
  routeCoords: [number, number][],
  thresholdKm = 0.5
): boolean {
  for (const [lat, lng] of routeCoords) {
    const distance = getDistanceKm(accident.latitude, accident.longitude, lat, lng);
    if (distance <= thresholdKm) {
      return true;
    }
  }
  return false;
}
