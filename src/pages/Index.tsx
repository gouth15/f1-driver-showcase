
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

const Index = () => {
  return (
    <div className="min-h-screen bg-f1-navy text-white">
      <Navbar />
      <Hero />
      
      <div className="container mx-auto px-6 py-24">
        <div className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">Experience Formula 1 Like Never Before</h2>
          <p className="text-f1-silver/80 max-w-2xl mx-auto">
            Get real-time access to driver information, team standings, and live qualifying timings with our intuitive interface.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard 
            title="Driver Profiles"
            description="Comprehensive information about every driver on the grid, including team affiliations and career statistics."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            }
          />
          
          <FeatureCard 
            title="Live Timing"
            description="Real-time qualifying and race timings, with sector breakdowns and gap visualization."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            }
          />
          
          <FeatureCard 
            title="Team Standings"
            description="Up-to-date championship standings for both drivers and constructors throughout the season."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
            }
          />
        </div>
      </div>
      
      <footer className="bg-f1-black/30 py-10 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-auto">
                <svg viewBox="0 0 24 12" className="h-full w-auto fill-f1-red">
                  <path d="M23.5,0H11.9C8.3,0,6.7,0.5,5.6,1.5C4.2,2.8,3.4,5.2,3.4,8.7c0,0.7,0,2,0.3,2.8H0.5C0.2,11.5,0,11.3,0,11V1  c0-0.3,0.2-0.5,0.5-0.5h3.3h3.5h0.3H13H23.5C23.8,0.5,24,0.7,24,1v10c0,0.3-0.2,0.5-0.5,0.5h-3.8h-4.4c0.2-0.8,0.3-1.7,0.3-2.8  c0-1.3-0.1-2.1-0.3-2.7h8.2C23.8,6,24,5.8,24,5.5v-4C24,1.2,23.8,1,23.5,1H11.6C10.8,1,9.9,1.2,9.5,1.5C9,1.9,8.7,2.4,8.7,3.4  c0,0.9,0.3,1.5,0.7,1.8C9.9,5.8,10.8,6,11.6,6h3.8h8.1c0.3,0,0.5,0.2,0.5,0.5v4c0,0.3-0.2,0.5-0.5,0.5h-7H8.3  c-0.3-0.3-0.4-0.7-0.5-1.1C7.6,9.5,7.6,9,7.6,8.7c0-2.6,0.5-4.1,1.2-4.8c0.6-0.5,1.3-0.8,2.8-0.8h8.1h3.8C23.8,3.1,24,3.3,24,3.6  v1c0,0.3-0.2,0.5-0.5,0.5h-3.8h-4.3h-3.8c-0.2,0-0.6,0-0.8-0.1L10.5,5c-0.1-0.1-0.1-0.2-0.1-0.3s0-0.2,0.1-0.3l0.3-0.1  c0.2-0.1,0.6-0.1,0.8-0.1h3.8h4.3h3.8C23.8,4.1,24,4.3,24,4.6v6c0,0.3-0.2,0.5-0.5,0.5h-3.3h-3.5h-0.8H10  c-1.5,0-2.3-0.3-2.8-0.8c-0.7-0.7-1.2-2.2-1.2-4.8c0-0.3,0-0.8,0.1-1.2c0.1-0.4,0.3-0.8,0.5-1.1h13.9h3.8C23.8,3.1,24,3.3,24,3.6  v7C24,10.8,23.8,11,23.5,11h-8.6c-0.3,0-0.5-0.2-0.5-0.5v0c0-0.3,0.2-0.5,0.5-0.5h8.1C23.3,10,23.5,9.8,23.5,9.5v-5  c0-0.3-0.2-0.5-0.5-0.5h-8.1h-3.8c-0.8,0-1.7-0.2-2.1-0.5C8.6,3.1,8.3,2.5,8.3,1.6c0-1,0.3-1.5,0.8-1.9C9.5,0,10.4,0,11.2,0h12.3  C23.8,0,24,0.2,24,0.5v0C24,0.8,23.8,1,23.5,1z"/>
                </svg>
              </div>
              <span className="text-f1-white font-display text-base font-semibold tracking-tighter">
                F1 Hub
              </span>
            </div>
            
            <p className="text-f1-silver/70 text-sm">
              © 2023 F1 Hub. This is a fan-made site, not affiliated with Formula 1.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <div className="glass p-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-white/5 group">
    <div className="text-f1-red mb-5 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-f1-silver/80">{description}</p>
  </div>
);

export default Index;
