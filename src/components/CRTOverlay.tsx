
import React, { useState, createContext, useContext } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface GlitchContextType {
  triggerGlitch: () => void;
}

const GlitchContext = createContext<GlitchContextType | undefined>(undefined);

export const useGlitch = () => {
  const context = useContext(GlitchContext);
  if (!context) {
    throw new Error('useGlitch must be used within a CRTOverlay');
  }
  return context;
};

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
    <GlitchContext.Provider value={{ triggerGlitch }}>
      <div className={`relative ${className}`}>
        <div className={`crt-screen w-full h-full ${isGlitching ? 'animate-screen-flicker' : ''}`}>
          {children}
        </div>
        <div className="absolute top-2 right-3 z-50 flex space-x-1 md:space-x-2 items-center">
          <div className="led-indicator"></div>
          <span className={`pixel-text ${isMobile ? 'text-[9px]' : 'text-xs'} text-crt-glow/80`}>ON</span>
        </div>
      </div>
    </GlitchContext.Provider>
  );
};

export default CRTOverlay;
