import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import blobStatsReducer from './slices/blobStatsSlice';
import blobAppearanceReducer from './slices/blobAppearanceSlice';
import settingsReducer from './slices/settingsSlice';

// Load persisted state from localStorage
const loadPersistedState = () => {
  try {
    // Load settings
    const savedSettings = localStorage.getItem('blobSettings');
    const settingsState = savedSettings ? JSON.parse(savedSettings) : undefined;

    // Load blob appearance
    const savedAppearance = localStorage.getItem('blobAppearance');
    const appearanceData = savedAppearance ? JSON.parse(savedAppearance) : undefined;
    
    // Extract evolutionLevel from appearance data if it exists
    let blobAppearanceState;
    let blobStatsState;
    let savedEvolutionLevel;
    
    if (appearanceData) {
      const { evolutionLevel, ...appearance } = appearanceData;
      savedEvolutionLevel = evolutionLevel;
      
      blobAppearanceState = {
        appearance: appearance,
        unlockedOptions: { 
          // We'll let the reducer handle unlocked options based on evolution level
          types: ['normal'],
          eyes: ['default'],
          mouths: ['default'],
          attacks: ['none']
        }
      };
    }
    
    // Load blob stats
    const savedBlobStats = localStorage.getItem('blobStats');
    if (savedBlobStats) {
      blobStatsState = JSON.parse(savedBlobStats);
    } else if (savedEvolutionLevel) {
      // If no stats but we have evolution level from appearance, create minimal stats
      blobStatsState = {
        evolutionLevel: savedEvolutionLevel,
        evolutionProgress: 0,
        hunger: 80,
        happiness: 70,
        hygiene: 90,
        energy: 60,
        mood: 'normal',
        actionCounter: 0,
        lastAction: null
      };
    }

    return {
      settings: settingsState,
      blobStats: blobStatsState,
      blobAppearance: blobAppearanceState
    };
  } catch (e) {
    console.error('Error loading persisted state:', e);
    return undefined;
  }
};

// Get preloaded state
const preloadedState = loadPersistedState();

const store = configureStore({
  reducer: {
    blobStats: blobStatsReducer,
    blobAppearance: blobAppearanceReducer,
    settings: settingsReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Export store setup
export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 