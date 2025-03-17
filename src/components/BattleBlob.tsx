
import React, { useState, useEffect } from 'react';
import Blob from './Blob';
import { cn } from '@/lib/utils';

interface BattleBlobProps {
  mood: 'happy' | 'sad' | 'hungry' | 'tired' | 'sick' | 'normal';
  evolutionLevel: number;
  isAttacking?: boolean;
  isHurt?: boolean;
}

const BattleBlob: React.FC<BattleBlobProps> = ({ 
  mood, 
  evolutionLevel, 
  isAttacking = false,
  isHurt = false
}) => {
  const [animationClass, setAnimationClass] = useState('');
  const [effectClass, setEffectClass] = useState('');
  
  useEffect(() => {
    if (isAttacking) {
      setAnimationClass('animate-battle-attack');
      setTimeout(() => setAnimationClass(''), 500);
    } else if (isHurt) {
      setAnimationClass('animate-battle-hurt');
      setEffectClass('after:bg-red-500/30 after:absolute after:inset-0');
      setTimeout(() => {
        setAnimationClass('');
        setEffectClass('');
      }, 500);
    }
  }, [isAttacking, isHurt]);
  
  return (
    <div className={cn(
      "relative", 
      animationClass, 
      effectClass
    )}>
      <Blob 
        mood={mood} 
        onClick={() => {}} 
        evolutionLevel={evolutionLevel}
      />
      
      {/* Attack effect */}
      {isAttacking && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-full top-1/2 -translate-y-1/2 w-16 h-4 bg-yellow-400/50 rounded-full animate-battle-beam"></div>
        </div>
      )}
      
      {/* Hit effect */}
      {isHurt && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-2xl text-red-500 font-bold animate-battle-damage">-{Math.floor(Math.random() * 15 + 5)}</div>
        </div>
      )}
    </div>
  );
};

export default BattleBlob;
