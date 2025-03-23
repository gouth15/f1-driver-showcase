
import { Driver, DriverPosition, LapData, RaceControlMessage, DemoState } from "@/types/f1";

// Mock Drivers
const mockDrivers: Driver[] = [
  {
    driver_number: 1,
    name_acronym: "VER",
    full_name: "Max Verstappen",
    first_name: "Max",
    last_name: "Verstappen",
    country_code: "NL",
    team_name: "Red Bull Racing",
    team_colour: "0600EF",
    headshot_url: "/placeholder.svg",
    broadcast_name: "M. VERSTAPPEN"
  },
  {
    driver_number: 11,
    name_acronym: "PER",
    full_name: "Sergio Perez",
    first_name: "Sergio",
    last_name: "Perez",
    country_code: "MX",
    team_name: "Red Bull Racing",
    team_colour: "0600EF",
    headshot_url: "/placeholder.svg",
    broadcast_name: "S. PEREZ"
  },
  {
    driver_number: 44,
    name_acronym: "HAM",
    full_name: "Lewis Hamilton",
    first_name: "Lewis",
    last_name: "Hamilton",
    country_code: "GB",
    team_name: "Mercedes",
    team_colour: "00D2BE",
    headshot_url: "/placeholder.svg",
    broadcast_name: "L. HAMILTON"
  },
  {
    driver_number: 63,
    name_acronym: "RUS",
    full_name: "George Russell",
    first_name: "George",
    last_name: "Russell",
    country_code: "GB",
    team_name: "Mercedes",
    team_colour: "00D2BE",
    headshot_url: "/placeholder.svg",
    broadcast_name: "G. RUSSELL"
  },
  {
    driver_number: 16,
    name_acronym: "LEC",
    full_name: "Charles Leclerc",
    first_name: "Charles",
    last_name: "Leclerc",
    country_code: "MC",
    team_name: "Ferrari",
    team_colour: "DC0000",
    headshot_url: "/placeholder.svg",
    broadcast_name: "C. LECLERC"
  },
  {
    driver_number: 55,
    name_acronym: "SAI",
    full_name: "Carlos Sainz",
    first_name: "Carlos",
    last_name: "Sainz",
    country_code: "ES",
    team_name: "Ferrari",
    team_colour: "DC0000",
    headshot_url: "/placeholder.svg",
    broadcast_name: "C. SAINZ"
  },
  {
    driver_number: 4,
    name_acronym: "NOR",
    full_name: "Lando Norris",
    first_name: "Lando",
    last_name: "Norris",
    country_code: "GB",
    team_name: "McLaren",
    team_colour: "FF8700",
    headshot_url: "/placeholder.svg",
    broadcast_name: "L. NORRIS"
  },
  {
    driver_number: 81,
    name_acronym: "PIA",
    full_name: "Oscar Piastri",
    first_name: "Oscar",
    last_name: "Piastri",
    country_code: "AU",
    team_name: "McLaren",
    team_colour: "FF8700",
    headshot_url: "/placeholder.svg",
    broadcast_name: "O. PIASTRI"
  },
  {
    driver_number: 14,
    name_acronym: "ALO",
    full_name: "Fernando Alonso",
    first_name: "Fernando",
    last_name: "Alonso",
    country_code: "ES",
    team_name: "Aston Martin",
    team_colour: "006F62",
    headshot_url: "/placeholder.svg",
    broadcast_name: "F. ALONSO"
  },
  {
    driver_number: 18,
    name_acronym: "STR",
    full_name: "Lance Stroll",
    first_name: "Lance",
    last_name: "Stroll",
    country_code: "CA",
    team_name: "Aston Martin",
    team_colour: "006F62",
    headshot_url: "/placeholder.svg",
    broadcast_name: "L. STROLL"
  },
  {
    driver_number: 31,
    name_acronym: "OCO",
    full_name: "Esteban Ocon",
    first_name: "Esteban",
    last_name: "Ocon",
    country_code: "FR",
    team_name: "Alpine",
    team_colour: "0090FF",
    headshot_url: "/placeholder.svg",
    broadcast_name: "E. OCON"
  },
  {
    driver_number: 10,
    name_acronym: "GAS",
    full_name: "Pierre Gasly",
    first_name: "Pierre",
    last_name: "Gasly",
    country_code: "FR",
    team_name: "Alpine",
    team_colour: "0090FF",
    headshot_url: "/placeholder.svg",
    broadcast_name: "P. GASLY"
  },
  {
    driver_number: 23,
    name_acronym: "ALB",
    full_name: "Alexander Albon",
    first_name: "Alexander",
    last_name: "Albon",
    country_code: "TH",
    team_name: "Williams",
    team_colour: "005AFF",
    headshot_url: "/placeholder.svg",
    broadcast_name: "A. ALBON"
  },
  {
    driver_number: 2,
    name_acronym: "SAR",
    full_name: "Logan Sargeant",
    first_name: "Logan",
    last_name: "Sargeant",
    country_code: "US",
    team_name: "Williams",
    team_colour: "005AFF",
    headshot_url: "/placeholder.svg",
    broadcast_name: "L. SARGEANT"
  },
  {
    driver_number: 77,
    name_acronym: "BOT",
    full_name: "Valtteri Bottas",
    first_name: "Valtteri",
    last_name: "Bottas",
    country_code: "FI",
    team_name: "Sauber",
    team_colour: "900000",
    headshot_url: "/placeholder.svg",
    broadcast_name: "V. BOTTAS"
  },
  {
    driver_number: 27,
    name_acronym: "HUL",
    full_name: "Nico Hulkenberg",
    first_name: "Nico",
    last_name: "Hulkenberg",
    country_code: "DE",
    team_name: "Haas F1 Team",
    team_colour: "FFFFFF",
    headshot_url: "/placeholder.svg",
    broadcast_name: "N. HULKENBERG"
  },
  {
    driver_number: 20,
    name_acronym: "MAG",
    full_name: "Kevin Magnussen",
    first_name: "Kevin",
    last_name: "Magnussen",
    country_code: "DK",
    team_name: "Haas F1 Team",
    team_colour: "FFFFFF",
    headshot_url: "/placeholder.svg",
    broadcast_name: "K. MAGNUSSEN"
  },
  {
    driver_number: 22,
    name_acronym: "TSU",
    full_name: "Yuki Tsunoda",
    first_name: "Yuki",
    last_name: "Tsunoda",
    country_code: "JP",
    team_name: "RB",
    team_colour: "1E41FF",
    headshot_url: "/placeholder.svg",
    broadcast_name: "Y. TSUNODA"
  },
  {
    driver_number: 3,
    name_acronym: "RIC",
    full_name: "Daniel Ricciardo",
    first_name: "Daniel",
    last_name: "Ricciardo",
    country_code: "AU",
    team_name: "RB",
    team_colour: "1E41FF",
    headshot_url: "/placeholder.svg",
    broadcast_name: "D. RICCIARDO"
  },
  {
    driver_number: 24,
    name_acronym: "ZHO",
    full_name: "Zhou Guanyu",
    first_name: "Guanyu",
    last_name: "Zhou",
    country_code: "CN",
    team_name: "Sauber",
    team_colour: "900000",
    headshot_url: "/placeholder.svg",
    broadcast_name: "G. ZHOU"
  }
];

