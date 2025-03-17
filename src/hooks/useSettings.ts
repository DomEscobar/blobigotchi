
import { useState, useEffect } from 'react';
import { useGunDB } from './useGunDB';

type Theme = 'default' | 'blue' | 'green' | 'pink';

interface Settings {
  sound: boolean;
  notifications: boolean;
  theme: Theme;
  devMode?: boolean;
  username: string;
}

const DEFAULT_SETTINGS: Settings = {
  sound: true,
  notifications: true,
  theme: 'default',
  devMode: false,
  username: `Blob Trainer ${Math.floor(Math.random() * 9000) + 1000}`
};

export function useSettings() {
  // Initialize from localStorage or use defaults
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('blob-settings');
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });

  const { saveProfile, getUserStats } = useGunDB();
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  // Save to localStorage when settings change
  useEffect(() => {
    localStorage.setItem('blob-settings', JSON.stringify(settings));
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // Handle sound setting
    if (settings.sound) {
      document.documentElement.classList.remove('mute-sounds');
    } else {
      document.documentElement.classList.add('mute-sounds');
    }
    
    // Handle notifications setting
    if (settings.notifications) {
      document.documentElement.classList.remove('disable-notifications');
    } else {
      document.documentElement.classList.add('disable-notifications');
    }

    // Sync with Gun.js if settings are initialized
    if (settingsInitialized && settings.username) {
      saveProfile(settings.username, {
        username: settings.username,
        lastActive: Date.now(),
        // Do not override existing stats if they exist
        wins: 0,
        losses: 0,
        evolutionLevel: 0,
      });
    }
  }, [settings, settingsInitialized, saveProfile]);

  // Fetch user stats from Gun.js when username changes
  useEffect(() => {
    if (settings.username) {
      const userStats = getUserStats(settings.username);
      if (userStats) {
        console.log('Loaded user stats from GunDB:', userStats);
      }
      setSettingsInitialized(true);
    }
  }, [settings.username, getUserStats]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    updateSettings
  };
}
