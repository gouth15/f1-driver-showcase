
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RaceControlMessage, DriverPosition, Driver, TeamRadioMessage } from '@/types/f1';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, ChevronUp, ChevronDown, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import RaceControlBanner from '@/components/RaceControlBanner';
import TeamRadioPlayer from '@/components/TeamRadioPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const LiveTiming: React.FC = () => {
  const [driverPositions, setDriverPositions] = useState<DriverPosition[]>([]);
  const [previousPositions, setPreviousPositions] = useState<Record<number, number>>({});
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [currentRCMessage, setCurrentRCMessage] = useState<RaceControlMessage | null>(null);
  const [teamRadios, setTeamRadios] = useState<TeamRadioMessage[]>([]);
  const pollingIntervalRef = useRef<number | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  
  // Function to fetch race control messages
  const fetchRaceControlMessages = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/race_control?session_key=latest');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch race control messages: ${response.status}`);
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
          // Set the banner message
          setCurrentRCMessage(sortedMessages[0]);
          
          // Update lastMessageTime ref
          lastMessageTimeRef.current = sortedMessages[0].date;
        }
      }
      
      setError(null);
      
    } catch (err) {
      console.error('Error fetching race control data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch race control data');
    }
  }, []);

  // Function to fetch team radio messages
  const fetchTeamRadioMessages = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/team_radio?session_key=latest');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team radio messages: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process team radio messages
      if (data.length > 0) {
        // Sort team radios by date (newest first)
        const sortedTeamRadios = [...data].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setTeamRadios(sortedTeamRadios);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching team radio data:', err);
    }
  }, []);

  // Function to fetch driver information
  const fetchDrivers = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch drivers: ${response.status}`);
      }
      
      const data: Driver[] = await response.json();
      setDrivers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drivers');
    }
  }, []);

  // Function to fetch driver positions
  const fetchDriverPositions = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/position?session_key=latest');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch driver positions: ${response.status}`);
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
      setError(null);
      
    } catch (err) {
      console.error('Error fetching driver positions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch driver positions');
      setLoading(false);
    }
  }, [driverPositions]);
  
  // Start polling on component mount
  useEffect(() => {
    // Initial fetch
    fetchRaceControlMessages();
    fetchTeamRadioMessages();
    fetchDrivers();
    fetchDriverPositions();
    
    // Set up polling interval (every 2 seconds)
    pollingIntervalRef.current = window.setInterval(() => {
      if (isPolling) {
        fetchRaceControlMessages();
        fetchTeamRadioMessages();
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
  }, [fetchRaceControlMessages, fetchTeamRadioMessages, fetchDrivers, fetchDriverPositions, isPolling]);

  // Handle banner completion
  const handleBannerComplete = () => {
    setCurrentRCMessage(null);
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
      
      {/* Race Control Banner */}
      {currentRCMessage && (
        <RaceControlBanner 
          message={currentRCMessage} 
          onComplete={handleBannerComplete}
        />
      )}
      
      {/* Top spacing for fixed navbar */}
      <div className="h-20"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Live Timing</h1>
          <p className="text-f1-white/70">
            Real-time tracking of driver positions
          </p>
        </div>
        
        {/* Controls - Polling control and Team Radio */}
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
                  fetchTeamRadioMessages();
                  fetchDrivers();
                  fetchDriverPositions();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition-colors"
              >
                Refresh Now
              </button>
            )}
          </div>
          
          {/* Team Radio Button */}
          <TeamRadioPlayer teamRadios={teamRadios} drivers={drivers} />
        </div>
        
        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-f1-red"></div>
          </div>
        )}
        
        {/* Driver position rows */}
        {!loading && driverPositions.length > 0 && (
          <div className="space-y-2">
            {driverPositions.map((position) => {
              const driver = getDriverByNumber(position.driver_number);
              const positionChange = getPositionChange(position.driver_number, position.position);
              const teamColor = driver?.team_colour || '#FFFFFF';
              const isNew = previousPositions[position.driver_number] !== undefined;
              
              return (
                <div 
                  key={position.driver_number}
                  className={cn(
                    "p-4 rounded-lg overflow-hidden transition-all duration-500",
                    "bg-f1-navy/60 border border-f1-silver/20 flex items-center",
                    positionChange === 'improved' && "border-l-green-500 border-l-4 animate-slide-in-right",
                    positionChange === 'worsened' && "border-l-red-500 border-l-4 animate-slide-in-right"
                  )}
                >
                  {/* Position number */}
                  <div className={cn(
                    "flex items-center justify-center min-w-[3rem] h-12 rounded-full font-bold text-xl mr-4",
                    "bg-white/10 text-white"
                  )}>
                    {position.position}
                  </div>
                  
                  {/* Driver avatar and info */}
                  <div className="flex items-center flex-1">
                    <Avatar className="h-12 w-12 mr-3 border-2" style={{ borderColor: teamColor }}>
                      {driver?.headshot_url ? (
                        <AvatarImage src={driver.headshot_url} alt={driver?.full_name || `Driver #${position.driver_number}`} />
                      ) : (
                        <AvatarFallback className="bg-f1-navy/80">
                          <User className="h-6 w-6 text-f1-silver" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-lg font-bold">
                          {driver ? (
                            <span>{driver.name_acronym}</span>
                          ) : (
                            <span>#{position.driver_number}</span>
                          )}
                        </span>
                        <span className="ml-2 text-sm text-f1-silver/70">
                          {position.driver_number}
                        </span>
                      </div>
                      
                      {driver && (
                        <div className="text-sm text-f1-silver/80 flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-1"
                            style={{ backgroundColor: teamColor }}
                          ></div>
                          {driver.team_name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Position change indicator */}
                  <div className="flex flex-col items-end ml-2">
                    {positionChange === 'improved' && (
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Gained
                      </Badge>
                    )}
                    {positionChange === 'worsened' && (
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500">
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Lost
                      </Badge>
                    )}
                    
                    {/* Last update time */}
                    <div className="text-xs text-f1-silver/70 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(position.date)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Empty state */}
        {!loading && driverPositions.length === 0 && !error && (
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
