
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type BlobMood = 'happy' | 'sad' | 'hungry' | 'tired' | 'sick' | 'normal';

interface BlobProps {
  mood: BlobMood;
  onClick: () => void;
  className?: string;
}

const Blob: React.FC<BlobProps> = ({ mood, onClick, className }) => {
  const [animationClass, setAnimationClass] = useState('animate-blob-idle');
  const [blobColor, setBlobColor] = useState('bg-blob-primary');
  const [isJiggling, setIsJiggling] = useState(false);

  useEffect(() => {
    // Update blob appearance based on mood
    switch (mood) {
      case 'happy':
        setAnimationClass('animate-blob-idle');
        setBlobColor('bg-blob-happy');
        break;
      case 'sad':
        setAnimationClass('animate-blob-sad');
        setBlobColor('bg-blob-sad');
        break;
      case 'hungry':
        setAnimationClass('animate-blob-idle');
        setBlobColor('bg-blob-hungry');
        break;
      case 'tired':
        setAnimationClass('animate-blob-sad');
        setBlobColor('bg-blob-tired');
        break;
      case 'sick':
        setAnimationClass('animate-blob-sad');
        setBlobColor('bg-blob-sick');
        break;
      default:
        setAnimationClass('animate-blob-idle');
        setBlobColor('bg-blob-primary');
    }
  }, [mood]);

  const handleClick = () => {
    if (!isJiggling) {
      setIsJiggling(true);
      setAnimationClass('animate-blob-bounce');
      
      // Reset to normal animation after bounce
      setTimeout(() => {
        setIsJiggling(false);
        
        switch (mood) {
          case 'sad':
          case 'tired':
          case 'sick':
            setAnimationClass('animate-blob-sad');
            break;
          default:
            setAnimationClass('animate-blob-idle');
        }
      }, 500);
    }
    
    onClick();
  };

  return (
    <div 
      className={cn("relative cursor-pointer", className)}
      onClick={handleClick}
    >
      {/* Blob shadow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-black/20 rounded-full"></div>
      
      {/* Main blob body */}
      <div 
        className={cn(
          "w-20 h-20 rounded-full shadow-lg",
          blobColor,
          animationClass,
          "transition-all duration-300 ease-in-out"
        )}
      >
        {/* Eyes */}
        <div className="relative w-full h-full">
          {/* Left eye */}
          <div className="absolute top-6 left-4 w-2 h-3 bg-black rounded-full"></div>
          
          {/* Right eye */}
          <div className="absolute top-6 right-4 w-2 h-3 bg-black rounded-full"></div>
          
          {/* Mouth based on mood */}
          {mood === 'happy' && (
            <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 w-8 h-3 border-b-2 border-black rounded-b-lg"></div>
          )}
          
          {mood === 'sad' && (
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-6 h-3 border-t-2 border-black rounded-t-lg"></div>
          )}
          
          {mood === 'hungry' && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black rounded-full"></div>
          )}
          
          {mood === 'tired' && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-black rounded-full"></div>
          )}
          
          {mood === 'sick' && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-5 h-5 flex items-center justify-center">
              <span className="text-black font-bold">×</span>
            </div>
          )}
          
          {mood === 'normal' && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-black rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blob;
