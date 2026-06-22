export interface TelemetryPoint {
  timestamp: string;
  soc: number;
  soh: number;
  temperature: number;
  voltage: number;
  current: number;
  cycle_count: number;
}

export interface EVAsset {
  id: string;
  type: string;
  status: 'Active' | 'Charging' | 'Maintenance' | string;
  battery_capacity_kwh: number;
  current_soc: number;
  current_soh: number;
  cycle_count: number;
  temperature_c: number;
  voltage_v: number;
  current_a: number;
  has_thermal_anomaly: boolean;
  next_maintenance_date: string | null;
  rul_days: number;
  health_score: number;
  telemetry_history?: TelemetryPoint[];
}

export interface ICEVehicle {
  id: string;
  type: string;
  daily_km: number;
  payload_tons: number;
  dwell_time_hours: number;
  route_type: string;
  fuel_efficiency_km_l: number;
  annual_utilization_km: number;
  emission_factor_g_co2_km: number;
  readiness_score: number;
  recommended_ev: string;
  tco_delta: number;
  co2_saved: number;
}

export interface Supplier {
  id: string;
  name: string;
  tier: number;
  material: string;
  location: string;
  risk_score: number;
  geopolitical_risk: number;
  concentration_risk: number;
  quality_deviation: number;
  status: 'Active' | 'Flagged' | 'Critical' | string;
}

export interface SupplierFlow {
  source_id: string;
  target_id: string;
  material: string;
  volume_tpa: number;
}

export interface SupplyChainGraph {
  nodes: Supplier[];
  edges: SupplierFlow[];
}

export interface CarbonMetrics {
  current_ev_count: number;
  target_ev_count: number;
  progress_percent: number;
  scope_1_saved_tonnes: number;
  scope_3_added_tonnes: number;
  net_co2_saved_tonnes: number;
  top_candidates: Array<{
    id: string;
    type: string;
    co2_saved: number;
    tco_delta: number;
    readiness_score: number;
  }>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}
