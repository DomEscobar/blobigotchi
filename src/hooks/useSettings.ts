
import { useState, useEffect } from 'react';

type Theme = 'default' | 'blue' | 'green' | 'pink';

interface Settings {
  sound: boolean;
  notifications: boolean;
  theme: Theme;
}

const DEFAULT_SETTINGS: Settings = {
  sound: true,
  notifications: true,
  theme: 'default'
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
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    updateSettings
  };
}
