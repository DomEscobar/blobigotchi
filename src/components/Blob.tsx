
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type BlobMood = 'happy' | 'sad' | 'hungry' | 'tired' | 'sick' | 'normal';
export type BlobEvolutionPhase = 'egg' | 'blob' | 'baby' | 'adult';

interface BlobProps {
  mood: BlobMood;
  onClick: () => void;
  className?: string;
  evolutionLevel?: number;
}

const Blob: React.FC<BlobProps> = ({ mood, onClick, className, evolutionLevel = 1 }) => {
  const [animationClass, setAnimationClass] = useState('animate-blob-idle');
  const [blobColor, setBlobColor] = useState('bg-blob-primary');
  const [isJiggling, setIsJiggling] = useState(false);
  const [phase, setPhase] = useState<BlobEvolutionPhase>('blob');

  useEffect(() => {
    // Determine evolution phase based on level
    if (evolutionLevel <= 1) {
      setPhase('egg');
    } else if (evolutionLevel <= 3) {
      setPhase('blob');
    } else if (evolutionLevel <= 6) {
      setPhase('baby');
    } else {
      setPhase('adult');
    }
  }, [evolutionLevel]);

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
      
      {/* Render different evolution phases */}
      {phase === 'egg' && <EggPhase mood={mood} animationClass={animationClass} />}
      {phase === 'blob' && <BlobPhase mood={mood} blobColor={blobColor} animationClass={animationClass} />}
      {phase === 'baby' && <BabyPhase mood={mood} blobColor={blobColor} animationClass={animationClass} />}
      {phase === 'adult' && <AdultPhase mood={mood} blobColor={blobColor} animationClass={animationClass} />}
    </div>
  );
};

