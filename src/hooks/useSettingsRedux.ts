import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  toggleSound,
  setSound,
  toggleNotifications,
  setNotifications,
  toggleWeatherEffects,
  setWeatherEffects,
  toggleDarkMode,
  setDarkMode,
  setTheme,
  setDevMode,
  setAllSettings
} from '@/store/slices/settingsSlice';

export function useSettingsRedux() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  
  // Save settings changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blobSettings', JSON.stringify(settings));
    }
  }, [settings]);
  
  const handleToggleSound = () => {
    dispatch(toggleSound());
  };
  
  const handleSetSound = (value: boolean) => {
    dispatch(setSound(value));
  };
  
  const handleToggleNotifications = () => {
    dispatch(toggleNotifications());
  };
  
  const handleSetNotifications = (value: boolean) => {
    dispatch(setNotifications(value));
  };
  
  const handleToggleWeatherEffects = () => {
    dispatch(toggleWeatherEffects());
  };
  
  const handleSetWeatherEffects = (value: boolean) => {
    dispatch(setWeatherEffects(value));
  };
  
  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };
  
  const handleSetDarkMode = (value: boolean) => {
    dispatch(setDarkMode(value));
  };

  const handleSetTheme = (value: 'default' | 'blue' | 'green' | 'pink') => {
    dispatch(setTheme(value));
  };
  
  const handleSetDevMode = (value: boolean) => {
    dispatch(setDevMode(value));
  };
  
  return {
    settings,
    toggleSound: handleToggleSound,
    setSound: handleSetSound,
    toggleNotifications: handleToggleNotifications,
    setNotifications: handleSetNotifications,
    toggleWeatherEffects: handleToggleWeatherEffects,
    setWeatherEffects: handleSetWeatherEffects,
    toggleDarkMode: handleToggleDarkMode,
    setDarkMode: handleSetDarkMode,
    setTheme: handleSetTheme,
    setDevMode: handleSetDevMode
  };
} 