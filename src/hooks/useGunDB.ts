
import { useState, useEffect } from 'react';
import Gun from 'gun';

// Initialize our Gun instance
const gun = Gun({
  peers: ['https://gun-manhattan.herokuapp.com/gun'], // Public relay server (for demo)
  localStorage: false, // Use indexedDB instead of localStorage
});

export interface BlobBattleRecord {
  id: string;
  player1: string;
  player2: string;
  winner?: string;
  date: number;
  moves: string[];
}

export interface BlobProfile {
  username: string;
  wins: number;
  losses: number;
  lastActive: number;
  evolutionLevel: number;
}

/**
 * Hook to interact with Gun.js database
 */
export function useGunDB() {
  const [isConnected, setIsConnected] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, BlobProfile>>({});
  const [battles, setBattles] = useState<Record<string, BlobBattleRecord>>({});

  // Connect and subscribe to data changes
  useEffect(() => {
    // Check connection status
    const timer = setTimeout(() => {
      setIsConnected(Object.keys(gun._.opt.peers).length > 0);
    }, 1000);

    // Subscribe to profiles
    const profilesRef = gun.get('blobverse').get('profiles');
    profilesRef.map().on((profile, id) => {
      if (profile && id) {
        setProfiles(prev => ({
          ...prev,
          [id]: profile as BlobProfile
        }));
      }
    });

    // Subscribe to battles
    const battlesRef = gun.get('blobverse').get('battles');
    battlesRef.map().on((battle, id) => {
      if (battle && id) {
        setBattles(prev => ({
          ...prev,
          [id]: battle as BlobBattleRecord
        }));
      }
    });

    return () => {
      clearTimeout(timer);
      profilesRef.off();
      battlesRef.off();
    };
  }, []);

  // Save user profile
  const saveProfile = (userId: string, profile: Partial<BlobProfile>) => {
    const profileRef = gun.get('blobverse').get('profiles').get(userId);
    
    // First get existing data
    profileRef.once((data) => {
      const updatedProfile = {
        ...(data || {}),
        ...profile,
        lastActive: Date.now(),
      };
      
      // Then save the merged data
      profileRef.put(updatedProfile as any);
    });
  };

  // Record a battle
  const recordBattle = (battleData: Omit<BlobBattleRecord, 'id'>) => {
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const battle = {
      ...battleData,
      id: battleId,
    };
    
    gun.get('blobverse').get('battles').get(battleId).put(battle as any);
    return battleId;
  };

  // Get recent battles
  const getRecentBattles = () => {
    return Object.values(battles)
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
  };

  // Get user stats
  const getUserStats = (userId: string) => {
    const profile = profiles[userId];
    return profile || null;
  };

  return {
    isConnected,
    profiles,
    battles,
    saveProfile,
    recordBattle,
    getRecentBattles,
    getUserStats,
  };
}
