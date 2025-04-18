import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RaceControlMessage, DriverPosition, Driver, LapData } from '@/types/f1';
import { Clock, Flag, BellRing } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const LiveTiming: React.FC = () => {
  const [driverPositions, setDriverPositions] = useState<DriverPosition[]>([]);
  const [previousPositions, setPreviousPositions] = useState<Record<number, number>>({});
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [lapData, setLapData] = useState<Record<number, LapData>>({});
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [latestMessage, setLatestMessage] = useState<RaceControlMessage | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [fastestLapDriver, setFastestLapDriver] = useState<number | null>(null);
  const [showFastestLapAnimation, setShowFastestLapAnimation] = useState(false);
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
          setLatestMessage(sortedMessages[0]);
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 10000);
          
          lastMessageTimeRef.current = sortedMessages[0].date;
        }
      }
    } catch (err) {
    }
  }, []);

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
      let fastestLapTime = Number.MAX_VALUE;
      let fastestDriver: number | null = null;
      
      data.forEach(lap => {
        if (!latestLapsByDriver[lap.driver_number] || 
            lap.lap_number > latestLapsByDriver[lap.driver_number].lap_number) {
          latestLapsByDriver[lap.driver_number] = lap;
          
          if (lap.lap_duration && lap.lap_duration < fastestLapTime) {
            fastestLapTime = lap.lap_duration;
            fastestDriver = lap.driver_number;
          }
        }
      });
      
      if (fastestDriver !== null && fastestDriver !== fastestLapDriver) {
        setFastestLapDriver(fastestDriver);
        setShowFastestLapAnimation(true);
        
        setTimeout(() => {
          setShowFastestLapAnimation(false);
        }, 3000);
      }
      
      setLapData(latestLapsByDriver);
    } catch (err) {
    }
  }, [fastestLapDriver]);

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
      
      let sortedPositions = Object.values(latestPositionsByDriver);
      
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

  useEffect(() => {
    if (Object.keys(lapData).length > 0 && driverPositions.length > 0) {
      const sortedByLapTime = [...driverPositions].sort((a, b) => {
        const aLapTime = lapData[a.driver_number]?.lap_duration;
        const bLapTime = lapData[b.driver_number]?.lap_duration;
        
        if (aLapTime && bLapTime) {
          return aLapTime - bLapTime;
        }
        
        if (aLapTime) return -1;
        if (bLapTime) return 1;
        
        return a.position - b.position;
      });
      
      setDriverPositions(sortedByLapTime);
    }
  }, [lapData, driverPositions.length]);

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
      
      {showMessage && latestMessage && (
        <div className="sticky top-14 z-40 w-full animate-fade-in">
          <div className={cn(
            "bg-gradient-to-r from-purple-700 via-blue-600 to-purple-700 shadow-lg",
            "border-t border-b border-purple-400/50 py-2 px-3",
            "animate-enter pulse"
          )}>
            <div className="flex items-center justify-between container mx-auto max-w-7xl">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  {latestMessage.flag === "yellow" ? (
                    <Flag className="h-5 w-5 text-yellow-300" />
                  ) : latestMessage.flag === "red" ? (
                    <Flag className="h-5 w-5 text-red-500" />
                  ) : (
                    <BellRing className="h-5 w-5 text-yellow-300 animate-pulse" />
                  )}
                </div>
                <div className="font-bold text-sm">
                  Race Control | {formatTime(latestMessage.date)}
                </div>
              </div>
              <div className="text-white text-sm font-medium flex-1 ml-4">
                {latestMessage.message}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-1 py-1 flex-1 overflow-hidden">
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
          <div className="text-xs text-f1-silver/70">
            Qualifying Mode: Sorted by Fastest Lap
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-f1-red"></div>
          </div>
        )}
        
        {!loading && driverPositions.length > 0 && (
          <Table className="border-collapse">
            <TableHeader className="bg-f1-navy/80 sticky top-0 z-10">
              <TableRow className="border-b border-f1-silver/20">
                <TableHead className="py-0 px-1 text-xs w-8 h-4">#</TableHead>
                <TableHead className="py-0 px-1 text-xs h-4">Driver</TableHead>
                <TableHead className="py-0 px-1 text-xs text-right h-4 sm:table-cell">Time</TableHead>
                <TableHead className="py-0 px-1 text-xs text-right h-4 md:table-cell">S1</TableHead>
                <TableHead className="py-0 px-1 text-xs text-right h-4 md:table-cell">S2</TableHead>
                <TableHead className="py-0 px-1 text-xs text-right h-4 md:table-cell">S3</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="max-h-[calc(100vh-120px)]">
              {driverPositions.map((position, index) => {
                const driver = drivers.find(d => d.driver_number === position.driver_number);
                const driverLap = lapData[position.driver_number];
                const teamColor = driver?.team_colour || 'FFFFFF';
                
                const displayPosition = index + 1;
                
                const prevPosition = previousPositions[position.driver_number];
                const positionChange = prevPosition !== undefined 
                  ? displayPosition < prevPosition 
                    ? 'improved' 
                    : displayPosition > prevPosition 
                      ? 'worsened' 
                      : 'unchanged'
                  : 'unchanged';
                  
                const isFastest = showFastestLapAnimation && position.driver_number === fastestLapDriver;
                
                return (
                  <TableRow 
                    key={position.driver_number}
                    className={cn(
                      "border-b border-f1-silver/10 h-5 transition-all",
                      positionChange === 'improved' && "bg-green-900/10",
                      positionChange === 'worsened' && "bg-red-900/10",
                      isFastest && "animate-pulse bg-purple-900/30"
                    )}
                    style={{
                      background: isFastest 
                        ? `linear-gradient(90deg, #${teamColor}30, rgba(128, 0, 255, 0.3) 100%)`
                        : `linear-gradient(90deg, #${teamColor}15 0%, rgba(21, 21, 30, 0.3) 100%)`
                    }}
                  >
                    <TableCell className="py-0 px-0.5 font-mono text-center">
                      <div 
                        className={cn(
                          "h-4 w-4 rounded-sm flex items-center justify-center text-xs",
                          isFastest && "bg-purple-500/50"
                        )}
                        style={{ backgroundColor: isFastest ? 'rgba(128, 0, 255, 0.5)' : `#${teamColor}40` }}
                      >
                        {displayPosition}
                      </div>
                    </TableCell>
                    <TableCell className="py-0 px-0.5">
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center">
                            <span className={cn(
                              "font-medium text-xs", 
                              isFastest && "text-purple-300"
                            )}>
                              {driver?.name_acronym || `#${position.driver_number}`}
                            </span>
                            <span className="ml-1 text-[0.65rem] text-f1-silver/60">
                              {position.driver_number}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-0 px-0.5 text-right font-mono text-xs sm:table-cell">
                      <span className={cn(
                        (index === 0 || isFastest) && driverLap?.lap_duration && "text-purple-400 font-bold",
                      )}>
                        {driverLap?.lap_duration ? formatLapTime(driverLap.lap_duration) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="py-0 px-0.5 text-right font-mono text-xs hidden md:table-cell">
                      {driverLap?.duration_sector_1 ? formatLapTime(driverLap.duration_sector_1) : '-'}
                    </TableCell>
                    <TableCell className="py-0 px-0.5 text-right font-mono text-xs hidden md:table-cell">
                      {driverLap?.duration_sector_2 ? formatLapTime(driverLap.duration_sector_2) : '-'}
                    </TableCell>
                    <TableCell className="py-0 px-0.5 text-right font-mono text-xs hidden md:table-cell">
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
