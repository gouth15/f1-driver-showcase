
import React, { useState, useEffect } from 'react';
import { DriverPosition } from '@/types/f1';
import { ChevronUp, ChevronDown, Flag, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PositionCardProps {
  position: DriverPosition;
  isLeader?: boolean;
  positionChange: 'improved' | 'worsened' | 'unchanged';
}

const PositionCard: React.FC<PositionCardProps> = ({ 
  position, 
  isLeader = false,
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
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md",
        isLeader ? "bg-yellow-950/30 border-yellow-500/50" : "bg-f1-navy/60 border-f1-silver/20",
        isNew && "animate-pulse",
        positionChange === 'improved' && "border-l-green-500 border-l-4",
        positionChange === 'worsened' && "border-l-red-500 border-l-4"
      )}
    >
      <CardContent className="p-4">
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
        
        {/* Driver number */}
        <div className="mt-3">
          <div className="text-lg font-bold">
            Driver #{position.driver_number}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionCard;
