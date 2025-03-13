
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CRTOverlayProps {
  children: React.ReactNode;
  className?: string;
}

const CRTOverlay: React.FC<CRTOverlayProps> = ({ children, className = '' }) => {
  const isMobile = useIsMobile();
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Adds a brief glitch effect that can be triggered by children components
  const triggerGlitch = () => {
    if (!isGlitching) {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 500);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className={`crt-screen w-full h-full ${isGlitching ? 'animate-screen-flicker' : ''}`}>
        {React.Children.map(children, child => {
          // Pass the triggerGlitch function to all children
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { triggerGlitch } as any);
          }
          return child;
        })}
      </div>
      <div className="absolute top-2 right-3 z-50 flex space-x-1 md:space-x-2 items-center">
        <div className="led-indicator"></div>
        <span className={`pixel-text ${isMobile ? 'text-[9px]' : 'text-xs'} text-crt-glow/80`}>ON</span>
      </div>
    </div>
  );
};

export default CRTOverlay;
