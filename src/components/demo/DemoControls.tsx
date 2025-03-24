
import React from 'react';
import { PlayCircle, PauseCircle, SkipForward, RefreshCw } from 'lucide-react';

interface DemoControlsProps {
  isRunning: boolean;
  speed: number;
  isLoading: boolean;
  onToggleRunning: () => void;
  onSpeedChange: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onReloadData: () => void;
}

const DemoControls: React.FC<DemoControlsProps> = ({
  isRunning,
  speed,
  isLoading,
  onToggleRunning,
  onSpeedChange,
  onStepForward,
  onReset,
  onReloadData
}) => {
  return (
    <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleRunning}
          className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            isRunning ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
          disabled={isLoading}
        >
          {isRunning ? (
            <PauseCircle className="mr-1 h-3 w-3" />
          ) : (
            <PlayCircle className="mr-1 h-3 w-3" />
          )}
          {isRunning ? 'Demo: Running' : 'Demo: Paused'}
        </button>
        
        <button
          onClick={onSpeedChange}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-xs font-medium transition-colors"
          disabled={isLoading}
        >
          {`${speed}x Speed`}
        </button>
        
        <button
          onClick={onStepForward}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-xs font-medium transition-colors"
          disabled={isLoading}
        >
          <SkipForward className="h-3 w-3" />
        </button>
        
        <button
          onClick={onReset}
          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-full text-xs font-medium transition-colors"
          disabled={isLoading}
        >
          Reset Demo
        </button>
        
        <button
          onClick={onReloadData}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-full text-xs font-medium transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Reload API Data'}
        </button>
      </div>
      
      <div className="text-xs font-mono bg-f1-navy/60 px-2 py-1 rounded">
        Demo Mode
      </div>
    </div>
  );
};

export default DemoControls;
