import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { toast } from "sonner";
import { useIsMobile } from './use-mobile';
import { useSounds } from './useSounds';
import { useWeather } from './useWeather';
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
  devLevelUp,
  checkEvolution,
  resetEvolutionFlags,
  resetAttackOfferFlag,
  updateLastAttackOfferLevel
} from '@/store/slices/blobStatsSlice';
import { getMoodMessage, getEvolutionMessage } from '@/utils/blobStatsCalculations';
import { BlobType, BlobAttack } from '@/hooks/useBlobAppearance';
import AttackOfferModal from '@/components/AttackOfferModal';

export function useBlobStatsRedux() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { playSoundEffect } = useSounds();
  const { weather, loading } = useWeather();
  
  // Local state for managing the attack modal
  const [availableAttack, setAvailableAttack] = useState<string | null>(null);
  
  // Get blob stats from Redux store
  const stats = useAppSelector(state => state.blobStats);
  const settings = useAppSelector(state => state.settings);
  const appearanceState = useAppSelector(state => state.blobAppearance);
  const appearance = appearanceState.appearance;
  
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

  // Decrease stats over time using real-time weather and time of day
  useEffect(() => {
    // Skip if weather data is still loading
    if (loading) return;
    
    // Update stats every second instead of every 5 seconds
    // The reducer will handle the actual rate of change
    const interval = setInterval(() => {
      dispatch(decreaseStats({ 
        weather: weather.type, 
        timeOfDay: weather.timeOfDay 
      }));
      
      // Also check if the blob should evolve based on time
      dispatch(checkEvolution());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [dispatch, weather.type, weather.timeOfDay, loading]);

  // Handle evolution notifications
  useEffect(() => {
    if (stats.justEvolved && stats.newEvolutionLevel) {
      // Play special evolution sound
      if (settings.sound) {
        playSoundEffect('levelUp');
      }
      
      // Show notification
      const evolutionMessage = getEvolutionMessage(stats.newEvolutionLevel);
      showActionFeedback(evolutionMessage, '✨', true);
      
      // Reset the evolution flags
      dispatch(resetEvolutionFlags());
    }
  }, [stats.justEvolved, stats.newEvolutionLevel, settings.sound, dispatch, playSoundEffect]);

  // Show mood messages based on weather and time
  useEffect(() => {
    // Skip if weather data is still loading
    if (loading) return;
    
    // Only show mood messages occasionally (every 2 minutes)
    const moodInterval = setInterval(() => {
      if (settings.notifications) {
        const moodMessage = getMoodMessage(
          weather.type,
          weather.timeOfDay,
          {
            hunger: stats.hunger,
            happiness: stats.happiness,
            hygiene: stats.hygiene,
            energy: stats.energy
          }
        );
        
        showActionFeedback(moodMessage, '💭', false);
      }
    }, 120000); // Every 2 minutes
    
    return () => clearInterval(moodInterval);
  }, [dispatch, weather.type, weather.timeOfDay, stats, loading, settings.notifications]);

  // Save stats changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blobStats', JSON.stringify(stats));
    }
  }, [stats]);

  // Handle attack learning related functions
  const handleAcceptAttack = (attackId: string) => {
    // Call function to add the attack to the blob's moveset
    if (appearance && typeof window !== 'undefined') {
      try {
        // Get current appearance from localStorage
        const savedAppearance = localStorage.getItem('blobAppearance');
        if (savedAppearance) {
          const parsedAppearance = JSON.parse(savedAppearance);
          
          // Update the attack
          const updatedAppearance = {
            ...parsedAppearance,
            attack: attackId as BlobAttack
          };
          
          // Save back to localStorage
          localStorage.setItem('blobAppearance', JSON.stringify(updatedAppearance));
          
          // Track the current evolution level with attack choice in localStorage
          localStorage.setItem(`attackChoiceLevel_${stats.lastAttackOfferLevel}`, attackId);
          
          // Show confirmation message
          showActionFeedback(`Your blob learned ${attackId}!`, '⚔️', true);
        }
      } catch (error) {
        console.error('Error updating attack:', error);
      }
    }
    
    // Reset the attack offer flag and update the last attack offer level
    dispatch(resetAttackOfferFlag());
    dispatch(updateLastAttackOfferLevel());
  };
  
  const handleDeclineAttack = () => {
    // User declined the attack, record the decision
    if (typeof window !== 'undefined') {
      localStorage.setItem(`attackChoiceLevel_${stats.lastAttackOfferLevel}`, 'declined');
    }
    
    // Reset the flag and update the last attack offer level
    dispatch(resetAttackOfferFlag());
    dispatch(updateLastAttackOfferLevel());
    showActionFeedback('You declined the new attack', '🚫');
  };

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
    // No longer calling increaseEvolution here
  };

  const handleBlobPlay = () => {
    dispatch(playWithBlob());
    if (settings.sound) {
      playSoundEffect('play');
    }
    showActionFeedback('Wheee! Playing is fun!', '🎮');
    // No longer calling increaseEvolution here
  };

  const handleBlobClean = () => {
    dispatch(cleanBlob());
    if (settings.sound) {
      playSoundEffect('clean');
    }
    showActionFeedback('Splish splash! Getting clean!', '🧼');
    // No longer calling increaseEvolution here
  };

  const handleBlobRest = () => {
    dispatch(restBlob());
    if (settings.sound) {
      playSoundEffect('rest');
    }
    showActionFeedback('Zzz... Blob is resting!', '💤');
    // No longer calling increaseEvolution here
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

  // Check for pending attack offers on initialization
  useEffect(() => {
    // If we have attack offers to show and one isn't showing yet
    if (!stats.showAttackOffer && stats.lastAttackOfferLevel < stats.evolutionLevel) {
      // We have pending attack offers, trigger the first one
      dispatch(resetAttackOfferFlag()); // Reset first to ensure clean state
      dispatch(updateLastAttackOfferLevel()); // This will increment and set showAttackOffer
    }
  }, [stats.lastAttackOfferLevel, stats.evolutionLevel, stats.showAttackOffer, dispatch]);

  return {
    stats,
    weather: weather,
    showAttackOfferModal: stats.showAttackOffer,
    attackModalProps: {
      isOpen: stats.showAttackOffer,
      onClose: () => {
        dispatch(resetAttackOfferFlag());
        dispatch(updateLastAttackOfferLevel());
      },
      onAccept: handleAcceptAttack,
      onDecline: handleDeclineAttack,
      blobType: appearance.type,
      evolutionLevel: stats.lastAttackOfferLevel // Show for the current offer level, not total evolution level
    },
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