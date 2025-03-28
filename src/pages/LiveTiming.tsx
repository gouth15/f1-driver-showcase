import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RaceControlMessage, DriverPosition, Driver, LapData } from '@/types/f1';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const LiveTiming: React.FC = () => {
  const [driverPositions, setDriverPositions] = useState<DriverPosition[]>([]);
  const [previousPositions, setPreviousPositions] = useState<Record<number, number>>({});
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [lapData, setLapData] = useState<Record<number, LapData>>({});
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const pollingIntervalRef = useRef<number | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  const { toast } = useToast();
  
  const fetchRaceControlMessages = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/race_control?session_key=latest');
      
      if (!response.ok) {
        return;
      }
      
      const data = await response.json();
      
      const raceControlMessages: RaceControlMessage[] = data.filter((item: any) => item.message);
      
      if (raceControlMessages.length > 0) {
        const sortedMessages = [...raceControlMessages].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        if (sortedMessages.length > 0 && lastMessageTimeRef.current !== sortedMessages[0].date) {
          toast({
            title: "Race Control",
            description: sortedMessages[0].message,
            duration: 5000,
          });
          
          lastMessageTimeRef.current = sortedMessages[0].date;
        }
      }
    } catch (err) {
    }
  }, [toast]);

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
      
      if (!response.ok) {
        return;
      }
      
      const data: Driver[] = await response.json();
      setDrivers(data);
    } catch (err) {
    }
  }, []);

  const fetchLapData = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/laps?session_key=latest');
      
      if (!response.ok) {
        return;
      }
      
      const data: LapData[] = await response.json();
      
      const latestLapsByDriver: Record<number, LapData> = {};
      
      data.forEach(lap => {
        if (!latestLapsByDriver[lap.driver_number] || 
            lap.lap_number > latestLapsByDriver[lap.driver_number].lap_number) {
          latestLapsByDriver[lap.driver_number] = lap;
        }
      });
      
      setLapData(latestLapsByDriver);
    } catch (err) {
    }
  }, []);

  const fetchDriverPositions = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/position?session_key=latest');
      
      if (!response.ok) {
        return;
      }
      
      const data: DriverPosition[] = await response.json();
      
      const currentPositionMap: Record<number, number> = {};
      
      const latestPositionsByDriver: Record<number, DriverPosition> = {};
      
      data.forEach(pos => {
        if (!latestPositionsByDriver[pos.driver_number] || 
            new Date(pos.date) > new Date(latestPositionsByDriver[pos.driver_number].date)) {
          latestPositionsByDriver[pos.driver_number] = pos;
        }
      });
      
      const sortedPositions = Object.values(latestPositionsByDriver).sort((a, b) => a.position - b.position);
      
      driverPositions.forEach(dp => {
        currentPositionMap[dp.driver_number] = dp.position;
      });
      
      setPreviousPositions(currentPositionMap);
      
      setDriverPositions(sortedPositions);
      setLoading(false);
      
    } catch (err) {
      setLoading(false);
    }
  }, [driverPositions]);
  
  useEffect(() => {
    fetchRaceControlMessages();
    fetchDrivers();
    fetchDriverPositions();
    fetchLapData();
    
    pollingIntervalRef.current = window.setInterval(() => {
      if (isPolling) {
        fetchRaceControlMessages();
        fetchDrivers();
        fetchDriverPositions();
        fetchLapData();
      }
    }, 2000);
    
    return () => {
      if (pollingIntervalRef.current !== null) {
        window.clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchRaceControlMessages, fetchDrivers, fetchDriverPositions, fetchLapData, isPolling]);

  const getPositionChange = (driverNumber: number, currentPosition: number): 'improved' | 'worsened' | 'unchanged' => {
    const prevPosition = previousPositions[driverNumber];
    
    if (prevPosition === undefined) return 'unchanged';
    if (currentPosition < prevPosition) return 'improved';
    if (currentPosition > prevPosition) return 'worsened';
    return 'unchanged';
  };

  const getDriverByNumber = (driverNumber: number): Driver | undefined => {
    return drivers.find(driver => driver.driver_number === driverNumber);
  };
  
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

  const formatLapTime = (seconds: number | undefined) => {
    if (!seconds) return '-';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${mins > 0 ? mins + ':' : ''}${secs.toString().padStart(mins > 0 ? 2 : 1, '0')}.${ms.toString().padStart(3, '0')}`;
  };
  
  return (
    <div className="min-h-screen bg-f1-navy text-white overflow-hidden flex flex-col">
      <Navbar />
      
      <div className="h-14"></div>
      
      <div className="container mx-auto px-1 py-1 max-h-[calc(100vh-56px)] flex-1">
        <div className="mb-2 flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPolling(!isPolling)}
              className={`flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                isPolling ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Clock className="mr-1 h-3 w-3" />
              {isPolling ? 'Live: On' : 'Live: Off'}
            </button>
            {!isPolling && (
              <button
                onClick={() => {
                  fetchRaceControlMessages();
                  fetchDrivers();
                  fetchDriverPositions();
                  fetchLapData();
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-xs font-medium transition-colors"
              >
                Refresh Now
              </button>
            )}
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-f1-red"></div>
          </div>
        )}
        
        {!loading && driverPositions.length > 0 && (
          <Table className="border-collapse">
            <TableHeader className="bg-f1-navy/80">
              <TableRow className="border-b border-f1-silver/20">
                <TableHead className="py-1 px-2 text-xs w-12">Pos</TableHead>
                <TableHead className="py-1 px-2 text-xs">Driver</TableHead>
                <TableHead className="py-1 px-2 text-xs text-right hidden sm:table-cell">Last Lap</TableHead>
                <TableHead className="py-1 px-2 text-xs text-right hidden md:table-cell">S1</TableHead>
                <TableHead className="py-1 px-2 text-xs text-right hidden md:table-cell">S2</TableHead>
                <TableHead className="py-1 px-2 text-xs text-right hidden md:table-cell">S3</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverPositions.map((position) => {
                const driver = drivers.find(d => d.driver_number === position.driver_number);
                const driverLap = lapData[position.driver_number];
                const prevPosition = previousPositions[position.driver_number];
                const teamColor = driver?.team_colour || '#FFFFFF';
                const positionChange = prevPosition !== undefined 
                  ? position.position < prevPosition 
                    ? 'improved' 
                    : position.position > prevPosition 
                      ? 'worsened' 
                      : 'unchanged'
                  : 'unchanged';

                const formatLapTime = (seconds: number | undefined) => {
                  if (!seconds) return '-';
                  
                  const mins = Math.floor(seconds / 60);
                  const secs = Math.floor(seconds % 60);
                  const ms = Math.floor((seconds % 1) * 1000);
                  
                  return `${mins > 0 ? mins + ':' : ''}${secs.toString().padStart(mins > 0 ? 2 : 1, '0')}.${ms.toString().padStart(3, '0')}`;
                };
                
                return (
                  <TableRow 
                    key={position.driver_number}
                    className={cn(
                      "border-b border-f1-silver/10 hover:bg-f1-navy/60 h-8",
                      positionChange === 'improved' && "bg-green-900/10",
                      positionChange === 'worsened' && "bg-red-900/10"
                    )}
                  >
                    <TableCell className="py-0 px-2 font-mono text-center">
                      <div className="flex items-center">
                        <span className="font-bold">{position.position}</span>
                        <div className="ml-1">
                          {positionChange === 'improved' && (
                            <ChevronUp className="h-3 w-3 text-green-500" />
                          )}
                          {positionChange === 'worsened' && (
                            <ChevronDown className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-0 px-2">
                      <div className="flex items-center">
                        <div 
                          className="w-1 h-6 mr-2 rounded-sm"
                          style={{ backgroundColor: teamColor }}
                        ></div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-sm">
                              {driver?.name_acronym || `#${position.driver_number}`}
                            </span>
                            <span className="ml-2 text-xs text-f1-silver/60">
                              {position.driver_number}
                            </span>
                          </div>
                          <div className="text-xs text-f1-silver/70">
                            {driver?.team_name || '-'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-0 px-2 text-right font-mono text-xs hidden sm:table-cell">
                      {driverLap?.lap_duration ? formatLapTime(driverLap.lap_duration) : '-'}
                    </TableCell>
                    <TableCell className="py-0 px-2 text-right font-mono text-xs hidden md:table-cell">
                      {driverLap?.duration_sector_1 ? formatLapTime(driverLap.duration_sector_1) : '-'}
                    </TableCell>
                    <TableCell className="py-0 px-2 text-right font-mono text-xs hidden md:table-cell">
                      {driverLap?.duration_sector_2 ? formatLapTime(driverLap.duration_sector_2) : '-'}
                    </TableCell>
                    <TableCell className="py-0 px-2 text-right font-mono text-xs hidden md:table-cell">
                      {driverLap?.duration_sector_3 ? formatLapTime(driverLap.duration_sector_3) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        
        {!loading && driverPositions.length === 0 && (
          <div className="text-center py-6 bg-f1-navy/30 rounded-lg">
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
