
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const links = [
    { name: "Home", path: "/" },
    { name: "Drivers", path: "/drivers" },
    { name: "Standings", path: "/standings" },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        scrolled 
          ? "bg-f1-navy/80 backdrop-blur-md py-4 shadow-lg" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-opacity duration-300 hover:opacity-80"
        >
          <div className="h-8 w-auto">
            <svg viewBox="0 0 24 12" className="h-full w-auto fill-f1-red">
              <path d="M23.5,0H11.9C8.3,0,6.7,0.5,5.6,1.5C4.2,2.8,3.4,5.2,3.4,8.7c0,0.7,0,2,0.3,2.8H0.5C0.2,11.5,0,11.3,0,11V1  c0-0.3,0.2-0.5,0.5-0.5h3.3h3.5h0.3H13H23.5C23.8,0.5,24,0.7,24,1v10c0,0.3-0.2,0.5-0.5,0.5h-3.8h-4.4c0.2-0.8,0.3-1.7,0.3-2.8  c0-1.3-0.1-2.1-0.3-2.7h8.2C23.8,6,24,5.8,24,5.5v-4C24,1.2,23.8,1,23.5,1H11.6C10.8,1,9.9,1.2,9.5,1.5C9,1.9,8.7,2.4,8.7,3.4  c0,0.9,0.3,1.5,0.7,1.8C9.9,5.8,10.8,6,11.6,6h3.8h8.1c0.3,0,0.5,0.2,0.5,0.5v4c0,0.3-0.2,0.5-0.5,0.5h-7H8.3  c-0.3-0.3-0.4-0.7-0.5-1.1C7.6,9.5,7.6,9,7.6,8.7c0-2.6,0.5-4.1,1.2-4.8c0.6-0.5,1.3-0.8,2.8-0.8h8.1h3.8C23.8,3.1,24,3.3,24,3.6  v1c0,0.3-0.2,0.5-0.5,0.5h-3.8h-4.3h-3.8c-0.2,0-0.6,0-0.8-0.1L10.5,5c-0.1-0.1-0.1-0.2-0.1-0.3s0-0.2,0.1-0.3l0.3-0.1  c0.2-0.1,0.6-0.1,0.8-0.1h3.8h4.3h3.8C23.8,4.1,24,4.3,24,4.6v6c0,0.3-0.2,0.5-0.5,0.5h-3.3h-3.5h-0.8H10  c-1.5,0-2.3-0.3-2.8-0.8c-0.7-0.7-1.2-2.2-1.2-4.8c0-0.3,0-0.8,0.1-1.2c0.1-0.4,0.3-0.8,0.5-1.1h13.9h3.8C23.8,3.1,24,3.3,24,3.6  v7C24,10.8,23.8,11,23.5,11h-8.6c-0.3,0-0.5-0.2-0.5-0.5v0c0-0.3,0.2-0.5,0.5-0.5h8.1C23.3,10,23.5,9.8,23.5,9.5v-5  c0-0.3-0.2-0.5-0.5-0.5h-8.1h-3.8c-0.8,0-1.7-0.2-2.1-0.5C8.6,3.1,8.3,2.5,8.3,1.6c0-1,0.3-1.5,0.8-1.9C9.5,0,10.4,0,11.2,0h12.3  C23.8,0,24,0.2,24,0.5v0C24,0.8,23.8,1,23.5,1z"/>
            </svg>
          </div>
          <span className="text-f1-white font-display text-xl font-semibold tracking-tighter">
            F1 Hub
          </span>
        </Link>
        
        <div className="hidden md:flex space-x-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "relative px-4 py-2 rounded-full font-medium text-sm transition-all",
                "hover:bg-white/10",
                location.pathname === link.path
                  ? "text-f1-white"
                  : "text-f1-white/70 hover:text-f1-white"
              )}
            >
              {link.name}
              {location.pathname === link.path && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-f1-red rounded-full" />
              )}
            </Link>
          ))}
        </div>
        
        <div className="md:hidden">
          <button className="p-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
