import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { BlobAppearance } from '@/hooks/useBlobAppearance';

export type BlobMood = 'happy' | 'sad' | 'hungry' | 'tired' | 'sick' | 'normal';
export type BlobEvolutionPhase = 'egg' | 'blob' | 'baby' | 'adult';

interface BlobProps {
  mood: BlobMood;
  onClick: () => void;
  className?: string;
  evolutionLevel?: number;
  appearance?: BlobAppearance;
}

const Blob: React.FC<BlobProps> = ({ mood, onClick, className, evolutionLevel = 1, appearance }) => {
  const [animationClass, setAnimationClass] = useState('animate-blob-idle');
  const [blobColor, setBlobColor] = useState('bg-blob-primary');
  const [isJiggling, setIsJiggling] = useState(false);
  const [phase, setPhase] = useState<BlobEvolutionPhase>('blob');

  useEffect(() => {
    // Determine evolution phase based on level
    if (evolutionLevel <= 1) {
      setPhase('egg');
    } else if (evolutionLevel <= 6) {
      setPhase('blob');
    } else if (evolutionLevel <= 10) {
      setPhase('baby');
    } else {
      setPhase('adult');
    }
  }, [evolutionLevel]);

  useEffect(() => {
    // Update blob appearance based on mood and type
    switch (mood) {
      case 'happy':
        setAnimationClass('animate-blob-idle');
        setBlobColor(appearance?.type === 'normal' ? 'bg-blob-happy' : getColorFromType(appearance));
        break;
      case 'sad':
        setAnimationClass('animate-blob-sad');
        setBlobColor(appearance?.type === 'normal' ? 'bg-blob-sad' : getColorFromType(appearance));
        break;
      case 'hungry':
        setAnimationClass('animate-blob-idle');
        setBlobColor(appearance?.type === 'normal' ? 'bg-blob-hungry' : getColorFromType(appearance));
        break;
      case 'tired':
        setAnimationClass('animate-blob-sad');
        setBlobColor(appearance?.type === 'normal' ? 'bg-blob-tired' : getColorFromType(appearance));
        break;
      case 'sick':
        setAnimationClass('animate-blob-sad');
        setBlobColor(appearance?.type === 'normal' ? 'bg-blob-sick' : getColorFromType(appearance));
        break;
      default:
        setAnimationClass('animate-blob-idle');
        setBlobColor(getColorFromType(appearance));
    }
  }, [mood, appearance]);

  const getColorFromType = (appearance?: BlobAppearance) => {
    if (!appearance) return 'bg-blob-primary';
    
    switch (appearance.type) {
      case 'fire':
        return 'bg-red-400';
      case 'water':
        return 'bg-blue-400';
      case 'electric':
        return 'bg-yellow-400';
      case 'grass':
        return 'bg-green-400';
      case 'ice':
        return 'bg-cyan-300';
      case 'fighting':
        return 'bg-orange-600';
      case 'poison':
        return 'bg-purple-500';
      case 'ground':
        return 'bg-amber-600';
      case 'rock':
        return 'bg-stone-500';
      case 'psychic':
        return 'bg-pink-400';
      case 'ghost':
        return 'bg-indigo-500';
      default:
        return 'bg-blob-primary';
    }
  };

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
      {phase === 'egg' && <EggPhase mood={mood} animationClass={animationClass} appearance={appearance} />}
      {phase === 'blob' && <BlobPhase mood={mood} blobColor={blobColor} animationClass={animationClass} appearance={appearance} />}
      {phase === 'baby' && <BabyPhase mood={mood} blobColor={blobColor} animationClass={animationClass} appearance={appearance} />}
      {phase === 'adult' && <AdultPhase mood={mood} blobColor={blobColor} animationClass={animationClass} appearance={appearance} />}
    </div>
  );
};

