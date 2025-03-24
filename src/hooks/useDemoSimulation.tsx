
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
  
  const dataIndexRef = useRef<number>(0);
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
    
    // Reset index
    dataIndexRef.current = 0;
  }, []);

  const updateSimulation = useCallback(() => {
    // Skip update if no data has been loaded
    if (
      driversDataRef.current.length === 0 || 
      lapDataRef.current.length === 0
    ) return;
    
    // Update data index
    dataIndexRef.current = (dataIndexRef.current + 1) % lapDataRef.current.length;
    
    setDemoState(prevState => {
      // Store current positions for animation
      const currentPositionMap: Record<number, number> = {};
      prevState.positions.forEach(dp => {
        currentPositionMap[dp.driver_number] = dp.position;
      });
      
      setPreviousPositions(currentPositionMap);
      
      // Get current lap data based on index
      const currentLapData = lapDataRef.current[dataIndexRef.current];
      
      // Update positions randomly
      let newPositions = [...prevState.positions];
      if (Math.random() > 0.5) {
        const idx1 = Math.floor(Math.random() * newPositions.length);
        let idx2 = Math.floor(Math.random() * newPositions.length);
        while (idx2 === idx1) {
          idx2 = Math.floor(Math.random() * newPositions.length);
        }
        
        const pos1 = newPositions[idx1].position;
        const pos2 = newPositions[idx2].position;
        
        newPositions[idx1] = {
          ...newPositions[idx1],
          position: pos2,
          date: new Date().toISOString()
        };
        
        newPositions[idx2] = {
          ...newPositions[idx2],
          position: pos1,
          date: new Date().toISOString()
        };
        
        newPositions.sort((a, b) => a.position - b.position);
      }
      
      // Update lap data for a random driver
      const randomDriverIndex = Math.floor(Math.random() * prevState.drivers.length);
      const randomDriverNumber = prevState.drivers[randomDriverIndex]?.driver_number;
      
      const newLapData = { ...prevState.lapData };
      if (randomDriverNumber && currentLapData) {
        newLapData[randomDriverNumber] = {
          ...currentLapData,
          driver_number: randomDriverNumber
        };
      }
      
      // Maybe add a new race control message
      let newMessages = [...prevState.messages];
      if (Math.random() > 0.8 && messagesDataRef.current.length > 0) {
        const randomMessageIndex = Math.floor(Math.random() * messagesDataRef.current.length);
        const randomMessage = messagesDataRef.current[randomMessageIndex];
        const now = new Date().toISOString();
        
        if (randomMessage) {
          newMessages = [
            {
              date: now,
              message: randomMessage.message,
              category: randomMessage.category || "Race Control",
              flag: randomMessage.flag || "none"
            },
            ...newMessages
          ];
          
          if (lastMessageTimeRef.current !== now) {
            toast({
              title: "Race Control",
              description: randomMessage.message,
              duration: 5000,
            });
            
            lastMessageTimeRef.current = now;
          }
        }
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
