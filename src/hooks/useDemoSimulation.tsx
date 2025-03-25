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
  
  // Current index for iterating through position data
  const positionIndexRef = useRef<number>(0);
  // Track the last time we processed a message
  const lapIndexRef = useRef<number>(0);
  // Track the message data index
  const messageIndexRef = useRef<number>(0);
  
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
    
    // Reset all indexes
    positionIndexRef.current = 0;
    lapIndexRef.current = 0;
    messageIndexRef.current = 0;
  }, []);

  const setApiData = useCallback((data: {
    drivers: Driver[],
    positions: DriverPosition[],
    laps: LapData[],
    messages: RaceControlMessage[]
  }) => {
    driversDataRef.current = data.drivers;
    
    // Sort positions by date for proper time sequencing
    positionsDataRef.current = data.positions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Sort laps by date for proper time sequencing
    lapDataRef.current = data.laps.sort((a, b) => 
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
    );
    
    // Sort messages by date
    messagesDataRef.current = data.messages.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Reset all indexes
    positionIndexRef.current = 0;
    lapIndexRef.current = 0;
    messageIndexRef.current = 0;
  }, []);

  const updateSimulation = useCallback(() => {
    // Skip update if no data has been loaded
    if (
      driversDataRef.current.length === 0 || 
      positionsDataRef.current.length === 0
    ) return;
    
    setDemoState(prevState => {
      // Store current positions for animation
      const currentPositionMap: Record<number, number> = {};
      prevState.positions.forEach(dp => {
        currentPositionMap[dp.driver_number] = dp.position;
      });
      
      setPreviousPositions(currentPositionMap);
      
      // Get next batch of position data (move this index forward)
      const positionBatchSize = Math.min(3, positionsDataRef.current.length - positionIndexRef.current);
      const nextPositionIndex = Math.min(
        positionIndexRef.current + positionBatchSize, 
        positionsDataRef.current.length - 1
      );
      
      // Get positions for this time slice
      const currentPositionData = positionsDataRef.current.slice(
        positionIndexRef.current, 
        nextPositionIndex
      );
      
      // Update position index for next time
      positionIndexRef.current = nextPositionIndex;
      
      // If we've reached the end, loop back to the beginning
      if (positionIndexRef.current >= positionsDataRef.current.length - 1) {
        positionIndexRef.current = 0;
      }
      
      // Process the new position data
      let newPositions = [...prevState.positions];
      
      // Update positions based on real data if available
      if (currentPositionData.length > 0) {
        const latestByDriver = new Map<number, DriverPosition>();
        
        // Get latest position update for each driver in this batch
        currentPositionData.forEach(pos => {
          const existing = latestByDriver.get(pos.driver_number);
          if (!existing || new Date(pos.date) > new Date(existing.date)) {
            latestByDriver.set(pos.driver_number, pos);
          }
        });
        
        // Apply the latest position updates
        latestByDriver.forEach((newPos) => {
          const driverIdx = newPositions.findIndex(p => p.driver_number === newPos.driver_number);
          
          if (driverIdx !== -1) {
            // Update this driver's position
            newPositions[driverIdx] = {
              ...newPositions[driverIdx],
              position: newPos.position,
              date: new Date().toISOString() // Use current time for smooth animation
            };
          }
        });
        
        // Resort by position
        newPositions.sort((a, b) => a.position - b.position);
      }
      
      // Get lap data for this time slice
      const lapBatchSize = Math.min(2, lapDataRef.current.length - lapIndexRef.current);
      const nextLapIndex = Math.min(
        lapIndexRef.current + lapBatchSize, 
        lapDataRef.current.length - 1
      );
      
      const currentLapData = lapDataRef.current.slice(
        lapIndexRef.current, 
        nextLapIndex
      );
      
      // Update lap index for next time
      lapIndexRef.current = nextLapIndex;
      
      // If we've reached the end, loop back to the beginning
      if (lapIndexRef.current >= lapDataRef.current.length - 1) {
        lapIndexRef.current = 0;
      }
      
      // Process the new lap data
      const newLapData = { ...prevState.lapData };
      
      currentLapData.forEach(lap => {
        newLapData[lap.driver_number] = lap;
      });
      
      // Get message data for this time slice
      let newMessages = [...prevState.messages];
      if (messagesDataRef.current.length > 0 && Math.random() > 0.7) {
        const nextMessageIndex = Math.min(
          messageIndexRef.current + 1, 
          messagesDataRef.current.length - 1
        );
        
        const newMessage = messagesDataRef.current[messageIndexRef.current];
        
        // Update message index for next time
        messageIndexRef.current = nextMessageIndex;
        
        // If we've reached the end, loop back to the beginning
        if (messageIndexRef.current >= messagesDataRef.current.length - 1) {
          messageIndexRef.current = 0;
        }
        
        if (newMessage) {
          const now = new Date().toISOString();
          
          newMessages = [
            {
              date: now,
              message: newMessage.message,
              category: newMessage.category || "Race Control",
              flag: newMessage.flag || "none"
            },
            ...newMessages
          ];
          
          if (lastMessageTimeRef.current !== now) {
            toast({
              title: "Race Control",
              description: newMessage.message,
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
    
    // Reset all indexes
    positionIndexRef.current = 0;
    lapIndexRef.current = 0;
    messageIndexRef.current = 0;
    
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

