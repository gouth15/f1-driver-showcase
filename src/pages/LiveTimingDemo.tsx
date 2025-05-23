
import React, { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import DemoControls from '@/components/demo/DemoControls';
import DriverPositionsList from '@/components/demo/DriverPositionsList';
import { useDemoSimulation } from '@/hooks/useDemoSimulation';
import { fetchF1Data } from '@/services/f1DataService';
import { BellRing, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

const LiveTimingDemo: React.FC = () => {
  const {
    demoState,
    previousPositions,
    isRunning,
    speed,
    isLoading,
    setIsLoading,
    setApiData,
    initializeState,
    updateSimulation,
    resetDemo,
    setIsRunning,
    setSpeed,
    lapDataCount
  } = useDemoSimulation();
  
  const { toast } = useToast();
  
  const fetchApiData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchF1Data();
      
      // Store fetched data
      setApiData({
        drivers: data.drivers,
        positions: data.positions,
        laps: data.laps,
        messages: data.messages
      });
      
      // Initialize the demo state with the first data points
      initializeState();
      
      const totalDataPoints = data.positions.length + data.laps.length + data.messages.length;
      
      toast({
        title: "Data Loaded",
        description: `Loaded ${data.drivers.length} drivers and ${totalDataPoints} total data points for simulation`,
        duration: 3000,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching API data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API data. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchApiData();
  }, []);
  
  const handleSpeedChange = () => {
    setSpeed(speed === 3 ? 1 : speed + 1);
  };

  // Format time for race control message
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
  
  return (
    <div className="min-h-screen bg-f1-navy text-white overflow-hidden">
      <Navbar />
      
      <div className="h-14"></div>
      
      {/* Race Control Message - Animated Banner */}
      {demoState.messages.length > 0 && (
        <div className="sticky top-14 z-40 w-full animate-fade-in">
          <div className={cn(
            "bg-gradient-to-r from-purple-700 via-blue-600 to-purple-700 shadow-lg",
            "border-t border-b border-purple-400/50 py-2 px-3",
            "animate-enter pulse"
          )}>
            <div className="flex items-center justify-between container mx-auto max-w-7xl">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  {demoState.messages[0].flag === "yellow" ? (
                    <Flag className="h-5 w-5 text-yellow-300" />
                  ) : demoState.messages[0].flag === "red" ? (
                    <Flag className="h-5 w-5 text-red-500" />
                  ) : (
                    <BellRing className="h-5 w-5 text-yellow-300 animate-pulse" />
                  )}
                </div>
                <div className="font-bold text-sm">
                  Race Control | {formatTime(demoState.messages[0].date)}
                </div>
              </div>
              <div className="text-white text-sm font-medium flex-1 ml-4">
                {demoState.messages[0].message}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-2 py-1 max-h-[calc(100vh-70px)] overflow-hidden">
        <DemoControls 
          isRunning={isRunning}
          speed={speed}
          isLoading={isLoading}
          onToggleRunning={() => setIsRunning(!isRunning)}
          onSpeedChange={handleSpeedChange}
          onStepForward={updateSimulation}
          onReset={resetDemo}
          onReloadData={fetchApiData}
        />
        
        <div className="text-xs font-mono bg-f1-navy/60 px-2 py-1 rounded mb-1 flex justify-between">
          <span>{lapDataCount > 0 ? `Using real F1 data (session_key=9994)` : 'No data loaded'}</span>
          <span className="text-f1-silver/70">Sequential Data Demo</span>
        </div>
        
        <div className="max-h-[calc(100vh-150px)] overflow-hidden">
          {demoState.positions.length > 0 && (
            <DriverPositionsList 
              positions={demoState.positions}
              drivers={demoState.drivers}
              lapData={demoState.lapData}
              previousPositions={previousPositions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTimingDemo;
