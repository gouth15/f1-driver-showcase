
import React from 'react';
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
          />
        );
      })}
    </div>
  );
};

export default DriverPositionsList;
