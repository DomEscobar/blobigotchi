import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BlobMood } from '@/components/Blob';

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

const initialState: BlobStats = {
  hunger: 80,
  happiness: 70,
  hygiene: 90,
  energy: 60,
  evolutionLevel: 1,
  evolutionProgress: 25,
  mood: 'normal',
  actionCounter: 0,
  lastAction: null
};

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
    decreaseStats: (state) => {
      state.hunger = Math.max(0, state.hunger - 1);
      state.happiness = Math.max(0, state.happiness - 0.5);
      state.hygiene = Math.max(0, state.hygiene - 0.3);
      state.energy = Math.max(0, state.energy - 0.7);
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
      state.actionCounter += 1;
      if (state.actionCounter % 10 === 0) {
        state.evolutionProgress += 10;
        if (state.evolutionProgress >= 100) {
          state.evolutionLevel += 1;
          state.evolutionProgress = 0;
        }
      }
    },
    devLevelUp: (state, action: PayloadAction<number>) => {
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
    }
  }
});

export const { 
  setHunger, setHappiness, setHygiene, setEnergy, 
  setEvolutionLevel, setEvolutionProgress, setMood, 
  increaseActionCounter, setLastAction, decreaseStats,
  feedBlob, playWithBlob, cleanBlob, restBlob, 
  handleBlobClick, increaseEvolution, devLevelUp
} = blobStatsSlice.actions;

export default blobStatsSlice.reducer; 