/** Mirrors the FastAPI Pydantic models in `api.py`. */

export type Severity = "lethal" | "danger" | "caution" | "safe";

export interface Fuel {
  name: string;
  formula: string;
  cas: string;
  lhv_kj_kg: number;
  flame_temperature_k: number;
  liquid_density_kg_m3: number | null;
  vapor_density_kg_m3: number;
  vapor_relative_to_air: number;
  emissivity: number;
  nist_webbook_url: string;
}

export interface SeverityBand {
  threshold: number;
  severity: Severity;
}

export interface SeverityBands {
  blast: SeverityBand[];
  thermal: SeverityBand[];
}

export interface StrengthClass {
  class_: number;
  amplitude_factor: number;
  description: string;
}

export interface ZoneRequest {
  fuel: string;
  volume_m3: number;
  source_lat: number;
  source_lon: number;
  bbox_half_extent_deg?: number;
  wind_speed_m_s?: number;
  wind_from_direction_deg?: number;
  resolution_m?: number;
  combustion_efficiency?: number;
  burn_duration_s?: number;
  tank_diameter_m?: number | null;
  tank_height_m?: number | null;
  transmissivity?: number;
  strength_class?: number;
}

export interface ZoneRecord {
  lat: number;
  lon: number;
  severity: Severity;
  blast_pa: number;
  thermal_kw_m2: number;
  distance_m: number;
}

export interface ZoneBbox {
  min_lat: number;
  min_lon: number;
  max_lat: number;
  max_lon: number;
}

export interface ZoneResponse {
  records: ZoneRecord[];
  source_label: string;
  bbox: ZoneBbox;
  wind: { speed_m_s: number; from_direction_deg: number };
  fuel: string;
  volume_m3: number;
  strength_class: number;
  n_records: number;
  band_distances: Partial<Record<Severity, number>>;
}

export interface MultiTankRequest {
  tanks: ZoneRequest[];
  bbox_half_extent_deg?: number;
  wind_speed_m_s?: number;
  wind_from_direction_deg?: number;
  resolution_m?: number;
  combustion_efficiency?: number;
  burn_duration_s?: number;
  transmissivity?: number;
  strength_class?: number;
}
