import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  BlobType,
  BlobEyes,
  BlobMouth,
  BlobAttack,
  setType,
  setEyes,
  setMouth,
  setAttack,
  resetAppearance,
  setAppearance,
  updateUnlocks
} from '@/store/slices/blobAppearanceSlice';

export function useBlobAppearanceRedux() {
  const dispatch = useAppDispatch();
  
  // Get blob appearance from Redux store
  const appearance = useAppSelector(state => state.blobAppearance.appearance);
  const unlockedOptions = useAppSelector(state => state.blobAppearance.unlockedOptions);
  const evolutionLevel = useAppSelector(state => state.blobStats.evolutionLevel);
  
  // Update unlocks when evolution level changes or on initial mount
  useEffect(() => {
    dispatch(updateUnlocks(evolutionLevel));
  }, [evolutionLevel, dispatch]);
  
  // Save appearance changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blobAppearance', JSON.stringify({
        ...appearance,
        evolutionLevel
      }));
    }
  }, [appearance, evolutionLevel]);
  
  const handleSetType = (type: BlobType) => {
    dispatch(setType(type));
  };
  
  const handleSetEyes = (eyes: BlobEyes) => {
    dispatch(setEyes(eyes));
  };
  
  const handleSetMouth = (mouth: BlobMouth) => {
    dispatch(setMouth(mouth));
  };
  
  const handleSetAttack = (attack: BlobAttack) => {
    dispatch(setAttack(attack));
  };
  
  const handleResetAppearance = () => {
    dispatch(resetAppearance());
  };
  
  return {
    appearance,
    unlockedOptions,
    setType: handleSetType,
    setEyes: handleSetEyes,
    setMouth: handleSetMouth,
    setAttack: handleSetAttack,
    resetAppearance: handleResetAppearance
  };
} 