// Create initial positions (in order)
const createInitialPositions = (): DriverPosition[] => {
  const now = new Date().toISOString();
  return mockDrivers.map((driver, index) => ({
    date: now,
    driver_number: driver.driver_number,
    position: index + 1
  }));
};

// Create initial lap data
const createInitialLapData = (): Record<number, LapData> => {
  const now = new Date().toISOString();
  const lapData: Record<number, LapData> = {};
  
  mockDrivers.forEach(driver => {
    // Base lap time around 90 seconds with some variation
    const baseLapTime = 90 + (Math.random() * 4 - 2);
    
    // Split into sectors roughly 30% / 40% / 30% of lap time
    const sector1 = baseLapTime * 0.3 + (Math.random() * 0.2 - 0.1);
    const sector2 = baseLapTime * 0.4 + (Math.random() * 0.2 - 0.1);
    const sector3 = baseLapTime * 0.3 + (Math.random() * 0.2 - 0.1);
    
    lapData[driver.driver_number] = {
      date_start: now,
      driver_number: driver.driver_number,
      duration_sector_1: sector1,
      duration_sector_2: sector2,
      duration_sector_3: sector3,
      i1_speed: 300 + Math.floor(Math.random() * 20),
      i2_speed: 280 + Math.floor(Math.random() * 20),
      is_pit_out_lap: false,
      lap_duration: sector1 + sector2 + sector3,
      lap_number: 1,
      meeting_key: 1000,
      session_key: 2000,
      st_speed: 290 + Math.floor(Math.random() * 20)
    };
  });
  
  return lapData;
};

