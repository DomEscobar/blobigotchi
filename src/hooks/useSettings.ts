
import { useState, useEffect } from 'react';

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
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    updateSettings
  };
}
