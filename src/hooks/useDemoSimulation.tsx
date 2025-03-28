
import { useEffect, useCallback } from 'react';
import { RaceControlMessage, DriverPosition, Driver, LapData, DemoState } from '@/types/f1';
import { useToast } from "@/hooks/use-toast";
import { useTimelineData } from '@/hooks/useTimelineData';
import { useSimulationState } from '@/hooks/useSimulationState';
import {
  createEmptyDemoState,
  createInitialPositions,
  createInitialLapData,
  initializeDemoState
} from '@/services/f1DataService';

export function useDemoSimulation() {
  const {
    driversDataRef,
    positionsDataRef,
    lapDataRef,
    messagesDataRef,
    dataIndexRef,
    sortedDataRef,
    setApiData: setTimelineData,
    processTimelineData,
    resetDataIndex
  } = useTimelineData();

  const {
    demoState,
    setDemoState,
    previousPositions,
    setPreviousPositions,
    isRunning,
    setIsRunning,
    speed,
    setSpeed,
    isLoading,
    setIsLoading,
    intervalRef,
    lastMessageTimeRef,
    setupIntervalUpdates
  } = useSimulationState();
  
  const { toast } = useToast();

  const initializeState = useCallback(() => {
    if (driversDataRef.current.length === 0) return;
    
    // Initialize with first set of data
    const initialState = initializeDemoState(
      driversDataRef.current,
      positionsDataRef.current,
      lapDataRef.current,
      messagesDataRef.current
    );
    
    setDemoState(initialState);
    
    // Store initial positions for animation
    const positionMap: Record<number, number> = {};
    initialState.positions.forEach(pos => {
      positionMap[pos.driver_number] = pos.position;
    });
    setPreviousPositions(positionMap);
    
    // Reset data index and process timeline data
    resetDataIndex();
    processTimelineData();
  }, [processTimelineData, resetDataIndex, setDemoState, setPreviousPositions]);

  const setApiData = useCallback((data: {
    drivers: Driver[],
    positions: DriverPosition[],
    laps: LapData[],
    messages: RaceControlMessage[]
  }) => {
    setTimelineData(data);
  }, [setTimelineData]);

  const updateSimulation = useCallback(() => {
    // Skip update if no data has been loaded or we've processed all data
    if (
      driversDataRef.current.length === 0 || 
      sortedDataRef.current.length === 0 ||
      dataIndexRef.current >= sortedDataRef.current.length
    ) {
      // Loop back to beginning if we've reached the end
      dataIndexRef.current = 0;
      return;
    }
    
    // Store current positions for animation
    setDemoState(prevState => {
      const currentPositionMap: Record<number, number> = {};
      prevState.positions.forEach(dp => {
        currentPositionMap[dp.driver_number] = dp.position;
      });
      
      setPreviousPositions(currentPositionMap);
      
      // Determine how many items to process based on speed
      const itemsToProcess = Math.min(speed, 3);
      let newPositions = [...prevState.positions];
      let newLapData = { ...prevState.lapData };
      let newMessages = [...prevState.messages];
      
      // Process the next batch of items
      for (let i = 0; i < itemsToProcess; i++) {
        if (dataIndexRef.current >= sortedDataRef.current.length) {
          dataIndexRef.current = 0;
          break;
        }
        
        const currentItem = sortedDataRef.current[dataIndexRef.current];
        
        switch (currentItem.type) {
          case 'position': {
            const posData = currentItem.data as DriverPosition;
            const driverIdx = newPositions.findIndex(p => p.driver_number === posData.driver_number);
            
            if (driverIdx !== -1) {
              // Update this driver's position
              newPositions[driverIdx] = {
                ...newPositions[driverIdx],
                position: posData.position,
                date: new Date().toISOString() // Use current time for smooth animation
              };
            }
            
            // Resort by position
            newPositions.sort((a, b) => a.position - b.position);
            break;
          }
          
          case 'lap': {
            const lapData = currentItem.data as LapData;
            newLapData[lapData.driver_number] = lapData;
            break;
          }
          
          case 'message': {
            const message = currentItem.data as RaceControlMessage;
            const now = new Date().toISOString();
            
            newMessages = [
              {
                date: now,
                message: message.message,
                category: message.category || "Race Control",
                flag: message.flag || "none"
              },
              ...newMessages
            ];
            
            if (lastMessageTimeRef.current !== now) {
              toast({
                title: "Race Control",
                description: message.message,
                duration: 5000,
              });
              
              lastMessageTimeRef.current = now;
            }
            break;
          }
        }
        
        dataIndexRef.current++;
      }
      
      return {
        drivers: prevState.drivers,
        positions: newPositions,
        lapData: newLapData,
        messages: newMessages
      };
    });
  }, [
    dataIndexRef,
    driversDataRef,
    setPreviousPositions,
    sortedDataRef,
    speed,
    toast
  ]);

  const resetDemo = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setPreviousPositions({});
    resetDataIndex();
    initializeState();
    lastMessageTimeRef.current = null;
    
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        updateSimulation();
      }, 2000 / speed);
    }
  }, [
    initializeState,
    intervalRef,
    isRunning,
    resetDataIndex,
    setPreviousPositions,
    speed,
    updateSimulation
  ]);

  // Setup interval for automatic updates
  useEffect(() => {
    setupIntervalUpdates(updateSimulation);
    
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, speed, updateSimulation, setupIntervalUpdates, intervalRef]);

  return {
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
    lapDataCount: lapDataRef.current.length
  };
}
