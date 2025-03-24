
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
      <div className="col-span-1 font-bold flex items-center">
        <span className="flex items-center justify-center text-sm">
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
};

export default DriverPositionRow;
