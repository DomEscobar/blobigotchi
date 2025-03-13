
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
    <div className="grid grid-cols-2 gap-1 md:gap-2 p-2 md:p-4 z-10">
      <div className="space-y-1 md:space-y-2">
        <StatusBar 
          label="Hunger" 
          value={hunger} 
          icon={Flame} 
          color="blob-hungry" 
        />
        <StatusBar 
          label="Happiness" 
          value={happiness} 
          icon={Heart} 
          color="blob-happy" 
        />
      </div>
      <div className="space-y-1 md:space-y-2">
        <StatusBar 
          label="Hygiene" 
          value={hygiene} 
          icon={Droplet} 
          color="blob-sick" 
        />
        <StatusBar 
          label="Energy" 
          value={energy} 
          icon={Battery} 
          color="blob-tired" 
        />
      </div>
      <EvolutionMeter 
        level={evolutionLevel} 
        progress={evolutionProgress} 
        className="col-span-2 mt-1" 
      />
    </div>
  );
};

export default StatsPanel;
