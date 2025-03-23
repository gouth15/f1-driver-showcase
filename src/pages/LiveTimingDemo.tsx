import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RaceControlMessage, DriverPosition, Driver, LapData, DemoState } from '@/types/f1';
import { Clock, ChevronUp, ChevronDown, PlayCircle, PauseCircle, SkipForward } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { initialDemoState, updateDemoState } from '@/utils/demoData';

const LiveTimingDemo: React.FC = () => {
  const [demoState, setDemoState] = useState<DemoState>(initialDemoState());
  const [previousPositions, setPreviousPositions] = useState<Record<number, number>>({});
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1); // 1 = normal, 2 = 2x speed, etc.
  const intervalRef = useRef<number | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  const { toast } = useToast();
  
  // Update simulation state
  const updateSimulation = useCallback(() => {
    setDemoState(prevState => {
      // First save current positions
      const currentPositionMap: Record<number, number> = {};
      prevState.positions.forEach(dp => {
        currentPositionMap[dp.driver_number] = dp.position;
      });
      
      // Then update previous positions state
      setPreviousPositions(currentPositionMap);
      
      // Update demo state
      const newState = updateDemoState(prevState);
      
      // Check if we have a new message to show
      if (newState.messages.length > 0 && lastMessageTimeRef.current !== newState.messages[0].date) {
        toast({
          title: "Race Control",
          description: newState.messages[0].message,
          duration: 5000,
        });
        
        lastMessageTimeRef.current = newState.messages[0].date;
      }
      
      return newState;
    });
  }, [toast]);
  
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
    
    // If it was running, restart it
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        updateSimulation();
      }, 2000 / speed);
    }
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
            >
              {`${speed}x Speed`}
            </button>
            
            <button
              onClick={updateSimulation}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-xs font-medium transition-colors"
            >
              <SkipForward className="h-3 w-3" />
            </button>
            
            <button
              onClick={resetDemo}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-full text-xs font-medium transition-colors"
            >
              Reset Demo
            </button>
          </div>
          
          <div className="text-xs font-mono bg-f1-navy/60 px-2 py-1 rounded">
            Demo Mode - Simulated Data
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
              
              return (
                <div 
                  key={position.driver_number}
                  className={cn(
                    "grid grid-cols-12 gap-1 p-2 rounded-md border-l-4 items-center transition-all duration-300 h-10",
                    "bg-f1-navy/60 border-f1-silver/20",
                    positionChange === 'improved' && "border-l-green-500 animate-slide-in-right",
                    positionChange === 'worsened' && "border-l-red-500 animate-slide-in-right",
                    positionChange === 'improved' && "transform -translate-y-1",
                    positionChange === 'worsened' && "transform translate-y-1"
                  )}
                  style={{ borderLeftColor: teamColor }}
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
