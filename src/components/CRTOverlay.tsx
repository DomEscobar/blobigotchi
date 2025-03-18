
import React, { useState, createContext, useContext, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BlobMood } from '@/components/Blob';

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
  mood?: BlobMood;
}

const CRTOverlay: React.FC<CRTOverlayProps> = ({ children, className = '', mood = 'normal' }) => {
  const isMobile = useIsMobile();
  const [isGlitching, setIsGlitching] = useState(false);
  const [isNeglected, setIsNeglected] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  
  // Update the mood states
  useEffect(() => {
    // Blob is neglected if it's sad, hungry, tired or sick
    setIsNeglected(['sad', 'hungry', 'tired', 'sick'].includes(mood));
    setIsHappy(mood === 'happy');
  }, [mood]);
  
  // Adds a brief glitch effect that can be triggered by children components
  const triggerGlitch = () => {
    if (!isGlitching) {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 500);
    }
  };
  
  // Random glitches for neglected blobs
  useEffect(() => {
    let glitchInterval: NodeJS.Timeout | null = null;
    
    if (isNeglected) {
      glitchInterval = setInterval(() => {
        // Random glitches: 20% chance of glitch every 5-10 seconds
        if (Math.random() < 0.2) {
          triggerGlitch();
        }
      }, Math.random() * 5000 + 5000);
    }
    
    return () => {
      if (glitchInterval) clearInterval(glitchInterval);
    };
  }, [isNeglected]);
  
  return (
    <GlitchContext.Provider value={{ triggerGlitch }}>
      <div className={`relative ${className}`}>
        <div 
          className={`crt-screen w-full h-full 
            ${isGlitching || isNeglected ? 'animate-screen-flicker' : ''} 
            ${isNeglected ? 'crt-neglected' : ''}
            ${isHappy ? 'crt-happy' : ''}
          `}
          style={{
            filter: isNeglected ? 'hue-rotate(-30deg) contrast(1.2)' : 'none',
            transition: 'filter 1s ease'
          }}
        >
          {children}
          
          {/* Rainbow border for happy blob */}
          {isHappy && (
            <div className="absolute inset-0 pointer-events-none z-40 border-4 rounded-lg overflow-hidden opacity-70" 
              style={{ 
                borderImage: 'linear-gradient(to right, #ff9955, #5599ff, #ff5555, #aa99ff, #55ff55) 1',
                animation: 'pulse 2s infinite' 
              }} 
            />
          )}
          
          {/* Noise overlay for neglected blob - more visible when neglected */}
          <div 
            className="absolute inset-0 pointer-events-none z-20 bg-noise opacity-0 mix-blend-overlay"
            style={{ 
              opacity: isNeglected ? 0.3 : 0,
              transition: 'opacity 1s ease',
              backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF9mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0MzYwLCAyMDIwLzAyLzEzLTAxOjA3OjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjMtMDQtMDRUMTU6MDk6MDgrMDk6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTA0LTA0VDE1OjEwOjA4KzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIzLTA0LTA0VDE1OjEwOjA4KzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDphY2Q0OGYwMy05YzI4LTRjMzAtOTY4MC1jODVlNWU0ZGNkMjciIHhtcE1NOkRvY3VtZW50SUQ9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")`
            }}
          />
          
          {/* Glitch lines for neglected blob */}
          {isNeglected && (
            <div className="absolute inset-0 pointer-events-none z-30">
              <div className="absolute top-1/4 left-0 right-0 h-px bg-white/30 animate-glitch opacity-50"></div>
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30 animate-glitch opacity-50"></div>
            </div>
          )}

          {/* Confetti for happy blob */}
          {isHappy && (
            <div className="absolute inset-0 pointer-events-none z-30">
              <div className="confetti-container">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div 
                    key={i}
                    className="confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      width: `${Math.random() * 10 + 5}px`,
                      height: `${Math.random() * 10 + 5}px`,
                      background: ['#ff9955', '#5599ff', '#ff5555', '#aa99ff', '#55ff55'][Math.floor(Math.random() * 5)],
                      animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
                      animationDelay: `${Math.random() * 5}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-2 right-3 z-10 flex space-x-1 md:space-x-2 items-center">
          <div className="led-indicator"></div>
          <span className={`pixel-text ${isMobile ? 'text-[9px]' : 'text-xs'} text-crt-glow/80`}>ON</span>
        </div>
      </div>
    </GlitchContext.Provider>
  );
};

export default CRTOverlay;
