
import React, { useState, useEffect } from 'react';
import { DriverPosition, Driver } from '@/types/f1';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PositionCardProps {
  position: DriverPosition;
  driver?: Driver;
  positionChange: 'improved' | 'worsened' | 'unchanged';
}

const PositionCard: React.FC<PositionCardProps> = ({ 
  position, 
  driver,
  positionChange
}) => {
  const [isNew, setIsNew] = useState(true);
  
  useEffect(() => {
    // Briefly highlight new/updated positions
    setIsNew(true);
    const timer = setTimeout(() => setIsNew(false), 2000);
    
    return () => clearTimeout(timer);
  }, [position.position]);
  
  // Format the position date
  const formattedTime = new Date(position.date).toLocaleTimeString();
  
  // Get team color for styling
  const teamColor = driver?.team_colour || '#FFFFFF';

  return (
    <div 
      className={cn(
        "p-4 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md",
        "bg-f1-navy/60 border border-f1-silver/20",
        isNew && "animate-pulse",
        positionChange === 'improved' && "border-l-green-500 border-l-4",
        positionChange === 'worsened' && "border-l-red-500 border-l-4"
      )}
    >
      <div className="flex items-center justify-between">
        {/* Position number */}
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl",
          "bg-white/10 text-white"
        )}>
          {position.position}
        </div>
        
        {/* Position change indicator */}
        <div className="flex flex-col items-end">
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
            {formattedTime}
          </div>
        </div>
      </div>
      
      {/* Driver info */}
      <div className="mt-3">
        <div className="text-lg font-bold">
          {driver ? (
            <span>{driver.name_acronym} ({position.driver_number})</span>
          ) : (
            <span>Driver #{position.driver_number}</span>
          )}
        </div>
        {driver && (
          <div className="text-sm text-f1-silver/80">
            {driver.team_name}
          </div>
        )}
        
        {/* Driver team indicator */}
        {driver && (
          <div className="mt-2">
            <div 
              className="inline-block py-1 px-2 rounded text-xs"
              style={{ 
                backgroundColor: `${teamColor}20`,
                color: teamColor,
                border: `1px solid ${teamColor}40`
              }}
            >
              {driver.team_name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionCard;
