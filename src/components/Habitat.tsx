import React, { useState } from 'react';
import Blob, { BlobMood } from './Blob';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import ToyBox from './ToyBox';
import { useSounds } from '@/hooks/useSounds';
import { useSettings } from '@/hooks/useSettings';

interface HabitatProps {
  mood: BlobMood;
  onBlobClick: () => void;
  className?: string;
  evolutionLevel?: number;
}

const Habitat: React.FC<HabitatProps> = ({ mood, onBlobClick, className = '', evolutionLevel = 1 }) => {
  const isMobile = useIsMobile();
  const [isFridgeOpen, setIsFridgeOpen] = useState(false);
  const [isTvOn, setIsTvOn] = useState(false);
  const { playSoundEffect } = useSounds();
  const { settings } = useSettings();
  
  const handleFridgeClick = () => {
    setIsFridgeOpen(prev => !prev);
    
    if (settings.sound) {
      playSoundEffect('click');
    }
    
    if (!isFridgeOpen) {
      toast("Opening fridge...", {
        description: "Found: Glow Berries, Mystery Meat",
        className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
        duration: 3000,
      });
    } else {
      toast("Closing fridge...", {
        className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
        duration: 1500,
      });
    }
  };
  
  const handleTvClick = () => {
    setIsTvOn(prev => !prev);
    
    if (settings.sound) {
      playSoundEffect('click');
    }
    
    if (isTvOn) {
      toast("TV powered off", {
        className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
        duration: 1500,
      });
    } else {
      toast("Channel surfing...", {
        description: "Mini-games coming soon!",
        className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
        duration: 3000,
      });
    }
  };

  const handleBlobClickWithSound = () => {
    if (settings.sound) {
      playSoundEffect('play');
    }
    onBlobClick();
  };

  const handleToyInteraction = () => {
    onBlobClick();
    onBlobClick();
  };

  const getBgClass = () => {
    if (['sad', 'hungry', 'tired', 'sick'].includes(mood)) {
      return 'from-crt-background/90 to-crt-dark/95';
    } else if (mood === 'happy') {
      return 'from-crt-background to-crt-dark/80';
    }
    return 'from-crt-background to-crt-dark';
  };

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${getBgClass()} transition-all duration-1000`}>
        <div className="absolute bottom-0 left-0 right-0 h-24 w-full overflow-hidden">
          <div className="w-full h-full" style={{ 
            backgroundImage: `repeating-conic-gradient(#333 0% 25%, #444 0% 50%)`, 
            backgroundSize: '32px 32px',
            transform: 'perspective(300px) rotateX(45deg)',
            transformOrigin: 'bottom'
          }}></div>
        </div>
        
        <div 
          className={`absolute right-4 top-12 w-16 h-12 bg-gray-800 rounded-lg border-2 border-gray-700 cursor-pointer transition-all duration-300 ${isTvOn ? 'shadow-[0_0_8px_rgba(0,150,255,0.7)]' : ''}`}
          onClick={handleTvClick}
        >
          <div className={`w-full h-8 rounded-t-sm overflow-hidden transition-colors duration-300 ${isTvOn ? 'bg-blue-400/80' : 'bg-gray-600/50'}`}>
            {isTvOn ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-4 bg-yellow-400 animate-pulse"></div>
              </div>
            ) : (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-70 ml-2 mt-2"></div>
            )}
          </div>
          <div className="flex justify-center mt-1 space-x-1">
            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        <div 
          className={`absolute left-4 top-12 w-10 h-14 bg-gray-300 rounded-sm border border-gray-500 cursor-pointer transition-transform duration-300 ${isFridgeOpen ? 'transform -translate-y-1' : ''}`}
          onClick={handleFridgeClick}
        >
          <div className={`w-full h-8 bg-gray-200 rounded-t-sm border-b border-gray-500 transition-all duration-300 origin-left ${isFridgeOpen ? 'transform rotate-[60deg] shadow-md' : ''}`}>
            <div className="w-1 h-2 bg-gray-500 rounded-full ml-auto mr-1 mt-2"></div>
          </div>
          
          {isFridgeOpen && (
            <div className="absolute top-1 left-1 w-8 h-6 bg-cyan-50 rounded-sm p-0.5">
              <div className="w-2 h-1.5 bg-blob-happy rounded-sm absolute top-1 left-1"></div>
              <div className="w-3 h-1.5 bg-blob-hungry rounded-sm absolute bottom-1 right-1"></div>
            </div>
          )}
          
          <div className="w-full h-1 bg-gray-500 rounded-full mt-8"></div>
          <div className="w-1 h-2 bg-gray-500 rounded-full ml-1 mt-2"></div>
        </div>
        
        <div className="absolute right-6 top-4 w-8 h-8 rounded-full border-2 border-blob-tertiary" style={{
          boxShadow: '0 0 5px rgba(170, 85, 255, 0.5)'
        }}>
          <div className="w-4 h-1 bg-blob-tertiary absolute top-4 left-2 rounded-full transform origin-right rotate-45"></div>
          <div className="w-3 h-1 bg-blob-tertiary absolute top-4 left-3 rounded-full transform origin-left -rotate-45"></div>
          <div className="w-1 h-1 bg-white rounded-full absolute top-4 left-3.5"></div>
        </div>
        
        {mood === 'happy' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 bottom-24 transform -translate-x-1/2 w-24 h-24 opacity-50">
              <div className="absolute w-3 h-3 rounded-full bg-blob-happy animate-blob-idle" 
                   style={{ left: '40%', top: '30%', animationDelay: '0.5s' }}></div>
              <div className="absolute w-2 h-2 rounded-full bg-blob-tertiary animate-blob-idle" 
                   style={{ left: '60%', top: '40%', animationDelay: '1s' }}></div>
              <div className="absolute w-2 h-2 rounded-full bg-blob-secondary animate-blob-idle" 
                   style={{ left: '30%', top: '50%', animationDelay: '1.5s' }}></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute left-1/2 bottom-16 transform -translate-x-1/2">
        <Blob mood={mood} onClick={handleBlobClickWithSound} evolutionLevel={evolutionLevel} />
      </div>

      <ToyBox onToyInteraction={handleToyInteraction} />
    </div>
  );
};

export default Habitat;