// Egg Phase Component - Level 1
const EggPhase: React.FC<{ mood: BlobMood; animationClass: string; appearance?: BlobAppearance }> = ({ mood, animationClass, appearance }) => {
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

// Utility function to get eye component based on appearance
const getEyeComponent = (eyeStyle: string) => {
  switch (eyeStyle) {
    case 'round':
      return <div className="absolute w-full h-full bg-black rounded-full border-2 border-white"></div>;
    case 'oval':
      return <div className="absolute w-full h-full bg-black rounded-full transform scale-y-150"></div>;
    case 'star':
      return (
        <div className="absolute w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-full h-full text-black">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor" />
          </svg>
        </div>
      );
    case 'heart':
      return (
        <div className="absolute w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-full h-full text-black">
            <path d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z" fill="currentColor" />
          </svg>
        </div>
      );
    case 'square':
      return <div className="absolute w-3/4 h-3/4 bg-black rounded-sm mx-auto my-auto"></div>;
    default:
      return <div className="absolute w-full h-full bg-black rounded-full"></div>;
  }
};

// Utility function to get mouth component based on appearance
const getMouthComponent = (mouthStyle: string, mood: BlobMood) => {
  // For sad/sick/tired moods, use mood-specific mouth
  if (mood === 'sad' || mood === 'sick' || mood === 'tired') {
    return <div className="w-full h-full border-t-2 border-black rounded-t-lg"></div>;
  }
  
  if (mood === 'hungry') {
    return <div className="w-full h-full bg-black rounded-full"></div>;
  }
  
  // For other moods, use the chosen mouth style
  switch (mouthStyle) {
    case 'wide':
      return <div className="w-full h-full border-b-2 border-black rounded-b-lg transform scale-x-125"></div>;
    case 'small':
      return <div className="w-3/4 h-3/4 border-b-2 border-black rounded-b-lg mx-auto"></div>;
    case 'kawaii':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-1/2 h-1/2 border-b-2 border-l-2 border-r-2 border-black rounded-b-full"></div>
        </div>
      );
    case 'surprised':
      return <div className="w-2/3 h-2/3 bg-black rounded-full mx-auto"></div>;
    case 'cool':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-3/4 h-1/3 bg-black rounded-sm transform rotate-12"></div>
        </div>
      );
    default:
      return <div className="w-full h-full border-b-2 border-black rounded-b-lg"></div>;
  }
};

