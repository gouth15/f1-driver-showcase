import { Driver, LapData, DriverPosition, RaceControlMessage, DemoState } from '@/types/f1';

export async function fetchF1Data() {
  try {
    // Fetch all data types in parallel with session_key=9994
    const [driversResponse, lapsResponse, positionsResponse, messagesResponse] = await Promise.all([
      fetch('https://api.openf1.org/v1/drivers?session_key=9994'),
      fetch('https://api.openf1.org/v1/laps?session_key=9994'),
      fetch('https://api.openf1.org/v1/position?session_key=9994'),
      fetch('https://api.openf1.org/v1/race_control_messages?session_key=9994')
    ]);
    
    if (!driversResponse.ok || !lapsResponse.ok || !positionsResponse.ok || !messagesResponse.ok) {
      throw new Error('Failed to fetch data from one or more endpoints');
    }
    
    const drivers = await driversResponse.json();
    const laps = await lapsResponse.json();
    const positions = await positionsResponse.json();
    const messages = await messagesResponse.json();
    
    return {
      drivers,
      laps,
      positions,
      messages
    };
  } catch (error) {
    console.error('Error fetching API data:', error);
    throw error;
  }
}

export function createInitialPositions(drivers: Driver[], positionsData: DriverPosition[]): DriverPosition[] {
  // Use real position data if available, or generate from drivers
  if (positionsData.length > 0) {
    // Get the latest position for each driver
    const driverNumbers = new Set(drivers.map(d => d.driver_number));
    const latestPositions = new Map<number, DriverPosition>();
    
    // Find the latest position for each driver
    positionsData.forEach(pos => {
      if (driverNumbers.has(pos.driver_number)) {
        const current = latestPositions.get(pos.driver_number);
        if (!current || new Date(pos.date) > new Date(current.date)) {
          latestPositions.set(pos.driver_number, pos);
        }
      }
    });
    
    // Convert to array and sort by position
    return Array.from(latestPositions.values())
      .sort((a, b) => a.position - b.position);
  } else {
    // Generate positions from drivers if no position data
    const now = new Date().toISOString();
    return drivers.map((driver, index) => ({
      date: now,
      driver_number: driver.driver_number,
      position: index + 1
    }));
  }
}

export function createInitialLapData(lapData: LapData[]): Record<number, LapData> {
  const lapDataRecord: Record<number, LapData> = {};
  
  if (lapData.length > 0) {
    // Group lap data by driver to get latest lap for each
    const driverLapMap = new Map<number, LapData>();
    
    lapData.forEach(lap => {
      const current = driverLapMap.get(lap.driver_number);
      if (!current || (lap.lap_number && current.lap_number && lap.lap_number > current.lap_number)) {
        driverLapMap.set(lap.driver_number, lap);
      }
    });
    
    // Convert to record
    driverLapMap.forEach((lap, driverNumber) => {
      lapDataRecord[driverNumber] = lap;
    });
  }
  
  return lapDataRecord;
}

export function createEmptyDemoState(): DemoState {
  return {
    drivers: [],
    positions: [],
    lapData: {},
    messages: []
  };
}

export function initializeDemoState(
  drivers: Driver[],
  positions: DriverPosition[],
  lapData: LapData[],
  messages: RaceControlMessage[]
): DemoState {
  const initialPositions = createInitialPositions(drivers, positions);
  
  return {
    drivers,
    positions: initialPositions,
    lapData: createInitialLapData(lapData),
    messages: messages.slice(0, 1) || []
  };
}
