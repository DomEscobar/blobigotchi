
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSounds } from '@/hooks/useSounds';
import { useSettings } from '@/hooks/useSettings';

interface BabyRoomProps {
  onInteraction: () => void;
}

const BabyRoom: React.FC<BabyRoomProps> = ({ onInteraction }) => {
  const isMobile = useIsMobile();
  const [isMobileMoving, setIsMobileMoving] = useState(false);
  const [isDrumPlaying, setIsDrumPlaying] = useState(false);
  const [isRattleActive, setIsRattleActive] = useState(false);
  const { playSoundEffect } = useSounds();
  const { settings } = useSettings();

  const playSound = (sound: 'click' | 'play') => {
    if (settings.sound) {
      playSoundEffect(sound);
    }
  };

  const handleMobileClick = () => {
    setIsMobileMoving(prev => !prev);
    playSound('click');
    
    if (!isMobileMoving) {
      toast("Mobile spinning!", {
        description: "Your blob is mesmerized!",
        className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
        duration: 2000,
      });
    }
    
    onInteraction();
  };

  const handleDrumClick = () => {
    setIsDrumPlaying(true);
    playSound('play');
    
    toast("Boom boom boom!", {
      description: "Making some noise!",
      className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
      duration: 1500,
    });
    
    onInteraction();
    
    setTimeout(() => setIsDrumPlaying(false), 1000);
  };

  const handleRattleClick = () => {
    setIsRattleActive(true);
    playSound('click');
    
    toast("Shake shake shake!", {
      description: "So entertaining!",
      className: `pixel-text bg-crt-dark border border-blob-tertiary text-white ${isMobile ? 'text-[9px]' : 'text-xs'}`,
      duration: 1500,
    });
    
    onInteraction();
    
    setTimeout(() => setIsRattleActive(false), 800);
  };

  return (
    <div className="absolute inset-0">
      {/* Baby Mobile */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div 
          className={`cursor-pointer transition-transform duration-500 ${isMobileMoving ? 'animate-spin-slow' : ''}`}
          onClick={handleMobileClick}
        >
          <div className="w-24 h-1 bg-gray-400"></div>
          <div className="relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-400"></div>
            <div className="absolute top-8 left-2 w-4 h-4 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute top-8 right-2 w-4 h-4 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>

      {/* Toy Drum */}
      <div 
        className={`absolute bottom-20 right-8 w-12 h-10 bg-red-400 rounded-lg cursor-pointer transition-transform ${isDrumPlaying ? 'scale-95' : ''}`}
        onClick={handleDrumClick}
      >
        <div className="w-full h-2 bg-red-300 rounded-t-lg"></div>
        <div className="w-full h-2 bg-red-500 absolute bottom-0 rounded-b-lg"></div>
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-yellow-400"></div>
      </div>

      {/* Rattle */}
      <div 
        className={`absolute bottom-24 left-8 cursor-pointer transition-transform ${isRattleActive ? 'animate-shake' : ''}`}
        onClick={handleRattleClick}
      >
        <div className="w-2 h-8 bg-pink-400 rounded-full"></div>
        <div className="w-6 h-6 bg-pink-300 rounded-full -mt-1"></div>
      </div>
    </div>
  );
};

export default BabyRoom;
