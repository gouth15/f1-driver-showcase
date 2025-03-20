
import React, { useState } from 'react';
import { Driver } from '@/types/f1';
import { cn } from '@/lib/utils';

interface DriverCardProps {
  driver: Driver;
  flagUrl?: string;
}

const DriverCard: React.FC<DriverCardProps> = ({ driver, flagUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [flagLoaded, setFlagLoaded] = useState(false);
  const teamColor = `#${driver.team_colour}`;
  
  return (
    <div 
      className="relative overflow-hidden rounded-2xl glass transition-all duration-300 hover:translate-y-[-5px] group"
    >
      {/* Team color accent at top */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: teamColor }}></div>
      
      <div className="p-6">
        {/* Driver number and nationality */}
        <div className="flex justify-between items-start mb-5">
          <div 
            className="text-3xl font-bold font-display opacity-70"
            style={{ color: teamColor }}
          >
            {driver.driver_number}
          </div>
          
          <div className="flex items-center uppercase text-xs font-medium bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            {flagUrl ? (
              <div className="mr-2 w-5 h-3 relative overflow-hidden rounded-sm">
                <img 
                  src={flagUrl} 
                  alt={driver.country_code || 'Flag'} 
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    flagLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setFlagLoaded(true)}
                />
                {!flagLoaded && <div className="absolute inset-0 bg-black/10 animate-pulse"></div>}
              </div>
            ) : null}
            {driver.country_code || 'N/A'}
          </div>
        </div>
        
        {/* Driver image with blur-up loading */}
        <div className="relative mx-auto w-32 h-32 mb-6 rounded-full overflow-hidden bg-black/20">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-black/10 animate-pulse"></div>
          )}
          <img
            src={driver.headshot_url}
            alt={driver.full_name}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        
        {/* Driver name and team */}
        <div className="text-center">
          <h3 className="font-bold text-xl mb-1 text-white tracking-tight">
            {driver.first_name} <span className="uppercase">{driver.last_name}</span>
          </h3>
          
          <div className="flex items-center justify-center mb-4">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: teamColor }}
            ></div>
            <p className="text-f1-silver/80 text-sm font-medium">
              {driver.team_name}
            </p>
          </div>
          
          {/* Driver acronym */}
          <div 
            className="inline-block py-1 px-3 rounded-md text-sm font-bold"
            style={{ backgroundColor: teamColor, color: "#FFF" }}
          >
            {driver.name_acronym}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
