
import React, { useState, useEffect } from 'react';
import { Driver } from '@/types/f1';
import Navbar from '@/components/Navbar';
import DriverCard from '@/components/DriverCard';
import { toast } from 'sonner';

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch drivers: ${response.status}`);
        }
        
        const data: Driver[] = await response.json();
        
        // Sort drivers by team and then by number
        const sortedDrivers = [...data].sort((a, b) => {
          if (a.team_name === b.team_name) {
            return a.driver_number - b.driver_number;
          }
          return a.team_name.localeCompare(b.team_name);
        });
        
        setDrivers(sortedDrivers);
        
        // Notify user
        toast.success('Driver data loaded successfully');
      } catch (err) {
        console.error('Error fetching drivers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load drivers');
        toast.error('Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return (
    <div className="min-h-screen bg-f1-navy text-white pb-24">
      <Navbar />
      
      {/* Header */}
      <header className="relative pt-32 pb-20 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-f1-red rounded-full blur-[120px]"></div>
          <div className="absolute top-1/4 -left-1/4 w-80 h-80 bg-blue-600 rounded-full blur-[150px]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="chip mb-4 px-3 py-1 bg-f1-red/90 text-white text-xs uppercase tracking-wider rounded-full font-medium inline-block animate-slide-down">
            2023 Season
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display animate-slide-up">
            F1 Drivers
          </h1>
          
          <p className="text-f1-silver/80 max-w-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
            All current Formula 1 drivers with their details, team affiliations and driver numbers.
          </p>
        </div>
      </header>
      
      <div className="container mx-auto px-6">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-t-2 border-f1-red rounded-full animate-spin mb-4"></div>
            <p className="text-f1-silver/80">Loading drivers...</p>
          </div>
        )}
        
        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 text-white p-6 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Unable to load drivers</h3>
            <p className="text-f1-silver/80">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-f1-red text-white rounded-md hover:bg-f1-red/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Drivers grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {drivers.map((driver, index) => (
              <div 
                key={`${driver.driver_number}-${driver.name_acronym}`} 
                className="animate-scale-in" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <DriverCard driver={driver} />
              </div>
            ))}
          </div>
        )}
        
        {/* Empty state */}
        {!loading && !error && drivers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-f1-silver/80">No drivers found for the current session.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drivers;
