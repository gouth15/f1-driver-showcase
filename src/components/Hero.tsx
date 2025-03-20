
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: 'url(https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/F1_Generic.jpg.transform/fullbleed/image.jpg)',
          filter: 'brightness(0.4)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-f1-navy/80 via-f1-navy/40 to-f1-navy"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 pt-20 pb-10 flex flex-col items-center text-center animate-fade-in">
        <div className="chip mb-4 px-3 py-1 bg-f1-red/90 text-white text-xs uppercase tracking-wider rounded-full font-medium animate-slide-down">
          Formula 1 Hub
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6 animate-slide-up">
          <span className="inline-block">Live F1 Stats &</span>
          <br />
          <span className="inline-block">Race Information</span>
        </h1>
        
        <p className="max-w-2xl text-f1-silver/80 text-lg md:text-xl mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          Real-time F1 data with driver profiles, team standings, and live qualifying timings
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-scale-in" style={{ animationDelay: '200ms' }}>
          <Link 
            to="/drivers" 
            className="px-8 py-3 bg-f1-red text-white font-medium rounded-lg transition-all hover:bg-f1-red/90 hover:shadow-lg hover:shadow-f1-red/20 active:scale-[0.98]"
          >
            View Drivers
          </Link>
          <Link 
            to="/standings" 
            className="px-8 py-3 bg-white/10 text-white backdrop-blur-sm border border-white/20 font-medium rounded-lg transition-all hover:bg-white/15 hover:border-white/30 active:scale-[0.98]"
          >
            Standings
          </Link>
        </div>
      </div>
      
      {/* Bottom wave effect */}
      <div className="absolute bottom-0 left-0 right-0 h-16 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
          <path fill="#15151E" fillOpacity="1" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,208C840,213,960,203,1080,170.7C1200,139,1320,85,1380,58.7L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
