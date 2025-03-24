
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RaceControlMessage, DriverPosition, Driver, LapData, DemoState } from '@/types/f1';
import { Clock, ChevronUp, ChevronDown, PlayCircle, PauseCircle, SkipForward, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

// Initial empty state
const createEmptyDemoState = (): DemoState => {
  return {
    drivers: [],
    positions: [],
    lapData: {},
    messages: []
  };
};

const LiveTimingDemo: React.FC = () => {
  const [demoState, setDemoState] = useState<DemoState>(createEmptyDemoState());
  const [previousPositions, setPreviousPositions] = useState<Record<number, number>>({});
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1); // 1 = normal, 2 = 2x speed, etc.
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  
  // API data storage
  const driversDataRef = useRef<Driver[]>([]);
  const positionsDataRef = useRef<DriverPosition[]>([]);
  const lapDataRef = useRef<LapData[]>([]);
  const messagesDataRef = useRef<RaceControlMessage[]>([]);
  
  const dataIndexRef = useRef<number>(0);
  const { toast } = useToast();
  
  const fetchApiData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data types in parallel
      const [driversResponse, lapsResponse, positionsResponse, messagesResponse] = await Promise.all([
        fetch('https://api.openf1.org/v1/drivers?session_key=latest'),
        fetch('https://api.openf1.org/v1/laps?session_key=latest'),
        fetch('https://api.openf1.org/v1/position?session_key=latest'),
        fetch('https://api.openf1.org/v1/race_control_messages?session_key=latest')
      ]);
      
      if (!driversResponse.ok || !lapsResponse.ok || !positionsResponse.ok || !messagesResponse.ok) {
        throw new Error('Failed to fetch data from one or more endpoints');
      }
      
      const drivers = await driversResponse.json();
      const laps = await lapsResponse.json();
      const positions = await positionsResponse.json();
      const messages = await messagesResponse.json();
      
      // Store fetched data in refs for iteration
      driversDataRef.current = drivers;
      lapDataRef.current = laps;
      positionsDataRef.current = positions;
      messagesDataRef.current = messages;
      
      // Reset index
      dataIndexRef.current = 0;
      
      // Initialize the demo state with the first data points
      initializeDemoState();
      
      toast({
        title: "Data Loaded",
        description: `Loaded ${drivers.length} drivers, ${laps.length} lap entries, ${positions.length} position updates, and ${messages.length} messages`,
        duration: 3000,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching API data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API data. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      setIsLoading(false);
    }
  };
  
  const initializeDemoState = () => {
    if (driversDataRef.current.length === 0) return;
    
    // Initialize with first set of data
    const initialPositions = createInitialPositions();
    
    setDemoState({
      drivers: driversDataRef.current,
      positions: initialPositions,
      lapData: createInitialLapData(),
      messages: messagesDataRef.current.slice(0, 1) || []
    });
    
    // Store initial positions for animation
    const positionMap: Record<number, number> = {};
    initialPositions.forEach(pos => {
      positionMap[pos.driver_number] = pos.position;
    });
    setPreviousPositions(positionMap);
  };
  
  const createInitialPositions = (): DriverPosition[] => {
    // Use real position data if available, or generate from drivers
    if (positionsDataRef.current.length > 0) {
      // Get the latest position for each driver
      const driverNumbers = new Set(driversDataRef.current.map(d => d.driver_number));
      const latestPositions = new Map<number, DriverPosition>();
      
      // Find the latest position for each driver
      positionsDataRef.current.forEach(pos => {
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
      return driversDataRef.current.map((driver, index) => ({
        date: now,
        driver_number: driver.driver_number,
        position: index + 1
      }));
    }
  };
  
  const createInitialLapData = (): Record<number, LapData> => {
    const lapData: Record<number, LapData> = {};
    
    if (lapDataRef.current.length > 0) {
      // Group lap data by driver to get latest lap for each
      const driverLapMap = new Map<number, LapData>();
      
      lapDataRef.current.forEach(lap => {
        const current = driverLapMap.get(lap.driver_number);
        if (!current || (lap.lap_number && current.lap_number && lap.lap_number > current.lap_number)) {
          driverLapMap.set(lap.driver_number, lap);
        }
      });
      
      // Convert to record
      driverLapMap.forEach((lap, driverNumber) => {
        lapData[driverNumber] = lap;
      });
    }
    
    return lapData;
  };
  
  const updateSimulation = useCallback(() => {
    // Skip update if no data has been loaded
    if (
      driversDataRef.current.length === 0 || 
      lapDataRef.current.length === 0
    ) return;
    
    // Update data index
    dataIndexRef.current = (dataIndexRef.current + 1) % lapDataRef.current.length;
    
    setDemoState(prevState => {
      // Store current positions for animation
      const currentPositionMap: Record<number, number> = {};
      prevState.positions.forEach(dp => {
        currentPositionMap[dp.driver_number] = dp.position;
      });
      
      setPreviousPositions(currentPositionMap);
      
      // Get current lap data based on index
      const currentLapData = lapDataRef.current[dataIndexRef.current];
      
      // Update positions randomly
      let newPositions = [...prevState.positions];
      if (Math.random() > 0.5) {
        const idx1 = Math.floor(Math.random() * newPositions.length);
        let idx2 = Math.floor(Math.random() * newPositions.length);
        while (idx2 === idx1) {
          idx2 = Math.floor(Math.random() * newPositions.length);
        }
        
        const pos1 = newPositions[idx1].position;
        const pos2 = newPositions[idx2].position;
        
        newPositions[idx1] = {
          ...newPositions[idx1],
          position: pos2,
          date: new Date().toISOString()
        };
        
        newPositions[idx2] = {
          ...newPositions[idx2],
          position: pos1,
          date: new Date().toISOString()
        };
        
        newPositions.sort((a, b) => a.position - b.position);
      }
      
      // Update lap data for a random driver
      const randomDriverIndex = Math.floor(Math.random() * prevState.drivers.length);
      const randomDriverNumber = prevState.drivers[randomDriverIndex]?.driver_number;
      
      const newLapData = { ...prevState.lapData };
      if (randomDriverNumber && currentLapData) {
        newLapData[randomDriverNumber] = {
          ...currentLapData,
          driver_number: randomDriverNumber
        };
      }
      
      // Maybe add a new race control message
      let newMessages = [...prevState.messages];
      if (Math.random() > 0.8 && messagesDataRef.current.length > 0) {
        const randomMessageIndex = Math.floor(Math.random() * messagesDataRef.current.length);
        const randomMessage = messagesDataRef.current[randomMessageIndex];
        const now = new Date().toISOString();
        
        if (randomMessage) {
          newMessages = [
            {
              date: now,
              message: randomMessage.message,
              category: randomMessage.category || "Race Control",
              flag: randomMessage.flag || "none"
            },
            ...newMessages
          ];
          
          if (lastMessageTimeRef.current !== now) {
            toast({
              title: "Race Control",
              description: randomMessage.message,
              duration: 5000,
            });
            
            lastMessageTimeRef.current = now;
          }
        }
      }
      
      return {
        drivers: prevState.drivers,
        positions: newPositions,
        lapData: newLapData,
        messages: newMessages
      };
    });
  }, [toast]);
  
  useEffect(() => {
    fetchApiData();
  }, []);
  
  useEffect(() => {
    if (isRunning) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      
      intervalRef.current = window.setInterval(() => {
        updateSimulation();
      }, 2000 / speed);
    } else if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, speed, updateSimulation]);
  
  const resetDemo = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setPreviousPositions({});
    dataIndexRef.current = 0;
    initializeDemoState();
    lastMessageTimeRef.current = null;
    
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        updateSimulation();
      }, 2000 / speed);
    }
  };
  
  const reloadApiData = () => {
    fetchApiData();
  };
  
  const getPositionChange = (driverNumber: number, currentPosition: number): 'improved' | 'worsened' | 'unchanged' => {
    const prevPosition = previousPositions[driverNumber];
    
    if (prevPosition === undefined) return 'unchanged';
    if (currentPosition < prevPosition) return 'improved';
    if (currentPosition > prevPosition) return 'worsened';
    return 'unchanged';
  };

  const getDriverByNumber = (driverNumber: number): Driver | undefined => {
    return demoState.drivers.find(driver => driver.driver_number === driverNumber);
  };
  
  const formatLapTime = (seconds: number | undefined) => {
    if (!seconds) return '-';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${mins > 0 ? mins + ':' : ''}${secs.toString().padStart(mins > 0 ? 2 : 1, '0')}.${ms.toString().padStart(3, '0')}`;
  };
  
  const getPositionOffset = (driverNumber: number, currentPosition: number): string => {
    const prevPosition = previousPositions[driverNumber];
    
    if (prevPosition === undefined || prevPosition === currentPosition) return '0px';
    return '0px'; // No vertical offset animation, as requested
  };
  
  return (
    <div className="min-h-screen bg-f1-navy text-white">
      <Navbar />
      
      <div className="h-16"></div>
      
      <div className="container mx-auto px-2 py-2">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isRunning ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={isLoading}
            >
              {isRunning ? (
                <PauseCircle className="mr-1 h-3 w-3" />
              ) : (
                <PlayCircle className="mr-1 h-3 w-3" />
              )}
              {isRunning ? 'Demo: Running' : 'Demo: Paused'}
            </button>
            
            <button
              onClick={() => setSpeed(speed === 3 ? 1 : speed + 1)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-xs font-medium transition-colors"
              disabled={isLoading}
            >
              {`${speed}x Speed`}
            </button>
            
            <button
              onClick={updateSimulation}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-xs font-medium transition-colors"
              disabled={isLoading}
            >
              <SkipForward className="h-3 w-3" />
            </button>
            
            <button
              onClick={resetDemo}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-full text-xs font-medium transition-colors"
              disabled={isLoading}
            >
              Reset Demo
            </button>
            
            <button
              onClick={reloadApiData}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-full text-xs font-medium transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Reload API Data'}
            </button>
          </div>
          
          <div className="text-xs font-mono bg-f1-navy/60 px-2 py-1 rounded">
            Demo Mode - {lapDataRef.current.length > 0 ? `Using ${lapDataRef.current.length} real data points` : 'No data loaded'}
          </div>
        </div>
        
        {demoState.positions.length > 0 && (
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-1 text-xs text-f1-silver/80 mb-1 px-2">
              <div className="col-span-1">Pos</div>
              <div className="col-span-3">Driver</div>
              <div className="col-span-2">Last Lap</div>
              <div className="col-span-2">S1</div>
              <div className="col-span-2">S2</div>
              <div className="col-span-2">S3</div>
            </div>
            
            {demoState.positions.map((position) => {
              const driver = getDriverByNumber(position.driver_number);
              const positionChange = getPositionChange(position.driver_number, position.position);
              const teamColor = driver?.team_colour ? `#${driver.team_colour}` : '#FFFFFF';
              const driverLap = demoState.lapData[position.driver_number];
              
              return (
                <div 
                  key={position.driver_number}
                  className={cn(
                    "grid grid-cols-12 gap-1 p-2 rounded-md border-l-4 items-center transition-all duration-500 h-10",
                    "bg-f1-navy/60 border-f1-silver/20"
                  )}
                  style={{ 
                    borderLeftColor: teamColor,
                    transform: 'none', // No transform for up/down effect
                  }}
                >
                  <div className="col-span-1 font-bold flex items-center">
                    <span 
                      className="flex items-center justify-center text-sm"
                    >
                      {position.position}
                      {positionChange === 'improved' && (
                        <ChevronUp className="h-3 w-3 text-green-400 ml-1" />
                      )}
                      {positionChange === 'worsened' && (
                        <ChevronDown className="h-3 w-3 text-red-400 ml-1" />
                      )}
                    </span>
                  </div>
                  
                  <div className="col-span-3 flex items-center">
                    <div 
                      className="h-7 w-2 rounded-sm mr-2"
                      style={{ backgroundColor: teamColor }}
                    ></div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">
                        {driver ? driver.name_acronym : `#${position.driver_number}`}
                      </span>
                      <span className="text-xs text-f1-silver/70 -mt-1">
                        {driver?.team_name?.split(' ')[0] || ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 font-mono text-xs">
                    {driverLap ? formatLapTime(driverLap.lap_duration) : '-'}
                  </div>
                  
                  <div className="col-span-2 font-mono text-xs">
                    {driverLap ? formatLapTime(driverLap.duration_sector_1) : '-'}
                  </div>
                  
                  <div className="col-span-2 font-mono text-xs">
                    {driverLap ? formatLapTime(driverLap.duration_sector_2) : '-'}
                  </div>
                  
                  <div className="col-span-2 font-mono text-xs">
                    {driverLap ? formatLapTime(driverLap.duration_sector_3) : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTimingDemo;