// Utility function to get attack component based on appearance
const getAttackComponent = (attackType: string) => {
  switch (attackType) {
    case 'fireball':
      return (
        <div className="absolute -right-6 top-6 w-6 h-6">
          <div className="w-full h-full bg-red-500 rounded-full animate-pulse">
            <div className="absolute inset-0 bg-orange-400 rounded-full transform scale-75 animate-ping opacity-70"></div>
          </div>
        </div>
      );
    case 'watergun':
      return (
        <div className="absolute -right-10 top-8 w-10 h-3">
          <div className="w-full h-full bg-blue-400 rounded-full animate-pulse">
            <div className="absolute right-0 top-0 w-3 h-3 bg-blue-300 rounded-full"></div>
            <div className="absolute right-3 top-0 w-2 h-2 bg-blue-300 rounded-full"></div>
            <div className="absolute right-6 top-0 w-1 h-1 bg-blue-300 rounded-full"></div>
          </div>
        </div>
      );
    case 'thunderbolt':
      return (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-8">
          <div className="w-2 h-full bg-yellow-400 absolute left-2 animate-pulse">
            <div className="absolute bottom-0 left-0 w-3 h-3 bg-yellow-300 rounded-full"></div>
          </div>
          <div className="w-2 h-4 bg-yellow-400 absolute top-3 -right-1 animate-ping opacity-70"></div>
        </div>
      );
    case 'rockthrow':
      return (
        <div className="absolute -top-6 -right-4 w-8 h-8">
          <div className="w-4 h-4 bg-stone-500 absolute top-2 left-0 rounded-md transform rotate-12"></div>
          <div className="w-3 h-3 bg-stone-600 absolute bottom-0 right-2 rounded-md transform -rotate-45"></div>
        </div>
      );
    case 'leafblade':
      return (
        <div className="absolute top-0 -right-5 w-6 h-12">
          <div className="w-3 h-8 bg-green-500 absolute left-0 top-0 rounded transform -rotate-12"></div>
          <div className="w-3 h-6 bg-green-600 absolute right-0 bottom-0 rounded transform rotate-12"></div>
        </div>
      );
    case 'psychicwave':
      return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-6">
          <div className="w-full h-2 bg-pink-400 absolute top-0 rounded-full opacity-70 animate-pulse"></div>
          <div className="w-10 h-1 bg-pink-500 absolute bottom-0 left-3 rounded-full opacity-70 animate-ping"></div>
        </div>
      );
    case 'shadowball':
      return (
        <div className="absolute -left-5 top-8 w-5 h-5">
          <div className="w-full h-full bg-indigo-800 rounded-full">
            <div className="absolute inset-0 bg-indigo-900 rounded-full transform scale-50 animate-ping opacity-70"></div>
            <div className="absolute inset-0 border-2 border-indigo-300 rounded-full animate-pulse"></div>
          </div>
        </div>
      );
    case 'icebeam':
      return (
        <div className="absolute -left-8 top-6 w-8 h-4">
          <div className="w-full h-full bg-cyan-200 rounded-r-full">
            <div className="absolute left-0 top-0 w-2 h-2 bg-cyan-100 rounded-full"></div>
            <div className="absolute left-2 bottom-0 w-2 h-2 bg-cyan-100 rounded-full"></div>
            <div className="absolute right-0 top-0 w-4 h-1 bg-cyan-100 rounded-full"></div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

// Blob Phase Component - Levels 2-3
const BlobPhase: React.FC<{ mood: BlobMood; blobColor: string; animationClass: string; appearance?: BlobAppearance }> = ({ mood, blobColor, animationClass, appearance }) => {
  return (
    <div className="relative">
      {/* Attack */}
      {appearance?.attack && appearance.attack !== 'none' && getAttackComponent(appearance.attack)}
      
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
          <div className="absolute top-6 left-4 w-2 h-3">
            {appearance?.eyes ? getEyeComponent(appearance.eyes) : <div className="w-full h-full bg-black rounded-full"></div>}
          </div>
          
          {/* Right eye */}
          <div className="absolute top-6 right-4 w-2 h-3">
            {appearance?.eyes ? getEyeComponent(appearance.eyes) : <div className="w-full h-full bg-black rounded-full"></div>}
          </div>
          
          {/* Mouth based on mood and appearance */}
          <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 w-8 h-3">
            {appearance?.mouth ? getMouthComponent(appearance.mouth, mood) : getMouthComponent('default', mood)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Baby Phase Component - Levels 4-6
const BabyPhase: React.FC<{ mood: BlobMood; blobColor: string; animationClass: string; appearance?: BlobAppearance }> = ({ mood, blobColor, animationClass, appearance }) => {
  return (
    <div className="relative">
      {/* Attack */}
      {appearance?.attack && appearance.attack !== 'none' && getAttackComponent(appearance.attack)}
      
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
          <div className="absolute top-7 left-7 w-3 h-3">
            {appearance?.eyes ? getEyeComponent(appearance.eyes) : <div className="w-full h-full bg-black rounded-full"></div>}
          </div>
          
          {/* Right eye - slightly larger */}
          <div className="absolute top-7 right-7 w-3 h-3">
            {appearance?.eyes ? getEyeComponent(appearance.eyes) : <div className="w-full h-full bg-black rounded-full"></div>}
          </div>
          
          {/* Mouth based on mood and appearance */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-3">
            {appearance?.mouth ? getMouthComponent(appearance.mouth, mood) : getMouthComponent('default', mood)}
          </div>
        </div>
        
      </div>
    </div>
  );
};

// Adult Phase Component - Level 7+
const AdultPhase: React.FC<{ mood: BlobMood; blobColor: string; animationClass: string; appearance?: BlobAppearance }> = ({ mood, blobColor, animationClass, appearance }) => {
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
          {/* Attack (placed above head) */}
          {appearance?.attack && appearance.attack !== 'none' && getAttackComponent(appearance.attack)}
          
          {/* Face */}
          <div className="relative w-full h-full">
            {/* Left eye */}
            <div className="absolute top-8 left-5 w-3 h-3">
              {appearance?.eyes ? getEyeComponent(appearance.eyes) : <div className="w-full h-full bg-black rounded-full"></div>}
            </div>
            
            {/* Right eye */}
            <div className="absolute top-8 right-5 w-3 h-3">
              {appearance?.eyes ? getEyeComponent(appearance.eyes) : <div className="w-full h-full bg-black rounded-full"></div>}
            </div>
            
            {/* Mouth based on mood and appearance */}
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-10 h-3">
              {appearance?.mouth ? getMouthComponent(appearance.mouth, mood) : getMouthComponent('default', mood)}
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
