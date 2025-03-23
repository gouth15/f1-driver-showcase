
export interface RaceControlMessage {
  category?: string;
  date: string;
  flag?: string;
  message: string;
  // Other properties as needed
}

export interface DriverPosition {
  date: string;
  driver_number: number;
  position: number;
  // Other properties as needed
}

export interface Driver {
  driver_number: number;
  name_acronym: string;
  full_name: string;
  first_name: string;
  last_name: string;
  country_code?: string;
  team_name: string;
  team_colour: string;
  headshot_url: string;
  broadcast_name: string;
  meeting_key?: number;
  session_key?: number;
  // Other properties as needed
}

export interface LapData {
  date_start: string;
  driver_number: number;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
  i1_speed?: number;
  i2_speed?: number;
  is_pit_out_lap: boolean;
  lap_duration: number;
  lap_number: number;
  meeting_key: number;
  segments_sector_1?: number[];
  segments_sector_2?: number[];
  segments_sector_3?: number[];
  session_key: number;
  st_speed?: number;
}

// Demo data interfaces for simulation
export interface DemoState {
  drivers: Driver[];
  positions: DriverPosition[];
  lapData: Record<number, LapData>;
  messages: RaceControlMessage[];
}
