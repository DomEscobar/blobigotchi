
import React from 'react';
import { Dna } from 'lucide-react';

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
  return (
    <div className={`status-container ${className}`}>
      <Dna size={18} className="text-purple-400" />
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center">
          <span className="pixel-text text-xs text-gray-300">Evolution</span>
          <span className="pixel-text text-xs text-purple-300">Lvl {level}</span>
        </div>
        <div className="h-2 w-full bg-gray-800 rounded-sm overflow-hidden mt-1">
          <div 
            className="pixel-progress bg-purple-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionMeter;
