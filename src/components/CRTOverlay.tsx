
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CRTOverlayProps {
  children: React.ReactNode;
  className?: string;
}

const CRTOverlay: React.FC<CRTOverlayProps> = ({ children, className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`relative ${className}`}>
      <div className="crt-screen w-full h-full animate-screen-flicker">
        {children}
      </div>
      <div className="absolute top-2 right-3 z-50 flex space-x-1 md:space-x-2 items-center">
        <div className="led-indicator"></div>
        <span className={`pixel-text ${isMobile ? 'text-[9px]' : 'text-xs'} text-crt-glow/80`}>ON</span>
      </div>
    </div>
  );
};

export default CRTOverlay;
