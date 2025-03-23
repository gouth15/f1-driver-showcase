
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RaceControlMessage, DriverPosition, Driver } from '@/types/f1';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

const LiveTiming: React.FC = () => {
  const [driverPositions, setDriverPositions] = useState<DriverPosition[]>([]);
  const [previousPositions, setPreviousPositions] = useState<Record<number, number>>({});
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const pollingIntervalRef = useRef<number | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  const { toast } = useToast();
  
  // Function to fetch race control messages
  const fetchRaceControlMessages = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/race_control?session_key=latest');
      
      if (!response.ok) {
        return;
      }
      
      const data = await response.json();
      
      // Process race control messages
      const raceControlMessages: RaceControlMessage[] = data.filter((item: any) => item.message);
      
      // Sort race control messages by date (newest first)
      if (raceControlMessages.length > 0) {
        const sortedMessages = [...raceControlMessages].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Check if we have a new message
        if (sortedMessages.length > 0 && lastMessageTimeRef.current !== sortedMessages[0].date) {
          // Show toast instead of banner
          toast({
            title: "Race Control",
            description: sortedMessages[0].message,
            duration: 5000,
          });
          
          // Update lastMessageTime ref
          lastMessageTimeRef.current = sortedMessages[0].date;
        }
      }
    } catch (err) {
      // Silently ignore errors
    }
  }, [toast]);

  // Function to fetch driver information
  const fetchDrivers = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
      
      if (!response.ok) {
        return;
      }
      
      const data: Driver[] = await response.json();
      setDrivers(data);
    } catch (err) {
      // Silently ignore errors
    }
  }, []);

  // Function to fetch driver positions
  const fetchDriverPositions = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/position?session_key=latest');
      
      if (!response.ok) {
        return;
      }
      
      const data: DriverPosition[] = await response.json();
      
      // Before updating positions, store the current ones as previous
      const currentPositionMap: Record<number, number> = {};
      
      // Create a map of the latest position for each driver
      const latestPositionsByDriver: Record<number, DriverPosition> = {};
      
      data.forEach(pos => {
        if (!latestPositionsByDriver[pos.driver_number] || 
            new Date(pos.date) > new Date(latestPositionsByDriver[pos.driver_number].date)) {
          latestPositionsByDriver[pos.driver_number] = pos;
        }
      });
      
      // Convert the map back to an array and sort by position
      const sortedPositions = Object.values(latestPositionsByDriver).sort((a, b) => a.position - b.position);
      
      // Create the previous positions map for tracking changes
      driverPositions.forEach(dp => {
        currentPositionMap[dp.driver_number] = dp.position;
      });
      
      // Update previous positions
      setPreviousPositions(currentPositionMap);
      
      // Set the new driver positions
      setDriverPositions(sortedPositions);
      setLoading(false);
      
    } catch (err) {
      // Silently ignore errors
      setLoading(false);
    }
  }, [driverPositions]);
  
  // Start polling on component mount
  useEffect(() => {
    // Initial fetch
    fetchRaceControlMessages();
    fetchDrivers();
    fetchDriverPositions();
    
    // Set up polling interval (every 2 seconds)
    pollingIntervalRef.current = window.setInterval(() => {
      if (isPolling) {
        fetchRaceControlMessages();
        fetchDrivers();
        fetchDriverPositions();
      }
    }, 2000); // 2 seconds polling interval
    
    // Clean up on unmount
    return () => {
      if (pollingIntervalRef.current !== null) {
        window.clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchRaceControlMessages, fetchDrivers, fetchDriverPositions, isPolling]);

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
    return drivers.find(driver => driver.driver_number === driverNumber);
  };
  
  // Format the time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return '';
    }
  };
  
  return (
    <div className="min-h-screen bg-f1-navy text-white">
      <Navbar />
      
      {/* Top spacing for fixed navbar */}
      <div className="h-20"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Live Timing</h1>
          <p className="text-f1-white/70">
            Real-time tracking of driver positions
          </p>
        </div>
        
        {/* Controls - Polling control */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPolling(!isPolling)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isPolling ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Clock className="mr-2 h-4 w-4" />
              {isPolling ? 'Live: On' : 'Live: Off'}
            </button>
            {!isPolling && (
              <button
                onClick={() => {
                  fetchRaceControlMessages();
                  fetchDrivers();
                  fetchDriverPositions();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition-colors"
              >
                Refresh Now
              </button>
            )}
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-f1-red"></div>
          </div>
        )}
        
        {/* Driver position table - displayed as rows */}
        {!loading && driverPositions.length > 0 && (
          <div className="space-y-1">
            {driverPositions.map((position) => {
              const driver = getDriverByNumber(position.driver_number);
              const positionChange = getPositionChange(position.driver_number, position.position);
              const teamColor = driver?.team_colour ? `#${driver.team_colour}` : '#FFFFFF';
              
              return (
                <div 
                  key={position.driver_number}
                  className={cn(
                    "p-2 rounded-md border-l-4 flex items-center transition-all duration-300 h-12",
                    "bg-f1-navy/60 border-f1-silver/20",
                    positionChange === 'improved' && "border-l-green-500 animate-slide-in-right",
                    positionChange === 'worsened' && "border-l-red-500 animate-slide-in-right",
                    positionChange === 'improved' && "transform -translate-y-1",
                    positionChange === 'worsened' && "transform translate-y-1"
                  )}
                  style={{ borderLeftColor: teamColor }}
                >
                  {/* Position number */}
                  <div className="min-w-[1.5rem] text-center font-bold mr-3">
                    {position.position}
                  </div>
                  
                  {/* Driver number */}
                  <div 
                    className="min-w-[2.5rem] h-8 flex items-center justify-center font-bold rounded px-2 mr-2"
                    style={{ backgroundColor: teamColor, color: '#FFFFFF' }}
                  >
                    {position.driver_number}
                  </div>
                  
                  {/* Driver name and team */}
                  <div className="flex-1 flex items-center">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm md:text-base">
                        {driver ? driver.name_acronym : `#${position.driver_number}`}
                      </span>
                      
                      {driver && (
                        <span className="text-xs text-f1-silver/80">
                          {driver.team_name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Position change indicator */}
                  <div className="flex items-center mr-2">
                    {positionChange === 'improved' && (
                      <div className="flex items-center text-green-400">
                        <ChevronUp className="h-4 w-4" />
                      </div>
                    )}
                    {positionChange === 'worsened' && (
                      <div className="flex items-center text-red-400">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  
                  {/* Last update time */}
                  <div className="text-xs text-f1-silver/70 w-14 text-right">
                    {formatTime(position.date).split(':').slice(0, 2).join(':')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Empty state */}
        {!loading && driverPositions.length === 0 && (
          <div className="text-center py-12 bg-f1-navy/30 rounded-lg">
            <p className="text-f1-white/70">
              No position data available for the current session.
            </p>
            <p className="mt-2 text-sm text-f1-white/50">
              This may occur when there is no active session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTiming;
