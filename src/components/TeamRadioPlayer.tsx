
import React, { useState, useRef } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Driver, TeamRadioMessage } from '@/types/f1';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Headphones, Play, Pause, User, Volume2 } from 'lucide-react';

interface TeamRadioPlayerProps {
  teamRadios: TeamRadioMessage[];
  drivers: Driver[];
}

const TeamRadioPlayer: React.FC<TeamRadioPlayerProps> = ({ teamRadios, drivers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRadio, setCurrentRadio] = useState<TeamRadioMessage | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format the date to a nice time format
  const formatDate = (dateString: string) => {
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

  // Find driver info by driver number
  const getDriverInfo = (driverNumber: number) => {
    return drivers.find(driver => driver.driver_number === driverNumber);
  };

  // Play a team radio
  const playTeamRadio = (radio: TeamRadioMessage) => {
    setCurrentRadio(radio);
    
    if (audioRef.current) {
      audioRef.current.src = radio.recording_url;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Error playing team radio:", error);
          setIsPlaying(false);
        });
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing team radio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle audio ended event
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 bg-f1-red hover:bg-f1-red/80"
      >
        <Headphones className="h-4 w-4" />
        <span>Team Radio ({teamRadios.length})</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-f1-navy text-white border-f1-silver/20 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <Headphones className="mr-2" /> Team Radio Messages
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Current playing radio */}
            {currentRadio && (
              <div className="bg-f1-navy/80 border border-f1-silver/30 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  {getDriverInfo(currentRadio.driver_number) ? (
                    <Avatar className="h-12 w-12 border-2" style={{ 
                      borderColor: getDriverInfo(currentRadio.driver_number)?.team_colour || '#ffffff' 
                    }}>
                      {getDriverInfo(currentRadio.driver_number)?.headshot_url ? (
                        <AvatarImage 
                          src={getDriverInfo(currentRadio.driver_number)?.headshot_url} 
                          alt={getDriverInfo(currentRadio.driver_number)?.full_name || ''} 
                        />
                      ) : (
                        <AvatarFallback className="bg-f1-navy/80">
                          <User className="h-6 w-6 text-f1-silver" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                  ) : (
                    <Avatar className="h-12 w-12 border-2 border-f1-silver/30">
                      <AvatarFallback className="bg-f1-navy/80">
                        <User className="h-6 w-6 text-f1-silver" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {getDriverInfo(currentRadio.driver_number)?.full_name || `Driver #${currentRadio.driver_number}`}
                    </h3>
                    <div className="text-sm text-f1-silver/70 flex items-center">
                      <div className="flex items-center">
                        <span>{formatDate(currentRadio.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={togglePlayPause}
                    size="icon"
                    className={cn(
                      "rounded-full",
                      isPlaying ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="mt-3 flex items-center">
                  <Volume2 className="h-4 w-4 mr-2 text-f1-silver/70" />
                  <div className="h-1 flex-1 bg-f1-silver/30 rounded-full overflow-hidden">
                    <div className="h-full bg-f1-red animate-pulse" style={{ width: isPlaying ? '100%' : '0%' }}></div>
                  </div>
                </div>
                
                <audio
                  ref={audioRef}
                  onEnded={handleAudioEnded}
                  className="hidden"
                />
              </div>
            )}
            
            {/* List of all team radio messages */}
            <div className="grid gap-2">
              {teamRadios.length === 0 ? (
                <div className="text-center py-8 text-f1-silver/70">
                  No team radio messages available
                </div>
              ) : (
                teamRadios.map((radio, index) => (
                  <div 
                    key={index}
                    onClick={() => playTeamRadio(radio)}
                    className={cn(
                      "p-3 rounded-lg flex items-center space-x-3 cursor-pointer transition-colors",
                      "border border-f1-silver/20 hover:bg-f1-navy/50",
                      currentRadio === radio && "bg-f1-navy/50 border-f1-red/50"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {getDriverInfo(radio.driver_number) ? (
                        <Avatar className="h-10 w-10 border-2" style={{ 
                          borderColor: getDriverInfo(radio.driver_number)?.team_colour || '#ffffff' 
                        }}>
                          {getDriverInfo(radio.driver_number)?.headshot_url ? (
                            <AvatarImage 
                              src={getDriverInfo(radio.driver_number)?.headshot_url} 
                              alt={getDriverInfo(radio.driver_number)?.full_name || ''} 
                            />
                          ) : (
                            <AvatarFallback className="bg-f1-navy/80">
                              <User className="h-5 w-5 text-f1-silver" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      ) : (
                        <Avatar className="h-10 w-10 border-2 border-f1-silver/30">
                          <AvatarFallback className="bg-f1-navy/80">
                            <User className="h-5 w-5 text-f1-silver" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">
                        {getDriverInfo(radio.driver_number)?.name_acronym || `#${radio.driver_number}`}
                      </div>
                      <div className="text-sm text-f1-silver/70">
                        {formatDate(radio.date)}
                      </div>
                    </div>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      className="flex-shrink-0 h-8 w-8 rounded-full bg-f1-silver/10 hover:bg-f1-silver/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTeamRadio(radio);
                      }}
                    >
                      {currentRadio === radio && isPlaying ? 
                        <Pause className="h-4 w-4" /> : 
                        <Play className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeamRadioPlayer;
