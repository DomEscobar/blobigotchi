
import React from 'react';
import StatusBar from './StatusBar';
import EvolutionMeter from './EvolutionMeter';
import { Heart, Droplet, Flame, Battery } from 'lucide-react';
import { BlobStats } from '@/hooks/useBlobStats';

interface StatsPanelProps {
  stats: Pick<BlobStats, 'hunger' | 'happiness' | 'hygiene' | 'energy' | 'evolutionLevel' | 'evolutionProgress'>;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const { hunger, happiness, hygiene, energy, evolutionLevel, evolutionProgress } = stats;
  
  return (
    <div className="grid grid-cols-2 gap-2 p-2 md:p-3 z-10">
      <StatusBar 
        label="Hunger" 
        value={hunger} 
        icon={Flame} 
        color="red-500" 
      />
      <StatusBar 
        label="Hygiene" 
        value={hygiene} 
        icon={Droplet} 
        color="green-500" 
      />
      <StatusBar 
        label="Happiness" 
        value={happiness} 
        icon={Heart} 
        color="yellow-500" 
      />
      <StatusBar 
        label="Energy" 
        value={energy} 
        icon={Battery} 
        color="blue-400" 
      />
      <EvolutionMeter 
        level={evolutionLevel} 
        progress={evolutionProgress} 
        className="col-span-2 mt-1 bg-black/90 border-gray-700" 
      />
    </div>
  );
};

export default StatsPanel;
