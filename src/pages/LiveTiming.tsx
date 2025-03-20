
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { RaceControlMessage } from '@/types/f1';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock } from 'lucide-react';
import RaceControlBanner from '@/components/RaceControlBanner';
import Navbar from '@/components/Navbar';

const LiveTiming: React.FC = () => {
  const [activeMessage, setActiveMessage] = useState<RaceControlMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const pollingIntervalRef = useRef<number | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);
  
  // Function to fetch race control messages
  const fetchRaceControlMessages = useCallback(async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/race_control?session_key=latest');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch race control messages: ${response.status}`);
      }
      
      const data: RaceControlMessage[] = await response.json();
      
      // Sort by date (newest first)
      const sortedMessages = [...data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Check if we have a new message
      if (sortedMessages.length > 0 && lastMessageTimeRef.current !== sortedMessages[0].date) {
        // If this isn't the first load and we have a new message
        if (lastMessageTimeRef.current !== null) {
          toast.info(`New race control message received`, {
            description: sortedMessages[0].message
          });
        }
        
        // Show the newest message in the banner
        setActiveMessage(sortedMessages[0]);
        lastMessageTimeRef.current = sortedMessages[0].date;
      }
      
      setLoading(false);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching race control messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch race control messages');
      setLoading(false);
    }
  }, []);
  
  // Start polling on component mount
  useEffect(() => {
    // Initial fetch
    fetchRaceControlMessages();
    
    // Set up polling interval (every 5 seconds)
    pollingIntervalRef.current = window.setInterval(() => {
      if (isPolling) {
        fetchRaceControlMessages();
      }
    }, 5000);
    
    // Clean up on unmount
    return () => {
      if (pollingIntervalRef.current !== null) {
        window.clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchRaceControlMessages, isPolling]);
  
  // Handle banner completion (when animation completes)
  const handleBannerComplete = () => {
    setActiveMessage(null);
  };
  
  return (
    <div className="min-h-screen bg-f1-navy text-white">
      <Navbar />
      
      {/* Top spacing for fixed navbar */}
      <div className="h-20"></div>
      
      {/* Race Control Message Banner */}
      {activeMessage && (
        <RaceControlBanner 
          message={activeMessage} 
          onComplete={handleBannerComplete}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Live Timing</h1>
          <p className="text-f1-white/70">
            View race control messages in real-time
          </p>
        </div>
        
        {/* Polling control */}
        <div className="mb-6 flex items-center">
          <button
            onClick={() => setIsPolling(!isPolling)}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isPolling ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <Clock className="mr-2 h-4 w-4" />
            {isPolling ? 'Live: On' : 'Live: Off'}
          </button>
          {!isPolling && (
            <button
              onClick={fetchRaceControlMessages}
              className="ml-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition-colors"
            >
              Refresh Now
            </button>
          )}
        </div>
        
        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-f1-red"></div>
          </div>
        )}
        
        {/* Status message */}
        <div className="text-center py-12 bg-f1-navy/30 rounded-lg">
          <p className="text-f1-white/70">
            {isPolling 
              ? "Listening for race control messages..." 
              : "Polling is paused. Click 'Live: Off' to resume."}
          </p>
          {activeMessage && (
            <p className="mt-4 text-f1-white font-medium">
              Latest message displayed as banner
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTiming;
