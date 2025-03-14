
import { useState, useEffect } from 'react';
import { BlobMood } from '@/components/Blob';
import { toast } from "sonner";
import { useIsMobile } from './use-mobile';
import { useSounds } from './useSounds';
import { useSettings } from './useSettings';

export interface BlobStats {
  hunger: number;
  happiness: number;
  hygiene: number;
  energy: number;
  evolutionLevel: number;
  evolutionProgress: number;
  mood: BlobMood;
  actionCounter: number;
  lastAction: string | null;
}

export function useBlobStats() {
  const isMobile = useIsMobile();
  const { playSoundEffect } = useSounds();
  const { settings } = useSettings();
  
  // Blob stats state
  const [hunger, setHunger] = useState(80);
  const [happiness, setHappiness] = useState(70);
  const [hygiene, setHygiene] = useState(90);
  const [energy, setEnergy] = useState(60);
  const [evolutionLevel, setEvolutionLevel] = useState(1);
  const [evolutionProgress, setEvolutionProgress] = useState(25);
  const [mood, setMood] = useState<BlobMood>('normal');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [actionCounter, setActionCounter] = useState(0);

  // Update blob's mood based on stats
  useEffect(() => {
    if (hunger < 20) {
      setMood('hungry');
    } else if (happiness < 20) {
      setMood('sad');
    } else if (hygiene < 20) {
      setMood('sick');
    } else if (energy < 20) {
      setMood('tired');
    } else if (happiness > 80 && hunger > 60 && hygiene > 60) {
      setMood('happy');
    } else {
      setMood('normal');
    }
  }, [hunger, happiness, hygiene, energy]);

  // Decrease stats over time (simulating needs growing over time)
  useEffect(() => {
    const interval = setInterval(() => {
      setHunger(prev => Math.max(0, prev - 1));
      setHappiness(prev => Math.max(0, prev - 0.5));
      setHygiene(prev => Math.max(0, prev - 0.3));
      setEnergy(prev => Math.max(0, prev - 0.7));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const showActionFeedback = (message: string, icon: string, important = false) => {
    // Only show notifications if enabled in settings
    if (!settings.notifications) return;
    
    if (important) {
      toast(message, {
        description: icon.repeat(3),
        duration: 5000,
        className: `pixel-text bg-crt-background border border-blob-tertiary text-white ${isMobile ? 'text-xs' : ''}`,
      });
    } else {
      toast(message, {
        description: icon,
        duration: 3000,
        className: `pixel-text bg-crt-background border border-gray-700 text-white ${isMobile ? 'text-xs' : ''}`,
      });
    }
  };

  const increaseEvolution = () => {
    setActionCounter(prev => {
      const newCount = prev + 1;
      if (newCount % 10 === 0) {
        setEvolutionProgress(prevProgress => {
          const newProgress = prevProgress + 10;
          if (newProgress >= 100) {
            if (settings.sound) {
              // Play a special sound for evolution
              playSoundEffect('play');
              setTimeout(() => playSoundEffect('feed'), 300);
            }
            setEvolutionLevel(prevLevel => prevLevel + 1);
            showActionFeedback('LEVEL UP! Blob has evolved!', '✨', true);
            return 0;
          }
          return newProgress;
        });
      }
      return newCount;
    });
  };

  // Developer action handler
  const handleDevAction = (action: string, value?: number) => {
    if (action === 'levelUp' && value && value > 0) {
      // For developer mode - directly increase evolution level
      if (value === 1) {
        // Increase progress by 50%
        setEvolutionProgress(prev => {
          const newProgress = prev + 50;
          if (newProgress >= 100) {
            setEvolutionLevel(prevLevel => prevLevel + 1);
            showActionFeedback('DEV MODE: Level Up!', '🔧✨', true);
            return newProgress - 100;
          }
          return newProgress;
        });
      } else {
        // Directly increase multiple levels
        setEvolutionLevel(prev => prev + (value - 1));
        setEvolutionProgress(0);
        showActionFeedback(`DEV MODE: Jumped to Level ${evolutionLevel + (value - 1)}!`, '🔧🔧✨', true);
      }
    }
  };

  // Action handlers
  const feedBlob = () => {
    const newHunger = Math.min(100, hunger + 20);
    setHunger(newHunger);
    setEnergy(prev => Math.min(100, prev + 5));
    setHygiene(prev => Math.max(0, prev - 5));
    
    setLastAction('feed');
    increaseEvolution();
    showActionFeedback('Yum! Blob is eating...', '🍔');
  };

  const playWithBlob = () => {
    const newHappiness = Math.min(100, happiness + 25);
    setHappiness(newHappiness);
    setEnergy(prev => Math.max(0, prev - 15));
    setHunger(prev => Math.max(0, prev - 10));
    
    setLastAction('play');
    increaseEvolution();
    showActionFeedback('Wheee! Playing is fun!', '🎮');
  };

  const cleanBlob = () => {
    const newHygiene = Math.min(100, hygiene + 30);
    setHygiene(newHygiene);
    setEnergy(prev => Math.max(0, prev - 5));
    
    setLastAction('clean');
    increaseEvolution();
    showActionFeedback('Splish splash! Getting clean!', '🧼');
  };

  const restBlob = () => {
    const newEnergy = Math.min(100, energy + 40);
    setEnergy(newEnergy);
    setHunger(prev => Math.max(0, prev - 5));
    setHappiness(prev => Math.max(0, prev - 5));
    
    setLastAction('rest');
    increaseEvolution();
    showActionFeedback('Zzz... Blob is resting!', '💤');
  };

  const handleBlobClick = () => {
    setHappiness(prev => Math.min(100, prev + 5));
    setActionCounter(prev => prev + 1);
    
    if (actionCounter % 5 === 0) {
      showActionFeedback('Blob loves the attention!', '❤️');
    }
  };

  return {
    stats: {
      hunger,
      happiness,
      hygiene,
      energy,
      evolutionLevel,
      evolutionProgress,
      mood,
      lastAction,
      actionCounter
    },
    actions: {
      feedBlob,
      playWithBlob,
      cleanBlob,
      restBlob,
      handleBlobClick,
      showActionFeedback,
      handleDevAction
    }
  };
}
