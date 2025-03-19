import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BlobMood } from '@/components/Blob';
import { WeatherType, TimeOfDay } from '@/hooks/useWeather';
import { calculateStatsChange } from '@/utils/blobStatsCalculations';

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
  lastUpdateTime: number;
  lastEvolutionTime: number;
  justEvolved: boolean;
  newEvolutionLevel: number | null;
  showAttackOffer: boolean;
  lastAttackOfferLevel: number;
}

const initialState: BlobStats = {
  hunger: 80,
  happiness: 70,
  hygiene: 90,
  energy: 60,
  evolutionLevel: 1,
  evolutionProgress: 25,
  mood: 'normal',
  actionCounter: 0,
  lastAction: null,
  lastUpdateTime: Date.now(),
  lastEvolutionTime: Date.now(),
  justEvolved: false,
  newEvolutionLevel: null,
  showAttackOffer: false,
  lastAttackOfferLevel: 1
};

const EVOLUTION_DAY_INTERVAL = 1;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const blobStatsSlice = createSlice({
  name: 'blobStats',
  initialState,
  reducers: {
    setHunger: (state, action: PayloadAction<number>) => {
      state.hunger = Math.max(0, Math.min(100, action.payload));
    },
    setHappiness: (state, action: PayloadAction<number>) => {
      state.happiness = Math.max(0, Math.min(100, action.payload));
    },
    setHygiene: (state, action: PayloadAction<number>) => {
      state.hygiene = Math.max(0, Math.min(100, action.payload));
    },
    setEnergy: (state, action: PayloadAction<number>) => {
      state.energy = Math.max(0, Math.min(100, action.payload));
    },
    setEvolutionLevel: (state, action: PayloadAction<number>) => {
      state.evolutionLevel = action.payload;
    },
    setEvolutionProgress: (state, action: PayloadAction<number>) => {
      state.evolutionProgress = Math.max(0, Math.min(100, action.payload));
    },
    setMood: (state, action: PayloadAction<BlobMood>) => {
      state.mood = action.payload;
    },
    increaseActionCounter: (state) => {
      state.actionCounter += 1;
    },
    setLastAction: (state, action: PayloadAction<string | null>) => {
      state.lastAction = action.payload;
    },
    decreaseStats: (state, action: PayloadAction<{ weather: WeatherType; timeOfDay: TimeOfDay }>) => {
      const currentTime = Date.now();
      const timeSinceLastUpdate = currentTime - state.lastUpdateTime;
      
      if (timeSinceLastUpdate >= 1000) {
        const { weather, timeOfDay } = action.payload;
        
        const newStats = calculateStatsChange(
          {
            hunger: state.hunger,
            happiness: state.happiness,
            hygiene: state.hygiene,
            energy: state.energy
          },
          weather,
          timeOfDay,
          timeSinceLastUpdate
        );
        
        state.hunger = newStats.hunger;
        state.happiness = newStats.happiness;
        state.hygiene = newStats.hygiene;
        state.energy = newStats.energy;
        
        state.lastUpdateTime = currentTime;
      }
    },
    checkEvolution: (state) => {
      state.justEvolved = false;
      state.newEvolutionLevel = null;
      
      const currentTime = Date.now();
      const timeSinceLastEvolution = currentTime - state.lastEvolutionTime;
      
      const daysPassed = timeSinceLastEvolution / MILLISECONDS_PER_DAY;
      
      if (daysPassed >= EVOLUTION_DAY_INTERVAL) {
        const evolutionIntervals = Math.floor(daysPassed / EVOLUTION_DAY_INTERVAL);
        
        let progressToAdd = evolutionIntervals * 25;
        
        const oldLevel = state.evolutionLevel;
        
        state.evolutionProgress += progressToAdd;
        
        while (state.evolutionProgress >= 100) {
          state.evolutionLevel += 1;
          state.evolutionProgress -= 100;
        }
        
        if (state.evolutionLevel > oldLevel) {
          state.justEvolved = true;
          state.newEvolutionLevel = state.evolutionLevel;
          
          if (state.lastAttackOfferLevel < state.evolutionLevel) {
            state.showAttackOffer = true;
          }
        }
        
        state.lastEvolutionTime += evolutionIntervals * EVOLUTION_DAY_INTERVAL * MILLISECONDS_PER_DAY;
      }
    },
    resetEvolutionFlags: (state) => {
      state.justEvolved = false;
      state.newEvolutionLevel = null;
    },
    resetAttackOfferFlag: (state) => {
      state.showAttackOffer = false;
    },
    updateLastAttackOfferLevel: (state) => {
      if (state.lastAttackOfferLevel < state.evolutionLevel) {
        state.lastAttackOfferLevel += 1;
        
        if (state.lastAttackOfferLevel < state.evolutionLevel) {
          state.showAttackOffer = true;
        }
      }
    },
    feedBlob: (state) => {
      state.hunger = Math.min(100, state.hunger + 20);
      state.energy = Math.min(100, state.energy + 5);
      state.hygiene = Math.max(0, state.hygiene - 5);
      state.lastAction = 'feed';
      state.actionCounter += 1;
    },
    playWithBlob: (state) => {
      state.happiness = Math.min(100, state.happiness + 25);
      state.energy = Math.max(0, state.energy - 15);
      state.hunger = Math.max(0, state.hunger - 10);
      state.lastAction = 'play';
      state.actionCounter += 1;
    },
    cleanBlob: (state) => {
      state.hygiene = Math.min(100, state.hygiene + 30);
      state.energy = Math.max(0, state.energy - 5);
      state.lastAction = 'clean';
      state.actionCounter += 1;
    },
    restBlob: (state) => {
      state.energy = Math.min(100, state.energy + 40);
      state.hunger = Math.max(0, state.hunger - 5);
      state.happiness = Math.max(0, state.happiness - 5);
      state.lastAction = 'rest';
      state.actionCounter += 1;
    },
    handleBlobClick: (state) => {
      state.happiness = Math.min(100, state.happiness + 5);
      state.actionCounter += 1;
    },
    increaseEvolution: (state) => {
      const oldLevel = state.evolutionLevel;
      
      state.evolutionProgress += 10;
      if (state.evolutionProgress >= 100) {
        state.evolutionLevel += 1;
        state.evolutionProgress = 0;
        
        if (state.evolutionLevel > oldLevel) {
          state.justEvolved = true;
          state.newEvolutionLevel = state.evolutionLevel;
          
          if (state.lastAttackOfferLevel < state.evolutionLevel) {
            state.showAttackOffer = true;
          }
        }
      }
    },
    devLevelUp: (state, action: PayloadAction<number>) => {
      const oldLevel = state.evolutionLevel;
      
      if (action.payload === 1) {
        state.evolutionProgress += 50;
        if (state.evolutionProgress >= 100) {
          state.evolutionLevel += 1;
          state.evolutionProgress = state.evolutionProgress - 100;
        }
      } else {
        state.evolutionLevel += (action.payload - 1);
        state.evolutionProgress = 0;
      }
      
      if (state.evolutionLevel > oldLevel) {
        state.justEvolved = true;
        state.newEvolutionLevel = state.evolutionLevel;
        
        if (state.lastAttackOfferLevel < state.evolutionLevel) {
          state.showAttackOffer = true;
        }
      }
    }
  }
});

export const { 
  setHunger, setHappiness, setHygiene, setEnergy, 
  setEvolutionLevel, setEvolutionProgress, setMood, 
  increaseActionCounter, setLastAction, decreaseStats,
  feedBlob, playWithBlob, cleanBlob, restBlob, 
  handleBlobClick, increaseEvolution, devLevelUp,
  checkEvolution, resetEvolutionFlags, resetAttackOfferFlag,
  updateLastAttackOfferLevel
} = blobStatsSlice.actions;

export default blobStatsSlice.reducer; 