
import React, { useEffect, useState } from 'react';
import { Driver, LapData, DriverPosition } from '@/types/f1';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverPositionRowProps {
  position: DriverPosition;
  displayPosition?: number; // New prop for qualifying mode
  driver: Driver | undefined;
  positionChange: 'improved' | 'worsened' | 'unchanged';
  driverLap: LapData | undefined;
  bestLapTimes: Record<number, {
    overall: number | null;
    personal: number | null;
    s1_overall: number | null;
    s1_personal: number | null;
    s2_overall: number | null;
    s2_personal: number | null;
    s3_overall: number | null;
    s3_personal: number | null;
  }>;
  overallBestLap: number | null;
  overallBestS1: number | null;
  overallBestS2: number | null;
  overallBestS3: number | null;
  isFirst?: boolean; // New prop to highlight fastest lap
}

const DriverPositionRow: React.FC<DriverPositionRowProps> = ({
  position,
  displayPosition,
  driver,
  positionChange,
  driverLap,
  bestLapTimes,
  overallBestLap,
  overallBestS1,
  overallBestS2,
  overallBestS3,
  isFirst = false
}) => {
  const teamColor = driver?.team_colour ? `#${driver.team_colour}` : '#FFFFFF';
  const [animatePosition, setAnimatePosition] = useState(false);
  
  // Use display position if provided, otherwise use original position
  const positionToShow = displayPosition !== undefined ? displayPosition : position.position;
  
  useEffect(() => {
    if (positionChange !== 'unchanged') {
      setAnimatePosition(true);
      const timer = setTimeout(() => setAnimatePosition(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [position.position, positionChange]);
  
  const formatLapTime = (seconds: number | undefined) => {
    if (!seconds) return '-';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${mins > 0 ? mins + ':' : ''}${secs.toString().padStart(mins > 0 ? 2 : 1, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const getLapTimeClass = (lapTime: number | undefined, personalBest: number | null, overallBest: number | null) => {
    if (!lapTime) return "";
    
    // Is this the overall best time?
    if (overallBest && Math.abs(lapTime - overallBest) < 0.001) {
      return "text-purple-400 font-bold";
    }
    
    // Is this a personal best time?
    if (personalBest && lapTime <= personalBest) {
      return "text-green-400";
    }
    
    return "";
  };

  // Get the best times for this driver
  const driverBest = position.driver_number && bestLapTimes[position.driver_number];

  return (
    <div 
      className={cn(
        "grid grid-cols-12 gap-x-0 rounded-md items-center transition-all",
        "bg-f1-navy/30 border-l-4 h-6 relative",
        animatePosition && positionChange === 'improved' && "animate-position-improved",
        animatePosition && positionChange === 'worsened' && "animate-position-worsened",
        isFirst && driverLap?.lap_duration && "border-r-2 border-r-purple-400"
      )}
      style={{ 
        borderLeftColor: teamColor,
        background: `linear-gradient(90deg, ${teamColor}15 0%, rgba(21, 21, 30, 0.3) 100%)`,
      }}
    >
      {/* Position + Change Indicator */}
      <div className="col-span-1 font-bold flex items-center justify-center">
        <div 
          className="h-4 w-4 rounded-sm flex items-center justify-center text-xs"
          style={{ backgroundColor: `${teamColor}40` }}
        >
          {positionToShow}
        </div>
        {positionChange === 'improved' && (
          <ChevronUp className="h-3 w-3 text-green-400 -ml-1" />
        )}
        {positionChange === 'worsened' && (
          <ChevronDown className="h-3 w-3 text-red-400 -ml-1" />
        )}
      </div>
      
      {/* Driver Name + Team */}
      <div className="col-span-3 flex items-center overflow-hidden">
        <span className="font-bold text-xs truncate">
          {driver ? driver.name_acronym : `#${position.driver_number}`}
        </span>
      </div>
      
      {/* Last Lap */}
      <div className={cn(
        "col-span-2 font-mono text-xs text-right pr-1",
        driverLap && getLapTimeClass(driverLap.lap_duration, driverBest?.personal, overallBestLap),
        isFirst && driverLap?.lap_duration && "text-purple-400 font-bold"
      )}>
        {driverLap ? formatLapTime(driverLap.lap_duration) : '-'}
      </div>
      
      {/* S1 */}
      <div className={cn(
        "col-span-2 font-mono text-xs text-right pr-1",
        driverLap && getLapTimeClass(driverLap.duration_sector_1, driverBest?.s1_personal, overallBestS1)
      )}>
        {driverLap ? formatLapTime(driverLap.duration_sector_1) : '-'}
      </div>
      
      {/* S2 */}
      <div className={cn(
        "col-span-2 font-mono text-xs text-right pr-1", 
        driverLap && getLapTimeClass(driverLap.duration_sector_2, driverBest?.s2_personal, overallBestS2)
      )}>
        {driverLap ? formatLapTime(driverLap.duration_sector_2) : '-'}
      </div>
      
      {/* S3 */}
      <div className={cn(
        "col-span-2 font-mono text-xs text-right pr-1",
        driverLap && getLapTimeClass(driverLap.duration_sector_3, driverBest?.s3_personal, overallBestS3)
      )}>
        {driverLap ? formatLapTime(driverLap.duration_sector_3) : '-'}
      </div>
    </div>
  );
};

export default DriverPositionRow;
