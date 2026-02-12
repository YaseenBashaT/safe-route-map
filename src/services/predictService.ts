import { supabase } from '@/integrations/supabase/client';

export interface PredictionRequest {
  state_name?: string;
  city_name?: string;
  year?: number;
  month: string;
  day_of_week: string;
  time_of_day: string;
  num_vehicles?: number;
  vehicle_type?: string;
  num_casualties?: number;
  num_fatalities?: number;
  weather: string;
  road_type: string;
  road_condition?: string;
  lighting?: string;
  traffic_control?: string;
  speed_limit?: number;
  driver_age?: number;
  driver_gender?: string;
  license_status?: string;
  alcohol?: string;
  location_detail?: string;
}

export interface PredictionResponse {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export async function predictSeverity(payload: PredictionRequest): Promise<PredictionResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke('predict', {
      body: payload,
    });

    if (error) throw error;
    if (!data?.success) return null;

    return data.data as PredictionResponse;
  } catch (err) {
    console.error('Prediction error:', err);
    return null;
  }
}
