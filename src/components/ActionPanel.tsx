
import React, { useState } from 'react';
import ActionButton from './ActionButton';
import { Utensils, Gamepad, Bath, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { BlobStats } from '@/hooks/useBlobStats';
import Settings from './Settings';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { useSounds } from '@/hooks/useSounds';

interface ActionPanelProps {
  stats: Pick<BlobStats, 'hunger' | 'energy' | 'hygiene'>;
  actions: {
    feedBlob: () => void;
    playWithBlob: () => void;
    cleanBlob: () => void;
    restBlob: () => void;
    showActionFeedback: (message: string, icon: string, important?: boolean) => void;
    handleDevAction?: (action: string, value?: number) => void;
  };
}

const ActionPanel: React.FC<ActionPanelProps> = ({ stats, actions }) => {
  const { hunger, energy, hygiene } = stats;
  // Rename the destructured handleDevAction to devActionHandler to avoid naming conflicts
  const { feedBlob, playWithBlob, cleanBlob, restBlob, handleDevAction: devActionHandler } = actions;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const { playSoundEffect } = useSounds();
  
  // Play sounds only if enabled in settings
  const playSound = (sound: 'feed' | 'play' | 'clean' | 'rest' | 'click') => {
    if (settings.sound) {
      playSoundEffect(sound);
    }
  };
  
  const handleSettingsClick = () => {
    setSettingsOpen(true);
    playSound('click');
  };
  
  const handleSettingsChange = (newSettings: Partial<typeof settings>) => {
    updateSettings(newSettings);
    
    // Play a sound when settings are changed if sounds are enabled
    // If we're enabling sounds, play a sound to demonstrate
    if (newSettings.sound === true || (settings.sound && newSettings.sound !== false)) {
      playSoundEffect('click');
    }
    
    // Show feedback when settings are changed
    if (settings.notifications || (newSettings.notifications !== false)) {
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    }
  };

  // Create a wrapper function to handle developer actions
  const handleDevAction = (action: string, value?: number) => {
    if (devActionHandler) {
      devActionHandler(action, value);
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-5 gap-1 p-2 md:p-3 bg-gray-900/70 border-t border-gray-700">
        <ActionButton 
          label="Feed" 
          icon={Utensils} 
          onClick={() => {
            feedBlob();
            playSound('feed');
          }} 
          disabled={hunger >= 100}
        />
        <ActionButton 
          label="Play" 
          icon={Gamepad} 
          onClick={() => {
            playWithBlob();
            playSound('play');
          }}
          disabled={energy <= 10}
        />
        <ActionButton 
          label="Clean" 
          icon={Bath} 
          onClick={() => {
            cleanBlob();
            playSound('clean');
          }}
          disabled={hygiene >= 100}
        />
        <ActionButton 
          label="Rest" 
          icon={Sparkles} 
          onClick={() => {
            restBlob();
            playSound('rest');
          }}
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
        onSettingsChange={handleSettingsChange}
        onDevAction={handleDevAction}
      />
    </>
  );
};

export default ActionPanel;
