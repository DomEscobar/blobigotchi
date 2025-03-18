import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { toast } from "sonner";
import { useIsMobile } from './use-mobile';
import { useSounds } from './useSounds';
import {
  BlobStats,
  setMood,
  decreaseStats,
  feedBlob,
  playWithBlob,
  cleanBlob,
  restBlob,
  handleBlobClick,
  increaseEvolution,
  devLevelUp
} from '@/store/slices/blobStatsSlice';

export function useBlobStatsRedux() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { playSoundEffect } = useSounds();
  
  // Get blob stats from Redux store
  const stats = useAppSelector(state => state.blobStats);
  const settings = useAppSelector(state => state.settings);
  
  // Update blob's mood based on stats
  useEffect(() => {
    const { hunger, happiness, hygiene, energy } = stats;
    
    if (hunger < 20) {
      dispatch(setMood('hungry'));
    } else if (happiness < 20) {
      dispatch(setMood('sad'));
    } else if (hygiene < 20) {
      dispatch(setMood('sick'));
    } else if (energy < 20) {
      dispatch(setMood('tired'));
    } else if (happiness > 80 && hunger > 60 && hygiene > 60) {
      dispatch(setMood('happy'));
    } else {
      dispatch(setMood('normal'));
    }
  }, [stats.hunger, stats.happiness, stats.hygiene, stats.energy, dispatch]);

  // Decrease stats over time (simulating needs growing over time)
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(decreaseStats());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  // Save stats changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blobStats', JSON.stringify(stats));
    }
  }, [stats]);

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

  const handleBlobFeed = () => {
    dispatch(feedBlob());
    if (settings.sound) {
      playSoundEffect('feed');
    }
    showActionFeedback('Yum! Blob is eating...', '🍔');
    dispatch(increaseEvolution());
  };

  const handleBlobPlay = () => {
    dispatch(playWithBlob());
    if (settings.sound) {
      playSoundEffect('play');
    }
    showActionFeedback('Wheee! Playing is fun!', '🎮');
    dispatch(increaseEvolution());
  };

  const handleBlobClean = () => {
    dispatch(cleanBlob());
    if (settings.sound) {
      playSoundEffect('clean');
    }
    showActionFeedback('Splish splash! Getting clean!', '🧼');
    dispatch(increaseEvolution());
  };

  const handleBlobRest = () => {
    dispatch(restBlob());
    if (settings.sound) {
      playSoundEffect('rest');
    }
    showActionFeedback('Zzz... Blob is resting!', '💤');
    dispatch(increaseEvolution());
  };

  const handleBlobInteraction = () => {
    dispatch(handleBlobClick());
    if (settings.sound) {
      playSoundEffect('click');
    }
    
    if (stats.actionCounter % 5 === 0) {
      showActionFeedback('Blob loves the attention!', '❤️');
    }
  };

  // Developer action handler
  const handleDevAction = (action: string, value?: number) => {
    if (action === 'levelUp' && value && value > 0) {
      // For developer mode - directly increase evolution level
      dispatch(devLevelUp(value));
      
      if (value === 1) {
        showActionFeedback('DEV MODE: Level Up!', '🔧✨', true);
      } else {
        showActionFeedback(`DEV MODE: Jumped to Level ${stats.evolutionLevel + (value - 1)}!`, '🔧🔧✨', true);
      }
    }
  };

  return {
    stats,
    actions: {
      feedBlob: handleBlobFeed,
      playWithBlob: handleBlobPlay,
      cleanBlob: handleBlobClean,
      restBlob: handleBlobRest,
      handleBlobClick: handleBlobInteraction,
      showActionFeedback,
      handleDevAction
    }
  };
} 