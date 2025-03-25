
import { useState, useEffect, useCallback, useRef } from 'react';
import { RaceControlMessage, DriverPosition, Driver, LapData, DemoState } from '@/types/f1';
import { useToast } from "@/hooks/use-toast";
import {
  createEmptyDemoState,
  createInitialPositions,
  createInitialLapData,
  initializeDemoState
} from '@/services/f1DataService';

export function useDemoSimulation() {
  const [demoState, setDemoState] = useState<DemoState>(createEmptyDemoState());
  const [previousPositions, setPreviousPositions] = useState<Record<number, number>>({});
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1); // 1 = normal, 2 = 2x speed, etc.
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  
  // API data storage
  const driversDataRef = useRef<Driver[]>([]);
  const positionsDataRef = useRef<DriverPosition[]>([]);
  const lapDataRef = useRef<LapData[]>([]);
  const messagesDataRef = useRef<RaceControlMessage[]>([]);
  
  // Single, unified data index for sequential processing
  const dataIndexRef = useRef<number>(0);
  
  // Array to hold all data items sorted by date
  const sortedDataRef = useRef<Array<{type: 'position' | 'lap' | 'message', data: any}>>([]);
  
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
    
    // Reset data index
    dataIndexRef.current = 0;
    
    // Sort and combine all data into a unified timeline
    const allDataItems: Array<{type: 'position' | 'lap' | 'message', data: any}> = [
      ...positionsDataRef.current.map(item => ({
        type: 'position' as const,
        data: item,
        date: new Date(item.date).getTime()
      })),
      ...lapDataRef.current.map(item => ({
        type: 'lap' as const,
        data: item,
        date: new Date(item.date_start).getTime()
      })),
      ...messagesDataRef.current.map(item => ({
        type: 'message' as const,
        data: item,
        date: new Date(item.date).getTime()
      }))
    ];
    
    // Sort by date
    allDataItems.sort((a, b) => a.date - b.date);
    
    sortedDataRef.current = allDataItems;
    console.log(`Initialized ${allDataItems.length} data items in timeline`);
  }, []);

  const setApiData = useCallback((data: {
    drivers: Driver[],
    positions: DriverPosition[],
    laps: LapData[],
    messages: RaceControlMessage[]
  }) => {
    driversDataRef.current = data.drivers;
    positionsDataRef.current = data.positions;
    lapDataRef.current = data.laps;
    messagesDataRef.current = data.messages;
    
    // Reset data index
    dataIndexRef.current = 0;
  }, []);

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
  }, [toast]);

  const resetDemo = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setPreviousPositions({});
    
    // Reset data index
    dataIndexRef.current = 0;
    
    initializeState();
    lastMessageTimeRef.current = null;
    
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        updateSimulation();
      }, 2000 / speed);
    }
  }, [initializeState, isRunning, speed, updateSimulation]);

  useEffect(() => {
    if (isRunning) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      
      intervalRef.current = window.setInterval(() => {
        updateSimulation();
      }, 2000 / speed);
    } else if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, speed, updateSimulation]);

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
