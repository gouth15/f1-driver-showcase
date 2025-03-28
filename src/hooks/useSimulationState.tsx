
import { useState, useRef, useEffect, useCallback } from 'react';
import { DemoState } from '@/types/f1';
import { createEmptyDemoState } from '@/services/f1DataService';

export function useSimulationState() {
  const [demoState, setDemoState] = useState<DemoState>(createEmptyDemoState());
  const [previousPositions, setPreviousPositions] = useState<Record<number, number>>({});
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1); // 1 = normal, 2 = 2x speed, etc.
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);

  // Start/stop the simulation when isRunning or speed changes
  const setupIntervalUpdates = useCallback((updateFunction: () => void) => {
    if (isRunning) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      
      intervalRef.current = window.setInterval(() => {
        updateFunction();
      }, 2000 / speed);
    } else if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning, speed]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
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
  };
}
