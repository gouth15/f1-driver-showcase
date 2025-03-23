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
  // Other properties as needed
}
