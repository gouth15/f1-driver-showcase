
import React, { useState, useEffect } from 'react';
import { DriverPosition, Driver } from '@/types/f1';
import { ChevronUp, ChevronDown, Flag, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PositionCardProps {
  position: DriverPosition;
  driver?: Driver;
  isLeader?: boolean;
  positionChange: 'improved' | 'worsened' | 'unchanged';
  layout?: 'card' | 'row';
}

const PositionCard: React.FC<PositionCardProps> = ({ 
  position, 
  driver,
  isLeader = false,
  positionChange,
  layout = 'card'
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

  if (layout === 'row') {
    return (
      <div 
        className={cn(
          "flex items-center p-3 rounded-lg mb-2 transition-all duration-300 hover:bg-white/5",
          isLeader ? "bg-yellow-950/30 border border-yellow-500/50" : "bg-f1-navy/60 border border-f1-silver/20",
          isNew && "animate-pulse",
          positionChange === 'improved' && "border-l-green-500 border-l-4",
          positionChange === 'worsened' && "border-l-red-500 border-l-4"
        )}
      >
        {/* Position number */}
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg shrink-0",
          isLeader ? "bg-yellow-500 text-black" : "bg-white/10 text-white"
        )}>
          {position.position}
        </div>
        
        {/* Driver info */}
        <div className="ml-3 flex-grow">
          <div className="flex items-center">
            <div className="text-lg font-bold">
              {driver ? `${driver.name_acronym} (${position.driver_number})` : `Driver #${position.driver_number}`}
            </div>
            
            {isLeader && (
              <Badge variant="outline" className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500">
                <Flag className="h-3 w-3 mr-1" />
                Leader
              </Badge>
            )}
          </div>
          
          {driver && (
            <div className="text-sm text-f1-silver/80">
              {driver.team_name}
            </div>
          )}
        </div>
        
        {/* Position change and time */}
        <div className="flex flex-col items-end shrink-0">
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
    );
  }
  
  // Default card layout
  return (
    <div 
      className={cn(
        "p-4 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md",
        isLeader ? "bg-yellow-950/30 border border-yellow-500/50" : "bg-f1-navy/60 border border-f1-silver/20",
        isNew && "animate-pulse",
        positionChange === 'improved' && "border-l-green-500 border-l-4",
        positionChange === 'worsened' && "border-l-red-500 border-l-4"
      )}
    >
      <div className="flex items-center justify-between">
        {/* Position number */}
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl",
          isLeader ? "bg-yellow-500 text-black" : "bg-white/10 text-white"
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
          {isLeader && (
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
              <Flag className="h-3 w-3 mr-1" />
              Leader
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
      </div>
    </div>
  );
};

export default PositionCard;
