
import React from 'react';
import Navbar from '@/components/Navbar';

const Standings = () => {
  return (
    <div className="min-h-screen bg-f1-navy text-white pb-24">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="chip mb-4 px-3 py-1 bg-f1-red/90 text-white text-xs uppercase tracking-wider rounded-full font-medium inline-block">
            Coming Soon
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display">
            F1 Standings
          </h1>
          
          <p className="text-f1-silver/80 max-w-xl">
            Driver and Constructor championship standings will be available here soon.
          </p>
          
          <div className="mt-12 p-8 glass rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">Feature in Development</h2>
            <p className="text-f1-silver/80">
              We're working on implementing live standings for the current Formula 1 season. 
              This page will display both driver and constructor championship points, 
              race results, and historical data.
            </p>
            
            <div className="mt-8 p-6 border border-white/10 rounded-xl bg-white/5">
              <h3 className="text-lg font-medium mb-2">Coming Features:</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-f1-red rounded-full mr-2"></div>
                  <span>Driver Championship Standings</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-f1-red rounded-full mr-2"></div>
                  <span>Constructor Championship Standings</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-f1-red rounded-full mr-2"></div>
                  <span>Race-by-Race Results</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-f1-red rounded-full mr-2"></div>
                  <span>Points Visualization</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Standings;
