
import React, { useEffect, useState } from 'react';
import { Driver, DriverPosition, LapData } from '@/types/f1';
import DriverPositionRow from './DriverPositionRow';

interface DriverPositionsListProps {
  positions: DriverPosition[];
  drivers: Driver[];
  lapData: Record<number, LapData>;
  previousPositions: Record<number, number>;
}

const DriverPositionsList: React.FC<DriverPositionsListProps> = ({
  positions,
  drivers,
  lapData,
  previousPositions
}) => {
  const [animatingItems, setAnimatingItems] = useState<number[]>([]);
  const [bestLapTimes, setBestLapTimes] = useState<Record<number, {
    overall: number | null;
    personal: number | null;
    s1_overall: number | null;
    s1_personal: number | null;
    s2_overall: number | null;
    s2_personal: number | null;
    s3_overall: number | null;
    s3_personal: number | null;
  }>>({});
  const [overallBestLap, setOverallBestLap] = useState<number | null>(null);
  const [overallBestS1, setOverallBestS1] = useState<number | null>(null);
  const [overallBestS2, setOverallBestS2] = useState<number | null>(null);
  const [overallBestS3, setOverallBestS3] = useState<number | null>(null);

  useEffect(() => {
    // Collect all drivers with position changes
    const changedDrivers: number[] = [];
    positions.forEach(pos => {
      const prevPos = previousPositions[pos.driver_number];
      if (prevPos !== undefined && prevPos !== pos.position) {
        changedDrivers.push(pos.driver_number);
      }
    });
    
    if (changedDrivers.length > 0) {
      setAnimatingItems(changedDrivers);
      const timer = setTimeout(() => {
        setAnimatingItems([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [positions, previousPositions]);

  // Track best lap times
  useEffect(() => {
    // Create a copy of current best times
    const updatedBestLapTimes = { ...bestLapTimes };
    let newOverallBestLap = overallBestLap;
    let newOverallBestS1 = overallBestS1;
    let newOverallBestS2 = overallBestS2;
    let newOverallBestS3 = overallBestS3;
    
    // Check for new best times
    Object.entries(lapData).forEach(([driverNumber, lap]) => {
      const driverNum = parseInt(driverNumber);
      
      // Initialize driver best times if not present
      if (!updatedBestLapTimes[driverNum]) {
        updatedBestLapTimes[driverNum] = {
          overall: null,
          personal: null,
          s1_overall: null,
          s1_personal: null,
          s2_overall: null,
          s2_personal: null,
          s3_overall: null,
          s3_personal: null
        };
      }
      
      // Update personal best lap time
      if (lap.lap_duration && (!updatedBestLapTimes[driverNum].personal || lap.lap_duration < updatedBestLapTimes[driverNum].personal!)) {
        updatedBestLapTimes[driverNum].personal = lap.lap_duration;
        
        // Check if it's also the overall best
        if (!newOverallBestLap || lap.lap_duration < newOverallBestLap) {
          newOverallBestLap = lap.lap_duration;
          updatedBestLapTimes[driverNum].overall = lap.lap_duration;
        }
      }
      
      // Update sector times similarly
      if (lap.duration_sector_1) {
        if (!updatedBestLapTimes[driverNum].s1_personal || lap.duration_sector_1 < updatedBestLapTimes[driverNum].s1_personal!) {
          updatedBestLapTimes[driverNum].s1_personal = lap.duration_sector_1;
          if (!newOverallBestS1 || lap.duration_sector_1 < newOverallBestS1) {
            newOverallBestS1 = lap.duration_sector_1;
            updatedBestLapTimes[driverNum].s1_overall = lap.duration_sector_1;
          }
        }
      }
      
      if (lap.duration_sector_2) {
        if (!updatedBestLapTimes[driverNum].s2_personal || lap.duration_sector_2 < updatedBestLapTimes[driverNum].s2_personal!) {
          updatedBestLapTimes[driverNum].s2_personal = lap.duration_sector_2;
          if (!newOverallBestS2 || lap.duration_sector_2 < newOverallBestS2) {
            newOverallBestS2 = lap.duration_sector_2;
            updatedBestLapTimes[driverNum].s2_overall = lap.duration_sector_2;
          }
        }
      }
      
      if (lap.duration_sector_3) {
        if (!updatedBestLapTimes[driverNum].s3_personal || lap.duration_sector_3 < updatedBestLapTimes[driverNum].s3_personal!) {
          updatedBestLapTimes[driverNum].s3_personal = lap.duration_sector_3;
          if (!newOverallBestS3 || lap.duration_sector_3 < newOverallBestS3) {
            newOverallBestS3 = lap.duration_sector_3;
            updatedBestLapTimes[driverNum].s3_overall = lap.duration_sector_3;
          }
        }
      }
    });
    
    // Update state with new best times
    setBestLapTimes(updatedBestLapTimes);
    setOverallBestLap(newOverallBestLap);
    setOverallBestS1(newOverallBestS1);
    setOverallBestS2(newOverallBestS2);
    setOverallBestS3(newOverallBestS3);
    
  }, [lapData]);

  const getPositionChange = (driverNumber: number, currentPosition: number): 'improved' | 'worsened' | 'unchanged' => {
    const prevPosition = previousPositions[driverNumber];
    
    if (prevPosition === undefined) return 'unchanged';
    if (currentPosition < prevPosition) return 'improved';
    if (currentPosition > prevPosition) return 'worsened';
    return 'unchanged';
  };

  const getDriverByNumber = (driverNumber: number): Driver | undefined => {
    return drivers.find(driver => driver.driver_number === driverNumber);
  };

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-12 gap-1 text-xs text-f1-silver/80 mb-1 px-2">
        <div className="col-span-1">Pos</div>
        <div className="col-span-3">Driver</div>
        <div className="col-span-2">Last Lap</div>
        <div className="col-span-2">S1</div>
        <div className="col-span-2">S2</div>
        <div className="col-span-2">S3</div>
      </div>
      
      <div className="space-y-1 relative">
        {positions.map((position) => {
          const driver = getDriverByNumber(position.driver_number);
          const positionChange = getPositionChange(position.driver_number, position.position);
          const driverLap = lapData[position.driver_number];
          
          return (
            <DriverPositionRow
              key={position.driver_number}
              position={position}
              driver={driver}
              positionChange={positionChange}
              driverLap={driverLap}
              bestLapTimes={bestLapTimes}
              overallBestLap={overallBestLap}
              overallBestS1={overallBestS1}
              overallBestS2={overallBestS2}
              overallBestS3={overallBestS3}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DriverPositionsList;
