
import React, { useState, useEffect } from 'react';
import ActionButton from './ActionButton';
import { Utensils, Gamepad, Bath, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { BlobStats } from '@/hooks/useBlobStats';
import Settings from './Settings';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  // Only show notifications if enabled in settings
  const handleAction = (action: () => void, message: string, icon: string) => {
    action();
    if (settings.notifications) {
      showActionFeedback(message, icon);
    }
  };
  
  // Play sounds only if enabled in settings
  const playSound = (sound: string) => {
    if (settings.sound) {
      // Play the sound (this is a placeholder, implement actual sound logic if needed)
      console.log(`Playing sound: ${sound}`);
    }
  };
  
  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };
  
  const handleSettingsChange = (newSettings: Partial<typeof settings>) => {
    updateSettings(newSettings);
    
    // Show feedback when settings are changed
    if (settings.notifications) {
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
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
            if (settings.sound) playSound('feed');
            if (settings.notifications) showActionFeedback("Blob fed!", "🍔");
          }} 
          disabled={hunger >= 100}
        />
        <ActionButton 
          label="Play" 
          icon={Gamepad} 
          onClick={() => {
            playWithBlob();
            if (settings.sound) playSound('play');
            if (settings.notifications) showActionFeedback("Playing with blob!", "🎮");
          }}
          disabled={energy <= 10}
        />
        <ActionButton 
          label="Clean" 
          icon={Bath} 
          onClick={() => {
            cleanBlob();
            if (settings.sound) playSound('clean');
            if (settings.notifications) showActionFeedback("Blob cleaned!", "🧼");
          }}
          disabled={hygiene >= 100}
        />
        <ActionButton 
          label="Rest" 
          icon={Sparkles} 
          onClick={() => {
            restBlob();
            if (settings.sound) playSound('rest');
            if (settings.notifications) showActionFeedback("Blob is resting!", "💤");
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
      />
    </>
  );
};

export default ActionPanel;