// Egg Phase Component - Level 1
const EggPhase: React.FC<{ mood: BlobMood; animationClass: string }> = ({ mood, animationClass }) => {
  return (
    <div className={cn("w-20 h-24 relative", animationClass)}>
      {/* Egg shell */}
      <div className="absolute bottom-0 w-16 h-20 bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-full rounded-b-3xl left-1/2 transform -translate-x-1/2"></div>
      
      {/* Cracks in egg */}
      <div className="absolute bottom-8 left-1/2 w-1 h-5 bg-gray-50 transform -translate-x-3 rotate-45"></div>
      <div className="absolute bottom-10 left-1/2 w-1 h-4 bg-gray-50 transform translate-x-4 -rotate-12"></div>
      
      {/* Blob peeking from egg */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-6 rounded-t-full bg-blob-primary animate-pulse"></div>
      
      {/* Eyes - only visible if not an egg or if hatching */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3">
        <div className="w-1.5 h-2 bg-black rounded-full"></div>
        <div className="w-1.5 h-2 bg-black rounded-full"></div>
      </div>
    </div>
  );
};

// Blob Phase Component - Levels 2-3
const BlobPhase: React.FC<{ mood: BlobMood; blobColor: string; animationClass: string }> = ({ mood, blobColor, animationClass }) => {
  return (
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
  );
};

// Baby Phase Component - Levels 4-6
const BabyPhase: React.FC<{ mood: BlobMood; blobColor: string; animationClass: string }> = ({ mood, blobColor, animationClass }) => {
  return (
    <div className="relative">
      {/* Body - slightly larger with stubby limbs */}
      <div 
        className={cn(
          "w-24 h-24 rounded-full shadow-lg relative",
          blobColor,
          animationClass,
          "transition-all duration-300 ease-in-out"
        )}
      >
        {/* Left arm - stubby */}
        <div className={cn("absolute -left-2 top-10 w-4 h-6 rounded-full", blobColor)}></div>
        
        {/* Right arm - stubby */}
        <div className={cn("absolute -right-2 top-10 w-4 h-6 rounded-full", blobColor)}></div>
        
        {/* Left leg - stubby */}
        <div className={cn("absolute left-5 -bottom-2 w-6 h-4 rounded-full", blobColor)}></div>
        
        {/* Right leg - stubby */}
        <div className={cn("absolute right-5 -bottom-2 w-6 h-4 rounded-full", blobColor)}></div>
        
        {/* Face */}
        <div className="relative w-full h-full">
          {/* Left eye - slightly larger */}
          <div className="absolute top-7 left-7 w-3 h-3 bg-black rounded-full"></div>
          
          {/* Right eye - slightly larger */}
          <div className="absolute top-7 right-7 w-3 h-3 bg-black rounded-full"></div>
          
          {/* Baby-specific feature: pacifier/toothless grin */}
          {mood === 'happy' ? (
            <div className="absolute bottom-9 left-1/2 transform -translate-x-1/2 w-8 h-3">
              <div className="w-full h-full border-b-2 border-black rounded-b-lg"></div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-blob-primary border border-black rounded-full"></div>
            </div>
          ) : (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-pink-200 border border-black rounded-full"></div>
          )}
        </div>
        
        {/* Baby onesie pattern */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-10 h-5">
          <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
          <div className="absolute top-3 left-4 w-2 h-2 bg-blue-400 rounded-full"></div>
          <div className="absolute top-1 left-8 w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// Adult Phase Component - Level 7+
const AdultPhase: React.FC<{ mood: BlobMood; blobColor: string; animationClass: string }> = ({ mood, blobColor, animationClass }) => {
  return (
    <div className="relative">
      {/* Body - full humanoid but still blob-like */}
      <div 
        className={cn(
          "w-28 h-32 rounded-2xl shadow-lg relative",
          blobColor,
          animationClass,
          "transition-all duration-300 ease-in-out"
        )}
      >
        {/* Head */}
        <div className={cn("absolute left-1/2 transform -translate-x-1/2 -top-12 w-20 h-20 rounded-full", blobColor)}>
          {/* Face */}
          <div className="relative w-full h-full">
            {/* Left eye */}
            <div className="absolute top-8 left-5 w-3 h-3 bg-black rounded-full"></div>
            
            {/* Right eye */}
            <div className="absolute top-8 right-5 w-3 h-3 bg-black rounded-full"></div>
            
            {/* Mouth based on mood */}
            {mood === 'happy' && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-10 h-3 border-b-2 border-black rounded-b-lg"></div>
            )}
            
            {mood === 'sad' && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-8 h-3 border-t-2 border-black rounded-t-lg"></div>
            )}
            
            {mood === 'hungry' && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-black"></div>
            )}
            
            {mood === 'tired' && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-black rounded-full"></div>
            )}
            
            {mood === 'sick' && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-black rounded-full"></div>
            )}
            
            {mood === 'normal' && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-black rounded-full"></div>
            )}
            
            {/* Adult-specific accessory: glasses */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-14 h-3">
              <div className="absolute left-0 w-5 h-5 border border-gray-800 rounded-full"></div>
              <div className="absolute right-0 w-5 h-5 border border-gray-800 rounded-full"></div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-0.5 bg-gray-800"></div>
            </div>
          </div>
        </div>
        
        {/* Left arm */}
        <div className={cn("absolute -left-4 top-5 w-6 h-20 rounded-full", blobColor)}>
          {/* Hand */}
          <div className={cn("absolute bottom-0 left-0 w-8 h-8 rounded-full", blobColor)}></div>
        </div>
        
        {/* Right arm */}
        <div className={cn("absolute -right-4 top-5 w-6 h-20 rounded-full", blobColor)}>
          {/* Hand */}
          <div className={cn("absolute bottom-0 right-0 w-8 h-8 rounded-full", blobColor)}></div>
        </div>
        
        {/* Left leg */}
        <div className={cn("absolute left-5 -bottom-8 w-6 h-10 rounded-full", blobColor)}></div>
        
        {/* Right leg */}
        <div className={cn("absolute right-5 -bottom-8 w-6 h-10 rounded-full", blobColor)}></div>
        
        {/* Outfit - book for the intellectual adult blob */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-10 bg-blue-100 border border-blue-700"></div>
      </div>
    </div>
  );
};

export default Blob;
