
import React from 'react';
import { Gamepad, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleArcadeProps {
  onClick: () => void;
  className?: string;
  isMobile?: boolean;
}

const BattleArcade: React.FC<BattleArcadeProps> = ({ 
  onClick, 
  className = '',
  isMobile = false
}) => {
  return (
    <div 
      className={cn(
        "relative cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      {/* Arcade machine body */}
      <div className="w-16 h-20 md:w-20 md:h-24 bg-gray-900 rounded-t-lg border-2 border-gray-800 flex flex-col overflow-hidden">
        {/* Screen */}
        <div className="flex-1 m-1 bg-crt-background rounded-sm overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad size={isMobile ? 16 : 20} className="text-blob-tertiary animate-pulse" />
          </div>
          
          {/* Screen flicker effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/5 animate-crt-flicker"></div>
          
          {/* Pixel text */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-center">
            <div className="text-[6px] md:text-[8px] text-cyan-400 pixel-text animate-blink">BATTLE</div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="h-6 md:h-8 bg-gray-800 border-t border-gray-700 flex items-center justify-center">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500 mx-1"></div>
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500 mx-1"></div>
        </div>
      </div>
      
      {/* Stand */}
      <div className="w-12 h-2 md:w-16 md:h-3 bg-gray-800 mx-auto rounded-b-sm"></div>
      
      {/* Play indicator */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blob-secondary/80 px-1 py-0.5 rounded text-[8px] md:text-[10px] text-white pixel-text flex items-center">
        PLAY <ArrowRight size={8} className="ml-1" />
      </div>
    </div>
  );
};

export default BattleArcade;
