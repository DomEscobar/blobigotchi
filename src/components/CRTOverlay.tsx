
import React from 'react';

interface CRTOverlayProps {
  children: React.ReactNode;
  className?: string;
}

const CRTOverlay: React.FC<CRTOverlayProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="crt-screen w-full h-full animate-screen-flicker">
        {children}
      </div>
      <div className="absolute top-2 right-3 z-50 flex space-x-2 items-center">
        <div className="led-indicator"></div>
        <span className="pixel-text text-xs text-crt-glow/80">ON</span>
      </div>
    </div>
  );
};

export default CRTOverlay;
