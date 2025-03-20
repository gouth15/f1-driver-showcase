
export interface Driver {
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string;
  team_name: string;
}

export interface Session {
  session_key: number;
  meeting_key: number;
  name: string;
  status: string;
  session_type: string;
}

export interface Timing {
  driver_number: number;
  lap_number: number;
  lap_time: number;
  position: number;
  sectors: {
    sector1: number;
    sector2: number;
    sector3: number;
  };
}
