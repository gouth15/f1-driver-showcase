
import React, { useEffect, useState } from 'react';
import { Driver, LapData, DriverPosition } from '@/types/f1';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DriverPositionRowProps {
  position: DriverPosition;
  driver: Driver | undefined;
  positionChange: 'improved' | 'worsened' | 'unchanged';
  driverLap: LapData | undefined;
}

const DriverPositionRow: React.FC<DriverPositionRowProps> = ({
  position,
  driver,
  positionChange,
  driverLap
}) => {
  const teamColor = driver?.team_colour ? `#${driver.team_colour}` : '#FFFFFF';
  const [animatePosition, setAnimatePosition] = useState(false);
  
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

  return (
    <div 
      className={cn(
        "grid grid-cols-12 gap-1 p-2 rounded-md border-l-4 items-center transition-all",
        "bg-f1-navy/60 border-f1-silver/20 h-10 relative",
        animatePosition && positionChange === 'improved' && "animate-position-improved",
        animatePosition && positionChange === 'worsened' && "animate-position-worsened"
      )}
      style={{ 
        borderLeftColor: teamColor,
      }}
    >
      {/* Position + Change Indicator */}
      <div className="col-span-1 font-bold">
        {position.position}
        {positionChange === 'improved' && (
          <ChevronUp className="h-3 w-3 text-green-400 inline ml-1" />
        )}
        {positionChange === 'worsened' && (
          <ChevronDown className="h-3 w-3 text-red-400 inline ml-1" />
        )}
      </div>
      
      {/* Driver Name + Team */}
      <div className="col-span-3 flex items-center">
        <div 
          className="h-5 w-1 rounded-sm mr-1"
          style={{ backgroundColor: teamColor }}
        ></div>
        <span className="font-bold text-sm">
          {driver ? driver.name_acronym : `#${position.driver_number}`}
        </span>
      </div>
      
      {/* Last Lap */}
      <div className="col-span-2 font-mono text-xs">
        {driverLap ? formatLapTime(driverLap.lap_duration) : '-'}
      </div>
      
      {/* S1 */}
      <div className="col-span-2 font-mono text-xs">
        {driverLap ? formatLapTime(driverLap.duration_sector_1) : '-'}
      </div>
      
      {/* S2 */}
      <div className="col-span-2 font-mono text-xs">
        {driverLap ? formatLapTime(driverLap.duration_sector_2) : '-'}
      </div>
      
      {/* S3 */}
      <div className="col-span-2 font-mono text-xs">
        {driverLap ? formatLapTime(driverLap.duration_sector_3) : '-'}
      </div>
    </div>
  );
};

export default DriverPositionRow;
