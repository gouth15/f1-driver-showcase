
import React, { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import DemoControls from '@/components/demo/DemoControls';
import DriverPositionsList from '@/components/demo/DriverPositionsList';
import { useDemoSimulation } from '@/hooks/useDemoSimulation';
import { fetchF1Data } from '@/services/f1DataService';

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
      
      toast({
        title: "Data Loaded",
        description: `Loaded ${data.drivers.length} drivers, ${data.positions.length} position updates, ${data.laps.length} lap entries, and ${data.messages.length} messages for simulation`,
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
  
  return (
    <div className="min-h-screen bg-f1-navy text-white">
      <Navbar />
      
      <div className="h-16"></div>
      
      <div className="container mx-auto px-2 py-2">
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
        
        <div className="text-xs font-mono bg-f1-navy/60 px-2 py-1 rounded mb-2 flex justify-between">
          <span>{lapDataCount > 0 ? `Using ${lapDataCount} real data points` : 'No data loaded'}</span>
          <span className="text-f1-silver/70">Data-Driven Demo</span>
        </div>
        
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
  );
};

export default LiveTimingDemo;
