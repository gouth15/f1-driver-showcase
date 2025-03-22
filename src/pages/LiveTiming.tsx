import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { RaceControlMessage, DriverPosition } from '@/types/f1';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PositionCard from '@/components/PositionCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { drivers, getDriverByNumber } from '@/data/drivers';

const LiveTiming: React.FC = () => {
  const [driverPositions, setDriverPositions] = useState<DriverPosition[]>([]);
  const [previousPositions, setPreviousPositions] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const pollingIntervalRef = useRef<number | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  
  // Function to fetch race control messages
  const fetchRaceControlMessages = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/race_control?session_key=latest');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch race control messages: ${response.status}`);
      }
      
      const data: RaceControlMessage[] = await response.json();
      
      // Sort by date (newest first)
      const sortedMessages = [...data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Check if we have a new message
      if (sortedMessages.length > 0 && lastMessageTimeRef.current !== sortedMessages[0].date) {
        // Only show toast if this isn't the first load
        if (lastMessageTimeRef.current !== null) {
          let messageContent = sortedMessages[0].message;
          
          // Optional: Format the message a bit nicer if it's all caps
          if (messageContent === messageContent.toUpperCase()) {
            messageContent = messageContent.charAt(0) + messageContent.slice(1).toLowerCase();
          }
          
          toast.info("Race Control Message", {
            description: messageContent
          });
        }
        
        lastMessageTimeRef.current = sortedMessages[0].date;
      }
      
      setError(null);
      
    } catch (err) {
      console.error('Error fetching race control messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch race control messages');
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
    fetchDriverPositions();
    
    // Set up polling interval (every 1 second)
    pollingIntervalRef.current = window.setInterval(() => {
      if (isPolling) {
        fetchRaceControlMessages();
        fetchDriverPositions();
      }
    }, 1000);
    
    // Clean up on unmount
    return () => {
      if (pollingIntervalRef.current !== null) {
        window.clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchRaceControlMessages, fetchDriverPositions, isPolling]);

  // Determine if a position has changed (improved, worsened, or unchanged)
  const getPositionChange = (driverNumber: number, currentPosition: number): 'improved' | 'worsened' | 'unchanged' => {
    const prevPosition = previousPositions[driverNumber];
    
    if (prevPosition === undefined) return 'unchanged';
    if (currentPosition < prevPosition) return 'improved';
    if (currentPosition > prevPosition) return 'worsened';
    return 'unchanged';
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
        
        {/* Polling control */}
        <div className="mb-6 flex items-center">
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
                fetchDriverPositions();
              }}
              className="ml-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition-colors"
            >
              Refresh Now
            </button>
          )}
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
        
        {/* Live timing positions */}
        {!loading && driverPositions.length > 0 && (
          <div className="space-y-6">
            {/* Leader spotlight */}
            {driverPositions.length > 0 && (
              <Card className="bg-gradient-to-r from-yellow-500/20 to-yellow-700/10 border-yellow-500/50 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Trophy className="h-5 w-5" />
                    Race Leader
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PositionCard 
                    position={driverPositions[0]} 
                    driver={getDriverByNumber(driverPositions[0].driver_number)}
                    isLeader={true}
                    positionChange={getPositionChange(driverPositions[0].driver_number, driverPositions[0].position)}
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Position rows for all other drivers */}
            <Card className="bg-f1-navy/50 border-f1-silver/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-f1-white">Current Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {driverPositions.slice(1).map((position) => (
                    <PositionCard 
                      key={position.driver_number} 
                      position={position}
                      driver={getDriverByNumber(position.driver_number)}
                      positionChange={getPositionChange(position.driver_number, position.position)}
                      layout="row"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Table view */}
            <Card className="mt-8 bg-f1-navy/50 border-f1-silver/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-f1-white">Positions Table</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pos</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Last Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {driverPositions.map((position) => {
                      const posChange = getPositionChange(position.driver_number, position.position);
                      const driver = getDriverByNumber(position.driver_number);
                      return (
                        <TableRow key={position.driver_number} className={position.position === 1 ? "bg-yellow-950/30" : ""}>
                          <TableCell className={`font-mono font-bold ${position.position === 1 ? "text-yellow-400" : ""}`}>
                            {position.position}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {driver ? (
                                <>
                                  <span>{driver.name_acronym}</span>
                                  <span className="text-sm text-f1-silver/70">({position.driver_number})</span>
                                </>
                              ) : (
                                <span>Driver #{position.driver_number}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {driver ? (
                              <span 
                                className="px-2 py-1 rounded text-xs" 
                                style={{ 
                                  backgroundColor: `${driver.team_colour}20`,
                                  color: driver.team_colour,
                                  border: `1px solid ${driver.team_colour}40`
                                }}
                              >
                                {driver.team_name}
                              </span>
                            ) : "Unknown"}
                          </TableCell>
                          <TableCell>
                            {posChange === 'improved' && (
                              <div className="flex items-center text-green-500">
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Gained
                              </div>
                            )}
                            {posChange === 'worsened' && (
                              <div className="flex items-center text-red-500">
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Lost
                              </div>
                            )}
                            {posChange === 'unchanged' && (
                              <span className="text-f1-silver">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-f1-silver/70">
                            {new Date(position.date).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
