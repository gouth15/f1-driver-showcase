
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { RaceControlMessage } from '@/types/f1';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock } from 'lucide-react';
import RaceControlBanner from '@/components/RaceControlBanner';
import Navbar from '@/components/Navbar';

const LiveTiming: React.FC = () => {
  const [raceControlMessages, setRaceControlMessages] = useState<RaceControlMessage[]>([]);
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
          const newMessages = sortedMessages.filter(
            msg => lastMessageTimeRef.current && new Date(msg.date) > new Date(lastMessageTimeRef.current)
          );
          
          if (newMessages.length > 0) {
            toast.info(`New race control message${newMessages.length > 1 ? 's' : ''} received`, {
              description: newMessages[0].message
            });
            
            // Show the newest message in the banner
            setActiveMessage(newMessages[0]);
          }
        } else if (sortedMessages.length > 0) {
          // First load, show the most recent message
          setActiveMessage(sortedMessages[0]);
        }
        
        lastMessageTimeRef.current = sortedMessages[0].date;
      }
      
      setRaceControlMessages(sortedMessages);
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
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour12: false
      });
    } catch (e) {
      return dateString;
    }
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
            View race control messages and timing data in real-time
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
        
        {/* Messages list */}
        {!loading && raceControlMessages.length === 0 && (
          <div className="text-center py-12 bg-f1-navy/30 rounded-lg">
            <p className="text-f1-white/70">No race control messages available</p>
          </div>
        )}
        
        {raceControlMessages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Recent Race Control Messages</h2>
            
            {raceControlMessages.map((message, index) => (
              <div 
                key={`${message.date}-${index}`}
                className="bg-f1-navy/30 backdrop-blur-sm rounded-lg overflow-hidden transition-all hover:bg-f1-navy/50"
              >
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium mr-2 ${
                        message.category === 'Flag' ? 'bg-yellow-500 text-black' :
                        message.category === 'Car Event' ? 'bg-orange-600' :
                        'bg-blue-600'
                      }`}>
                        {message.category}
                      </span>
                      
                      {message.flag && (
                        <span className="px-3 py-1 bg-gray-700 rounded-full text-xs font-medium">
                          {message.flag}
                        </span>
                      )}
                    </div>
                    
                    <time className="text-xs text-f1-white/60 font-mono">
                      {formatDate(message.date)}
                    </time>
                  </div>
                  
                  <p className="font-mono text-sm md:text-base">
                    {message.message}
                  </p>
                  
                  {(message.lap_number || message.sector || message.driver_number) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-f1-white/70">
                      {message.lap_number && (
                        <span>Lap: {message.lap_number}</span>
                      )}
                      {message.sector && (
                        <span>Sector: {message.sector}</span>
                      )}
                      {message.driver_number && (
                        <span>Driver: {message.driver_number}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTiming;
