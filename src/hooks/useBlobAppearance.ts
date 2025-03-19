import { useState, useEffect } from 'react';
import { useSettings } from './useSettings';

// Types for appearance customization
export type BlobType = 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' | 'fighting' | 'psychic';
export type BlobEyes = 'default' | 'round' | 'oval' | 'star' | 'heart' | 'square' | 'sleepy' | 'angry' | 'cute' | 'pixel' | 'dizzy';
export type BlobMouth = 'default' | 'wide' | 'small' | 'kawaii' | 'surprised' | 'cool' | 'smirk' | 'laugh' | 'sad' | 'tongue' | 'pixel';
export type BlobAttack = 'none' | 'fireball' | 'watergun' | 'thunderbolt' | 'rockthrow' | 'leafblade' | 'psychicwave' | 'shadowball' | 'icebeam' |
  'flamethrower' | 'fire_spin' | 'hydro_pump' | 'aqua_jet' | 'thunder_shock' | 'volt_tackle' | 'solar_beam' | 'seed_bomb' | 'blizzard' | 'ice_shard' |
  'dynamic_punch' | 'close_combat' | 'pixel_punch' | 'sludge_bomb' | 'toxic' | 'acid_spray' | 'earthquake' | 'sandstorm' | 'future_sight' |
  'digital_dash' | 'phantom_force' | 'static_slam' | 'blob_beam' | 'hyper_beam' | 'quick_attack';

export interface BlobAppearance {
  type: BlobType;
  eyes: BlobEyes;
  mouth: BlobMouth;
  attack: BlobAttack;
  attacks: BlobAttack[];
}

interface AppearanceUnlocks {
  types: BlobType[];
  eyes: BlobEyes[];
  mouths: BlobMouth[];
  attacks: BlobAttack[];
}

export function useBlobAppearance(_evolutionLevel: number) {
  const { settings } = useSettings();
  const [evolutionLevel, setEvolutionLevel] = useState(_evolutionLevel);

  // Default appearance
  const [appearance, setAppearance] = useState<BlobAppearance>({
    type: 'normal',
    eyes: 'default',
    mouth: 'default',
    attack: 'none',
    attacks: ['none']
  });

  // Track unlocked appearance options
  const [unlockedOptions, setUnlockedOptions] = useState<AppearanceUnlocks>({
    types: ['normal'],
    eyes: ['default'],
    mouths: ['default'],
    attacks: ['none']
  });

  // Update unlocked options based on evolution level
  useEffect(() => {
    const newUnlocks: AppearanceUnlocks = {
      types: ['normal'],
      eyes: ['default'],
      mouths: ['default'],
      attacks: ['none']
    };

    // Level 2: Unlock basic types and basic customization options
    if (_evolutionLevel >= 2) {
      newUnlocks.types.push('fire', 'water');
      newUnlocks.eyes.push('round', 'sleepy');
      newUnlocks.mouths.push('wide', 'smirk');
    }

    // Level 3: Unlock more types and basic eyes
    if (_evolutionLevel >= 3) {
      newUnlocks.types.push('grass');
      newUnlocks.eyes.push('oval', 'angry');
      newUnlocks.mouths.push('small', 'sad');
      newUnlocks.attacks.push('fireball');
    }

    // Level 4: Unlock even more customizations
    if (_evolutionLevel >= 4) {
      newUnlocks.types.push('electric');
      newUnlocks.eyes.push('star', 'cute');
      newUnlocks.mouths.push('kawaii', 'laugh');
      newUnlocks.attacks.push('watergun', 'thunderbolt');
    }

    // Level 5: More unlocks
    if (_evolutionLevel >= 5) {
      newUnlocks.types.push('ice');
      newUnlocks.eyes.push('heart', 'pixel');
      newUnlocks.mouths.push('surprised', 'tongue');
      newUnlocks.attacks.push('rockthrow', 'leafblade');
    }

    // Level 6: Unlocking more options
    if (_evolutionLevel >= 6) {
      newUnlocks.types.push('fighting');
      newUnlocks.eyes.push('square', 'dizzy');
      newUnlocks.mouths.push('cool', 'pixel');
      newUnlocks.attacks.push('psychicwave');
    }

    // Level 7+: Final unlocks
    if (_evolutionLevel >= 7) {
      newUnlocks.types.push('psychic');
      newUnlocks.attacks.push('shadowball', 'icebeam');
    }

    setUnlockedOptions(newUnlocks);

  }, [_evolutionLevel]);

  const setType = (type: BlobType) => {
    if (unlockedOptions.types.includes(type)) {
      setAppearance(prev => ({ ...prev, type }));
    }
  };

  const setEyes = (eyes: BlobEyes) => {
    if (unlockedOptions.eyes.includes(eyes)) {
      setAppearance(prev => ({ ...prev, eyes }));
    }
  };

  const setMouth = (mouth: BlobMouth) => {
    if (unlockedOptions.mouths.includes(mouth)) {
      setAppearance(prev => ({ ...prev, mouth }));
    }
  };

  const setAttack = (attack: BlobAttack) => {
    if (unlockedOptions.attacks.includes(attack)) {
      setAppearance(prev => ({ ...prev, attack }));
    }
  };

  // Reset appearance to defaults
  const resetAppearance = () => {
    setAppearance({
      type: 'normal',
      eyes: 'default',
      mouth: 'default',
      attack: 'none',
      attacks: ['none']
    });
  };

  const updateEvolutionLevel = (evolutionLevel: number) => {
    setEvolutionLevel(evolutionLevel);
  };

  return {
    appearance,
    unlockedOptions,
    setType,
    setEyes,
    setMouth,
    setAttack,
    resetAppearance,
    setAppearance,
    updateEvolutionLevel
  };
} 