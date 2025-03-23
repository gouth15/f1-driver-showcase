import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RaceControlMessage, DriverPosition, Driver, LapData, DemoState } from '@/types/f1';
import { Clock, ChevronUp, ChevronDown, PlayCircle, PauseCircle, SkipForward, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { initialDemoState } from '@/utils/demoData';

const LiveTimingDemo: React.FC = () => {
  const [demoState, setDemoState] = useState<DemoState>(initialDemoState());
  const [previousPositions, setPreviousPositions] = useState<Record<number, number>>({});
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1); // 1 = normal, 2 = 2x speed, etc.
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  const apiDataRef = useRef<LapData[]>([]);
  const apiIndexRef = useRef<number>(0);
  const { toast } = useToast();
  
  // Fetch real data from API once
  const fetchApiData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.openf1.org/v1/laps?session_key=latest');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      apiDataRef.current = data;
      toast({
        title: "Data Loaded",
        description: `Loaded ${data.length} lap data entries for simulation`,
        duration: 3000,
      });
      // Reset index
      apiIndexRef.current = 0;
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API data. Using fallback demo data.",
        variant: "destructive",
        duration: 5000,
      });
      setIsLoading(false);
    }
  };
  
  // Update simulation using real API data
  const updateSimulation = useCallback(() => {
    // If we have API data, use it for simulation
    if (apiDataRef.current.length > 0) {
      setDemoState(prevState => {
        // First save current positions for animation
        const currentPositionMap: Record<number, number> = {};
        prevState.positions.forEach(dp => {
          currentPositionMap[dp.driver_number] = dp.position;
        });
        
        // Then update previous positions state
        setPreviousPositions(currentPositionMap);
        
        // Get current API data entry
        const currentIndex = apiIndexRef.current % apiDataRef.current.length;
        const currentLapData = apiDataRef.current[currentIndex];
        
        // Move to next index for next update
        apiIndexRef.current = (apiIndexRef.current + 1) % apiDataRef.current.length;
        
        // Create a new positions array with random position changes
        let newPositions = [...prevState.positions];
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
            date: new Date().toISOString()
          };
          
          newPositions[idx2] = {
            ...newPositions[idx2],
            position: pos1,
            date: new Date().toISOString()
          };
          
          // Sort by position
          newPositions.sort((a, b) => a.position - b.position);
        }
        
        // Update lap data with real API data for a random driver
        const randomDriverIndex = Math.floor(Math.random() * prevState.drivers.length);
        const randomDriverNumber = prevState.drivers[randomDriverIndex].driver_number;
        
        const newLapData = { ...prevState.lapData };
        newLapData[randomDriverNumber] = {
          ...currentLapData,
          driver_number: randomDriverNumber
        };
        
        // Maybe add a new race control message
        let newMessages = [...prevState.messages];
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
          const now = new Date().toISOString();
          
          newMessages = [
            {
              date: now,
              message: randomMessage,
              category: "Race Control",
              flag: Math.random() > 0.7 ? "yellow" : "none"
            },
            ...newMessages
          ];
          
          // Check if we have a new message to show
          if (lastMessageTimeRef.current !== now) {
            toast({
              title: "Race Control",
              description: randomMessage,
              duration: 5000,
            });
            
            lastMessageTimeRef.current = now;
          }
        }
        
        return {
          drivers: prevState.drivers,
          positions: newPositions,
          lapData: newLapData,
          messages: newMessages
        };
      });
    } else {
      // Fallback to random updates if no API data
      setDemoState(prevState => {
        // Save current positions
        const currentPositionMap: Record<number, number> = {};
        prevState.positions.forEach(dp => {
          currentPositionMap[dp.driver_number] = dp.position;
        });
        
        setPreviousPositions(currentPositionMap);
        
        // Update with random changes
        let newPositions = [...prevState.positions];
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
            date: new Date().toISOString()
          };
          
          newPositions[idx2] = {
            ...newPositions[idx2],
            position: pos1,
            date: new Date().toISOString()
          };
          
          // Sort by position
          newPositions.sort((a, b) => a.position - b.position);
        }
        
        // Maybe add a new race control message
        let newMessages = [...prevState.messages];
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
          const now = new Date().toISOString();
          
          newMessages = [
            {
              date: now,
              message: randomMessage,
              category: "Race Control",
              flag: Math.random() > 0.7 ? "yellow" : "none"
            },
            ...newMessages
          ];
          
          // Show toast notification for new message
          if (lastMessageTimeRef.current !== now) {
            toast({
              title: "Race Control",
              description: randomMessage,
              duration: 5000,
            });
            
            lastMessageTimeRef.current = now;
          }
        }
        
        return {
          drivers: prevState.drivers,
          positions: newPositions,
          lapData: prevState.lapData,
          messages: newMessages
        };
      });
    }
  }, [toast]);
  
  // Fetch API data on component mount
  useEffect(() => {
    fetchApiData();
  }, []);
  
  // Start/stop simulation
  useEffect(() => {
    if (isRunning) {
      // Clear any existing interval
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      
      // Set new interval based on speed
      intervalRef.current = window.setInterval(() => {
        updateSimulation();
      }, 2000 / speed); // Base interval is 2 seconds
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
  
  // Reset demo
  const resetDemo = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setPreviousPositions({});
    setDemoState(initialDemoState());
    lastMessageTimeRef.current = null;
    apiIndexRef.current = 0;
    
    // If it was running, restart it
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        updateSimulation();
      }, 2000 / speed);
    }
  };
  
  // Reload API data
  const reloadApiData = () => {
    fetchApiData();
    resetDemo();
  };
  
  // Determine if a position has changed (improved, worsened, or unchanged)
  const getPositionChange = (driverNumber: number, currentPosition: number): 'improved' | 'worsened' | 'unchanged' => {
    const prevPosition = previousPositions[driverNumber];
    
    if (prevPosition === undefined) return 'unchanged';
    if (currentPosition < prevPosition) return 'improved';
    if (currentPosition > prevPosition) return 'worsened';
    return 'unchanged';
  };

  // Get driver by number
  const getDriverByNumber = (driverNumber: number): Driver | undefined => {
    return demoState.drivers.find(driver => driver.driver_number === driverNumber);
  };
  
  // Format lap time
  const formatLapTime = (seconds: number | undefined) => {
    if (!seconds) return '-';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${mins > 0 ? mins + ':' : ''}${secs.toString().padStart(mins > 0 ? 2 : 1, '0')}.${ms.toString().padStart(3, '0')}`;
  };
  
  // Calculate position change animation offset
  const getPositionOffset = (driverNumber: number, currentPosition: number): string => {
    const prevPosition = previousPositions[driverNumber];
    
    if (prevPosition === undefined) return '0px';
    if (currentPosition < prevPosition) {
      // Moving up (improved)
      return `${(prevPosition - currentPosition) * 40}px`;
    }
    if (currentPosition > prevPosition) {
      // Moving down (worsened)
      return `-${(currentPosition - prevPosition) * 40}px`;
    }
    return '0px';
  };
  
  return (
    <div className="min-h-screen bg-f1-navy text-white">
      <Navbar />
      
      {/* Top spacing for fixed navbar */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-2 py-2">
        {/* Controls - Demo controls */}
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
            Demo Mode - {apiDataRef.current.length > 0 ? `Using ${apiDataRef.current.length} real data points` : 'Using simulated data'}
          </div>
        </div>
        
        {/* Driver position table - displayed as rows */}
        {demoState.positions.length > 0 && (
          <div className="space-y-1">
            {/* Table header */}
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
              const animationOffset = getPositionOffset(position.driver_number, position.position);
              
              return (
                <div 
                  key={position.driver_number}
                  className={cn(
                    "grid grid-cols-12 gap-1 p-2 rounded-md border-l-4 items-center transition-all duration-500 h-10",
                    "bg-f1-navy/60 border-f1-silver/20"
                  )}
                  style={{ 
                    borderLeftColor: teamColor,
                    transform: positionChange !== 'unchanged' ? `translateY(${animationOffset})` : 'none',
                  }}
                >
                  {/* Position number */}
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
                  
                  {/* Driver info */}
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
                  
                  {/* Last Lap */}
                  <div className="col-span-2 font-mono text-xs">
                    {driverLap ? formatLapTime(driverLap.lap_duration) : '-'}
                  </div>
                  
                  {/* Sector 1 */}
                  <div className="col-span-2 font-mono text-xs">
                    {driverLap ? formatLapTime(driverLap.duration_sector_1) : '-'}
                  </div>
                  
                  {/* Sector 2 */}
                  <div className="col-span-2 font-mono text-xs">
                    {driverLap ? formatLapTime(driverLap.duration_sector_2) : '-'}
                  </div>
                  
                  {/* Sector 3 */}
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
