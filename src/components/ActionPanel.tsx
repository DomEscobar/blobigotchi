
import React, { useState } from 'react';
import ActionButton from './ActionButton';
import { Utensils, Gamepad, Bath, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { BlobStats } from '@/hooks/useBlobStats';
import Settings from './Settings';
import { useSettings } from '@/hooks/useSettings';

interface ActionPanelProps {
  stats: Pick<BlobStats, 'hunger' | 'energy' | 'hygiene'>;
  actions: {
    feedBlob: () => void;
    playWithBlob: () => void;
    cleanBlob: () => void;
    restBlob: () => void;
    showActionFeedback: (message: string, icon: string, important?: boolean) => void;
  };
}

const ActionPanel: React.FC<ActionPanelProps> = ({ stats, actions }) => {
  const { hunger, energy, hygiene } = stats;
  const { feedBlob, playWithBlob, cleanBlob, restBlob, showActionFeedback } = actions;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
  
  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };
  
  return (
    <>
      <div className="grid grid-cols-5 gap-1 p-2 md:p-3 bg-gray-900/70 border-t border-gray-700">
        <ActionButton 
          label="Feed" 
          icon={Utensils} 
          onClick={feedBlob} 
          disabled={hunger >= 100}
        />
        <ActionButton 
          label="Play" 
          icon={Gamepad} 
          onClick={playWithBlob}
          disabled={energy <= 10}
        />
        <ActionButton 
          label="Clean" 
          icon={Bath} 
          onClick={cleanBlob}
          disabled={hygiene >= 100}
        />
        <ActionButton 
          label="Rest" 
          icon={Sparkles} 
          onClick={restBlob}
          disabled={energy >= 100}
        />
        <ActionButton 
          label="Settings" 
          icon={SettingsIcon} 
          onClick={handleSettingsClick}
        />
      </div>
      
      <Settings 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={updateSettings}
      />
    </>
  );
};

export default ActionPanel;