// Create initial race control messages
const createInitialMessages = (): RaceControlMessage[] => {
  const now = new Date().toISOString();
  return [
    {
      date: now,
      message: "Race will begin shortly",
      category: "Race Control",
      flag: "none"
    }
  ];
};

// Initial state for demo
const initialDemoState = (): DemoState => {
  return {
    drivers: mockDrivers,
    positions: createInitialPositions(),
    lapData: createInitialLapData(),
    messages: createInitialMessages()
  };
};

// Update demo state for next iteration
const updateDemoState = (current: DemoState): DemoState => {
  const now = new Date().toISOString();
  
  // 1. Update positions - randomly swap some positions
  let newPositions = [...current.positions];
  if (Math.random() > 0.5) {
    // Pick two random positions to swap
    const idx1 = Math.floor(Math.random() * newPositions.length);
    let idx2 = Math.floor(Math.random() * newPositions.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * newPositions.length);
    }
    
    // Swap them
    const pos1 = newPositions[idx1].position;
    const pos2 = newPositions[idx2].position;
    
    newPositions[idx1] = {
      ...newPositions[idx1],
      position: pos2,
      date: now
    };
    
    newPositions[idx2] = {
      ...newPositions[idx2],
      position: pos1,
      date: now
    };
    
    // Sort by position
    newPositions.sort((a, b) => a.position - b.position);
  }
  
  // 2. Update lap data
  const newLapData = { ...current.lapData };
  
  Object.keys(newLapData).forEach(key => {
    const driverNum = parseInt(key);
    const currentLap = newLapData[driverNum];
    
    // Randomize lap time changes
    const improvement = (Math.random() > 0.7) ? (Math.random() * 0.5) : 0;
    const baseLapTime = currentLap.lap_duration - improvement;
    
    // Split into sectors roughly 30% / 40% / 30% of lap time with some variation
    const sector1 = baseLapTime * 0.3 + (Math.random() * 0.3 - 0.15);
    const sector2 = baseLapTime * 0.4 + (Math.random() * 0.3 - 0.15);
    const sector3 = baseLapTime * 0.3 + (Math.random() * 0.3 - 0.15);
    
    newLapData[driverNum] = {
      ...currentLap,
      date_start: now,
      duration_sector_1: sector1,
      duration_sector_2: sector2,
      duration_sector_3: sector3,
      lap_duration: sector1 + sector2 + sector3,
      lap_number: currentLap.lap_number + 1,
      i1_speed: 300 + Math.floor(Math.random() * 20),
      i2_speed: 280 + Math.floor(Math.random() * 20),
      st_speed: 290 + Math.floor(Math.random() * 20),
      is_pit_out_lap: Math.random() > 0.95 // Occasionally mark as pit out lap
    };
  });
  
  // 3. Maybe add a new race control message
  let newMessages = [...current.messages];
  if (Math.random() > 0.8) {
    const messageOptions = [
      "Yellow flag in sector 1",
      "DRS enabled",
      "Track clear",
      "Incident involving car #44 under investigation",
      "5 second time penalty for car #1 - track limits",
      "Car #16 has set fastest lap",
      "Virtual Safety Car deployed",
      "Safety Car in this lap"
    ];
    
    const randomMessage = messageOptions[Math.floor(Math.random() * messageOptions.length)];
    
    newMessages = [
      {
        date: now,
        message: randomMessage,
        category: "Race Control",
        flag: Math.random() > 0.7 ? "yellow" : "none"
      },
      ...newMessages
    ];
  }
  
  return {
    drivers: current.drivers,
    positions: newPositions,
    lapData: newLapData,
    messages: newMessages
  };
};

export { initialDemoState, updateDemoState, mockDrivers };
