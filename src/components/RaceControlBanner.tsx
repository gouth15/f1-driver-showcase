
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RaceControlMessage } from '@/types/f1';
import { AlertTriangle, Flag, Info, MessageSquare } from 'lucide-react';

interface RaceControlBannerProps {
  message: RaceControlMessage;
  onComplete?: () => void;
}

const RaceControlBanner: React.FC<RaceControlBannerProps> = ({ 
  message, 
  onComplete 
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Entry animation
    setVisible(true);
    
    // Display for 3 seconds then fade out
    const timer = setTimeout(() => {
      setVisible(false);
      
      // Wait for animation to complete before calling onComplete
      const exitTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 800); // 800ms to match animation duration
      
      return () => clearTimeout(exitTimer);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [message, onComplete]);

  // Determine banner color based on message category
  const getBannerColor = () => {
    switch (message.category?.toLowerCase()) {
      case 'flag':
        if (message.flag?.includes('RED')) return 'bg-red-600';
        if (message.flag?.includes('YELLOW')) return 'bg-yellow-500 text-black';
        if (message.flag?.includes('BLUE')) return 'bg-blue-600';
        if (message.flag?.includes('WHITE')) return 'bg-white text-black';
        if (message.flag?.includes('BLACK')) return 'bg-black';
        if (message.flag?.includes('GREEN')) return 'bg-green-600';
        if (message.flag?.includes('CHEQUERED')) return 'bg-zinc-800';
        return 'bg-f1-navy';
      case 'car event':
        return 'bg-orange-600';
      case 'race director':
        return 'bg-purple-600';
      default:
        return 'bg-slate-700';
    }
  };

  // Determine icon based on message category
  const getIcon = () => {
    switch (message.category?.toLowerCase()) {
      case 'flag':
        return <Flag className="h-5 w-5" />;
      case 'car event':
        return <AlertTriangle className="h-5 w-5" />;
      case 'race director':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-800",
        "transform-gpu",
        getBannerColor(),
        visible 
          ? "translate-y-16 opacity-100 scale-100" 
          : "-translate-y-full opacity-0 scale-95",
        "shadow-lg"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
        <div className="flex-shrink-0 mr-3 animate-bounce">
          {getIcon()}
        </div>
        <div className="flex-1 font-mono">
          <p className={cn(
            "text-sm md:text-base font-semibold",
            visible && "animate-slide-up"
          )}>
            {message.message}
          </p>
        </div>
        <div className="ml-4 text-xs opacity-75">
          {formatDate(message.date)}
        </div>
      </div>
    </div>
  );
};

export default RaceControlBanner;
