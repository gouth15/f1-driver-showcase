
import { useRef, useCallback } from 'react';
import { Driver, DriverPosition, LapData, RaceControlMessage } from '@/types/f1';

// Define the data item type with date property
export interface DataItem {
  type: 'position' | 'lap' | 'message';
  data: any;
  date: number; // Timestamp for sorting
}

export function useTimelineData() {
  // API data storage
  const driversDataRef = useRef<Driver[]>([]);
  const positionsDataRef = useRef<DriverPosition[]>([]);
  const lapDataRef = useRef<LapData[]>([]);
  const messagesDataRef = useRef<RaceControlMessage[]>([]);
  
  // Data index for sequential processing
  const dataIndexRef = useRef<number>(0);
  
  // Array to hold all data items sorted by date
  const sortedDataRef = useRef<DataItem[]>([]);

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

  const processTimelineData = useCallback(() => {
    // Sort and combine all data into a unified timeline
    const allDataItems: DataItem[] = [
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
    console.log(`Processed ${allDataItems.length} data items in timeline`);
  }, []);

  const resetDataIndex = useCallback(() => {
    dataIndexRef.current = 0;
  }, []);

  return {
    driversDataRef,
    positionsDataRef,
    lapDataRef,
    messagesDataRef,
    dataIndexRef,
    sortedDataRef,
    setApiData,
    processTimelineData,
    resetDataIndex
  };
}
