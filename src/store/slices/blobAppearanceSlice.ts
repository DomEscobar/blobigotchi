import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types for appearance customization
export type BlobType = 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' | 'fighting' | 'poison' | 'ground' | 'rock' | 'psychic' | 'ghost';
export type BlobEyes = 'default' | 'round' | 'oval' | 'star' | 'heart' | 'square';
export type BlobMouth = 'default' | 'wide' | 'small' | 'kawaii' | 'surprised' | 'cool';
export type BlobAttack = 'none' | 'fireball' | 'watergun' | 'thunderbolt' | 'rockthrow' | 'leafblade' | 'psychicwave' | 'shadowball' | 'icebeam' |
  'flamethrower' | 'fire_spin' | 'hydro_pump' | 'aqua_jet' | 'thunder_shock' | 'volt_tackle' | 'solar_beam' | 'seed_bomb' | 'blizzard' | 'ice_shard' |
  'dynamic_punch' | 'close_combat' | 'pixel_punch' | 'sludge_bomb' | 'toxic' | 'acid_spray' | 'earthquake' | 'sandstorm' | 'future_sight' | 
  'digital_dash' | 'phantom_force' | 'static_slam' | 'blob_beam' | 'hyper_beam' | 'quick_attack';

export interface BlobAppearance {
  type: BlobType;
  eyes: BlobEyes;
  mouth: BlobMouth;
  attack: BlobAttack;
}

export interface AppearanceUnlocks {
  types: BlobType[];
  eyes: BlobEyes[];
  mouths: BlobMouth[];
  attacks: BlobAttack[];
}

interface BlobAppearanceState {
  appearance: BlobAppearance;
  unlockedOptions: AppearanceUnlocks;
}

const initialState: BlobAppearanceState = {
  appearance: {
    type: 'normal',
    eyes: 'default',
    mouth: 'default',
    attack: 'none'
  },
  unlockedOptions: {
    types: ['normal'],
    eyes: ['default'],
    mouths: ['default'],
    attacks: ['none']
  }
};

export const blobAppearanceSlice = createSlice({
  name: 'blobAppearance',
  initialState,
  reducers: {
    setType: (state, action: PayloadAction<BlobType>) => {
      if (state.unlockedOptions.types.includes(action.payload)) {
        state.appearance.type = action.payload;
      }
    },
    setEyes: (state, action: PayloadAction<BlobEyes>) => {
      if (state.unlockedOptions.eyes.includes(action.payload)) {
        state.appearance.eyes = action.payload;
      }
    },
    setMouth: (state, action: PayloadAction<BlobMouth>) => {
      if (state.unlockedOptions.mouths.includes(action.payload)) {
        state.appearance.mouth = action.payload;
      }
    },
    setAttack: (state, action: PayloadAction<BlobAttack>) => {
      if (state.unlockedOptions.attacks.includes(action.payload)) {
        state.appearance.attack = action.payload;
      }
    },
    resetAppearance: (state) => {
      state.appearance = {
        type: 'normal',
        eyes: 'default',
        mouth: 'default',
        attack: 'none'
      };
    },
    setAppearance: (state, action: PayloadAction<BlobAppearance>) => {
      // Only apply valid options that are unlocked
      if (state.unlockedOptions.types.includes(action.payload.type)) {
        state.appearance.type = action.payload.type;
      }
      if (state.unlockedOptions.eyes.includes(action.payload.eyes)) {
        state.appearance.eyes = action.payload.eyes;
      }
      if (state.unlockedOptions.mouths.includes(action.payload.mouth)) {
        state.appearance.mouth = action.payload.mouth;
      }
      if (state.unlockedOptions.attacks.includes(action.payload.attack)) {
        state.appearance.attack = action.payload.attack;
      }
    },
    updateUnlocks: (state, action: PayloadAction<number>) => {
      const evolutionLevel = action.payload;
      const newUnlocks: AppearanceUnlocks = {
        types: ['normal'],
        eyes: ['default'],
        mouths: ['default'],
        attacks: ['none']
      };
      
      // Level 2: Unlock basic types
      if (evolutionLevel >= 2) {
        newUnlocks.types.push('fire', 'water');
      }
      
      // Level 3: Unlock more types and basic eyes
      if (evolutionLevel >= 3) {
        newUnlocks.types.push('grass');
        newUnlocks.eyes.push('round');
        newUnlocks.mouths.push('wide');
        newUnlocks.attacks.push('fireball');
      }
      
      // Level 4: Unlock even more customizations
      if (evolutionLevel >= 4) {
        newUnlocks.types.push('electric');
        newUnlocks.eyes.push('oval');
        newUnlocks.mouths.push('small');
        newUnlocks.attacks.push('watergun', 'thunderbolt');
      }
      
      // Level 5: More unlocks
      if (evolutionLevel >= 5) {
        newUnlocks.types.push('rock', 'ice');
        newUnlocks.eyes.push('star');
        newUnlocks.mouths.push('kawaii');
        newUnlocks.attacks.push('rockthrow', 'leafblade');
      }
      
      // Level 6: Unlocking more options
      if (evolutionLevel >= 6) {
        newUnlocks.types.push('fighting', 'poison');
        newUnlocks.eyes.push('heart');
        newUnlocks.mouths.push('surprised');
        newUnlocks.attacks.push('psychicwave');
      }
      
      // Level 7+: Final unlocks
      if (evolutionLevel >= 7) {
        newUnlocks.types.push('ground', 'psychic', 'ghost');
        newUnlocks.eyes.push('square');
        newUnlocks.mouths.push('cool');
        newUnlocks.attacks.push('shadowball', 'icebeam');
      }
      
      state.unlockedOptions = newUnlocks;
    }
  }
});

export const { setType, setEyes, setMouth, setAttack, resetAppearance, setAppearance, updateUnlocks } = blobAppearanceSlice.actions;

export default blobAppearanceSlice.reducer; 