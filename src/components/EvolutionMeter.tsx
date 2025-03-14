
import React from 'react';
import { Dna } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EvolutionMeterProps {
  level: number;
  progress: number;
  className?: string;
}

const EvolutionMeter: React.FC<EvolutionMeterProps> = ({ 
  level, 
  progress, 
  className = '' 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`status-container ${className}`}>
      <div className="flex items-center px-2 py-1 w-full">
        <Dna size={isMobile ? 16 : 18} className="text-purple-400 mr-2" />
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center">
            <span className={`pixel-text ${isMobile ? 'text-[10px]' : 'text-xs'} text-white`}>Evolution</span>
            <span className={`pixel-text ${isMobile ? 'text-[10px]' : 'text-xs'} text-purple-300`}>Lvl {level}</span>
          </div>
          <div className="h-2 w-full bg-gray-800 rounded-sm overflow-hidden mt-1">
            <div 
              className="pixel-progress bg-purple-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionMeter;
