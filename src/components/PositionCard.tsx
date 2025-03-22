
import React, { useState, useEffect } from 'react';
import { DriverPosition, Driver } from '@/types/f1';
import { ChevronUp, ChevronDown, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
        "p-4 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md w-full",
        "bg-f1-navy/60 border border-f1-silver/20 flex items-center",
        isNew && "animate-pulse",
        positionChange === 'improved' && "border-l-green-500 border-l-4",
        positionChange === 'worsened' && "border-l-red-500 border-l-4"
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
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default PositionCard;
