export type RegionName =
  | 'North Slave (Yellowknife)'
  | 'Mackenzie Delta & Arctic Coast'
  | 'Nahanni & Dehcho Mountains'
  | 'Sahtu & Mackenzie Valley'
  | 'South Slave & Wood Buffalo'
  | 'Barren-Ground Tundra Shield';

export type ObservationMethod =
  | 'Collar GPS Telemetry'
  | 'Field Camera Trap'
  | 'Aerial Wildlife Survey'
  | 'Community & Elders Report'
  | 'Wildlife Officer Patrol';

export interface WolfSighting {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  time: string; // e.g., "14:20 MST"
  latitude: number;
  longitude: number;
  locationName: string;
  region: RegionName;
  packSize: number;
  packName: string;
  packStatus: 'Active Pack' | 'Breeding Pair' | 'Solitary Lone Wolf' | 'Dispersal Group';
  observationMethod: ObservationMethod;
  colorVariants: string[];
  preyProximity: string;
  weatherCondition: string;
  behavior: string;
  notes: string;
  telemetryTrackId?: string;
  pupCount?: number;
  collaredWolfId?: string;
  temperatureCelsius?: number;
}

export interface TelemetryPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  packName: string;
}

export interface TelemetryTrack {
  id: string;
  packName: string;
  color: string;
  points: TelemetryPoint[];
  description: string;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  minPackSize: number;
  maxPackSize: number;
  selectedPacks: string[];
  selectedRegions: RegionName[];
  selectedMethods: ObservationMethod[];
  searchQuery: string;
  hasCollaredOnly: boolean;
  hasPupsOnly: boolean;
}

export interface RegionHotspot {
  name: RegionName;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  description: string;
}
