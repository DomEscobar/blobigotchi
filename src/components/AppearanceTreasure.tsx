import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BlobType, BlobEyes, BlobMouth, BlobAttack, BlobAppearance } from '@/hooks/useBlobAppearance';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSounds } from '@/hooks/useSounds';
import { useSettings } from '@/hooks/useSettings';
import { BlobMood, BlobEvolutionPhase } from '@/components/Blob';
import attacks, { getAttacksByType, getAttackById, getAttacksByEvolutionLevel } from '@/data/attacks';

interface AppearanceTreasureProps {
  appearance: BlobAppearance;
  unlockedOptions: {
    types: BlobType[];
    eyes: BlobEyes[];
    mouths: BlobMouth[];
    attacks: BlobAttack[];
  };
  onColorChange: (type: BlobType) => void;
  onEyesChange: (eyes: BlobEyes) => void;
  onMouthChange: (mouth: BlobMouth) => void;
  onAccessoryChange: (attack: BlobAttack) => void;
  onReset: () => void;
  evolutionLevel: number;
}

const AppearanceTreasure: React.FC<AppearanceTreasureProps> = ({
  appearance,
  unlockedOptions,
  onColorChange: onTypeChange,
  onEyesChange,
  onMouthChange,
  onAccessoryChange: onAttackChange,
  onReset,
  evolutionLevel
}) => {
  const isMobile = useIsMobile();
  const { playSoundEffect } = useSounds();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'types' | 'eyes' | 'mouths'>('types');
  const [phase, setPhase] = useState<BlobEvolutionPhase>('blob');

  // Update appearance in localStorage whenever changes are made
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Create a complete appearance object
        const completeAppearance = {
          type: appearance.type,
          eyes: appearance.eyes,
          mouth: appearance.mouth,
          attack: appearance.attack,
          evolutionLevel: evolutionLevel
        };

        // Save to localStorage
        localStorage.setItem('blobAppearance', JSON.stringify(completeAppearance));
        console.log('AppearanceTreasure saved appearance:', completeAppearance);
      } catch (e) {
        console.error('Error saving appearance data to localStorage', e);
      }
    }
  }, [appearance, evolutionLevel]);

  // Create attackMap from the imported attacks
  const attackMap = useMemo(() => {
    // Start with a 'none' option
    const map: Record<string, { icon: string; name: string; description: string }> = {
      'none': { icon: '❌', name: 'None', description: 'No attack selected' }
    };

    // Add all attacks from the imported data
    attacks.forEach(attack => {
      map[attack.id] = {
        icon: attack.icon,
        name: attack.name,
        description: attack.description
      };
    });

    return map as Record<BlobAttack, { icon: string; name: string; description: string }>;
  }, []);

  useEffect(() => {
    // Determine evolution phase based on level
    if (evolutionLevel <= 1) {
      setPhase('egg');
    } else if (evolutionLevel <= 6) {
      setPhase('blob');
    } else if (evolutionLevel <= 10) {
      setPhase('baby');
    } else {
      setPhase('adult');
    }
  }, [evolutionLevel]);

  const handleOpen = () => {
    setIsOpen(prev => !prev);
    if (settings.sound) {
      playSoundEffect('click');
    }
  };

  const handleTabChange = (tab: 'types' | 'eyes' | 'mouths') => {
    setActiveTab(tab);
    if (settings.sound) {
      playSoundEffect('click');
    }
  };

  // Map type names to actual background colors and icons
  const typeMap: Record<BlobType, { bg: string; icon: string }> = {
    'normal': { bg: 'bg-blob-primary', icon: '⚪' },
    'fire': { bg: 'bg-red-400', icon: '🔥' },
    'water': { bg: 'bg-blue-400', icon: '💧' },
    'electric': { bg: 'bg-yellow-400', icon: '⚡' },
    'grass': { bg: 'bg-green-400', icon: '🌿' },
    'ice': { bg: 'bg-cyan-300', icon: '❄️' },
    'fighting': { bg: 'bg-orange-600', icon: '👊' },
    'psychic': { bg: 'bg-pink-400', icon: '🔮' },
  };

  // Map of eye styles
  const eyeMap: Record<BlobEyes, React.ReactNode> = {
    'default': <span className="block w-full h-full bg-black rounded-full"></span>,
    'round': <span className="block w-full h-full bg-black rounded-full border-2 border-white"></span>,
    'oval': <span className="block w-full h-full bg-black rounded-full transform scale-y-150"></span>,
    'star': (
      <div className="flex items-center justify-center w-full h-full">
        <svg viewBox="0 0 24 24" className="w-full h-full text-black">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor" />
        </svg>
      </div>
    ),
    'heart': (
      <div className="flex items-center justify-center w-full h-full">
        <svg viewBox="0 0 24 24" className="w-full h-full text-black">
          <path d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z" fill="currentColor" />
        </svg>
      </div>
    ),
    'square': <span className="block w-3/4 h-3/4 bg-black rounded-sm mx-auto my-auto"></span>,
    'sleepy': (
      <div className="relative w-full h-full">
        <span className="block w-full h-2/5 bg-black rounded-full absolute bottom-0"></span>
      </div>
    ),
    'angry': (
      <div className="relative w-full h-full">
        <span className="block w-full h-full bg-black rounded-full"></span>
        <span className="absolute -top-1 -left-1 w-3/5 h-1 bg-black rotate-45"></span>
      </div>
    ),
    'cute': (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className="block w-3/4 h-3/4 bg-black rounded-full"></span>
        <span className="absolute w-1/3 h-1/3 bg-white rounded-full top-1/4 left-1/4"></span>
      </div>
    ),
    'pixel': (
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
        <div className="col-start-2 col-end-3 row-start-2 row-end-3 bg-black"></div>
      </div>
    ),
    'dizzy': (
      <div className="relative w-full h-full">
        <span className="absolute top-1/2 left-0 w-full h-1/5 bg-black rounded-full transform -rotate-45"></span>
        <span className="absolute top-1/2 left-0 w-full h-1/5 bg-black rounded-full transform rotate-45"></span>
      </div>
    )
  };

  // Map of mouth styles
  const mouthMap: Record<BlobMouth, React.ReactNode> = {
    'default': <div className="w-full h-full border-b-2 border-black rounded-b-lg"></div>,
    'wide': <div className="w-full h-full border-b-2 border-black rounded-b-lg transform scale-x-125"></div>,
    'small': <div className="w-3/4 h-3/4 border-b-2 border-black rounded-b-lg mx-auto"></div>,
    'kawaii': (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-1/2 h-1/2 border-b-2 border-l-2 border-r-2 border-black rounded-b-full"></div>
      </div>
    ),
    'surprised': <div className="w-2/3 h-2/3 bg-black rounded-full mx-auto"></div>,
    'cool': (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-3/4 h-1/3 bg-black rounded-sm transform rotate-12"></div>
      </div>
    ),
    'smirk': (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-3/4 h-1/3 bg-black rounded-sm transform translate-x-1 rotate-6"></div>
      </div>
    ),
    'laugh': (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-3/4 h-2/3 bg-black rounded-md flex flex-col justify-center items-center">
          <div className="w-2/3 h-1/3 bg-white rounded-sm"></div>
        </div>
      </div>
    ),
    'sad': (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-1/2 h-1/2 border-b-2 border-l-2 border-r-2 border-black rounded-b-full transform rotate-180"></div>
      </div>
    ),
    'tongue': (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <div className="w-1/2 h-1/2 border-b-2 border-l-2 border-r-2 border-black rounded-b-full"></div>
        <div className="w-1/4 h-2/3 bg-red-400 absolute -bottom-1/3 rounded-b-md"></div>
      </div>
    ),
    'pixel': (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-2/3 h-1/3 grid grid-cols-3 gap-0.5">
          <div className="bg-black"></div>
          <div className="bg-black"></div>
          <div className="bg-black"></div>
        </div>
      </div>
    )
  };

  // Update getAttackComponent to use attack data from the attacks.ts file
  const getAttackComponent = (attackType: BlobAttack, position: string) => {
    const attack = getAttackById(attackType);
    if (!attack || attackType === 'none') return null;

    // Common styling based on category
    const commonStyles = attack.category === 'special'
      ? 'animate-pulse'
      : attack.category === 'physical'
        ? 'animate-bounce'
        : 'animate-spin';

    // Default rendering based on type
    switch (attack.type) {
      case 'fire':
        return (
          <div className={`absolute ${position} w-4 h-4`}>
            <div className={`w-full h-full bg-red-500 rounded-full ${commonStyles}`}></div>
          </div>
        );
      case 'water':
        return (
          <div className={`absolute ${position} w-6 h-2`}>
            <div className={`w-full h-full bg-blue-400 rounded-full ${commonStyles}`}></div>
          </div>
        );
      case 'electric':
        return (
          <div className={`absolute ${position} w-4 h-4`}>
            <div className={`w-1 h-4 bg-yellow-400 absolute ${commonStyles}`}></div>
          </div>
        );
      case 'grass':
        return (
          <div className={`absolute ${position} w-3 h-6`}>
            <div className={`w-2 h-5 bg-green-500 rounded ${commonStyles}`}></div>
          </div>
        );
      case 'ice':
        return (
          <div className={`absolute ${position} w-4 h-4`}>
            <div className={`w-full h-full bg-cyan-200 rounded ${commonStyles}`}></div>
          </div>
        );
      case 'fighting':
        return (
          <div className={`absolute ${position} w-4 h-4`}>
            <div className={`w-4 h-4 bg-orange-600 rounded-full ${commonStyles}`}></div>
          </div>
        );
      case 'psychic':
        return (
          <div className={`absolute ${position} w-10 h-2`}>
            <div className={`w-full h-1 bg-pink-400 rounded-full ${commonStyles}`}></div>
          </div>
        );
      default: // Normal type
        return (
          <div className={`absolute ${position} w-4 h-4`}>
            <div className={`w-full h-full bg-gray-400 rounded-full ${commonStyles}`}></div>
          </div>
        );
    }
  };

  // Get attack positions 
  const getAttackPosition = (): string => {
    return '-right-4 top-4';
  };

  return (
    <>
      {/* Closed treasure chest */}
      {!isOpen && (
        <div
          className="absolute bottom-4 right-4 w-12 h-10 cursor-pointer transition-transform hover:scale-110 active:scale-95 z-50"
          onClick={handleOpen}
        >
          {/* Chest lid */}
          <div className="w-full h-4 bg-yellow-800 rounded-t-lg border-2 border-yellow-900 flex items-center justify-center">
            <div className="w-4 h-2 bg-yellow-600 rounded"></div>
          </div>
          {/* Chest body */}
          <div className="w-full h-6 bg-yellow-700 rounded-b-sm border-2 border-t-0 border-yellow-900 flex items-end justify-center">
            <div className="w-8 h-1 bg-yellow-900 mb-1 rounded-full"></div>
          </div>

          {/* Indication that this is for appearance */}
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-blob-tertiary rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            ✨
          </div>
        </div>
      )}

      {/* Open treasure chest with customization options */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className={`bg-crt-background rounded-lg border-2 border-blob-tertiary shadow-lg ${isMobile ? 'w-full' : 'w-96'} max-h-[90vh] overflow-auto`}>
            {/* Header */}
            <div className="p-3 border-b border-blob-tertiary flex justify-between items-center">
              <h3 className="text-white pixel-text text-lg">Blob Customization</h3>
              <button
                className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                onClick={handleOpen}
              >
                ×
              </button>
            </div>

            {/* Evolution level indicator */}
            <div className="px-3 py-2 border-b border-blob-tertiary">
              <p className="text-white pixel-text text-sm">Evolution Level: {evolutionLevel}</p>
              <div className="w-full h-2 bg-gray-700 rounded-full mt-1">
                <div
                  className="h-full bg-blob-happy rounded-full"
                  style={{ width: `${Math.min(100, evolutionLevel / 10 * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Tabs for different customization types */}
            <div className="flex border-b border-blob-tertiary">
              <button
                className={`flex-1 p-2 pixel-text text-sm ${activeTab === 'types' ? 'bg-blob-tertiary text-white' : 'bg-transparent text-gray-400'}`}
                onClick={() => handleTabChange('types')}
              >
                Types
              </button>
              <button
                className={`flex-1 p-2 pixel-text text-sm ${activeTab === 'eyes' ? 'bg-blob-tertiary text-white' : 'bg-transparent text-gray-400'}`}
                onClick={() => handleTabChange('eyes')}
              >
                Eyes
              </button>
              <button
                className={`flex-1 p-2 pixel-text text-sm ${activeTab === 'mouths' ? 'bg-blob-tertiary text-white' : 'bg-transparent text-gray-400'}`}
                onClick={() => handleTabChange('mouths')}
              >
                Mouth
              </button>
            </div>

            {/* Content based on active tab */}
            <div className="p-4">
              {/* Preview based on evolution phase */}
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  {/* Different preview based on evolution phase */}
                  {phase === 'egg' && (
                    <div className="w-20 h-24 relative animate-blob-idle">
                      {/* Egg shell */}
                      <div className="absolute bottom-0 w-16 h-20 bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-full rounded-b-3xl left-1/2 transform -translate-x-1/2"></div>

                      {/* Cracks in egg */}
                      <div className="absolute bottom-8 left-1/2 w-1 h-5 bg-gray-50 transform -translate-x-3 rotate-45"></div>
                      <div className="absolute bottom-10 left-1/2 w-1 h-4 bg-gray-50 transform translate-x-4 -rotate-12"></div>

                      {/* Blob peeking from egg */}
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-6 rounded-t-full bg-blob-primary animate-pulse"></div>

                      {/* Eyes - only visible if not an egg or if hatching */}
                      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3">
                        <div className="w-1.5 h-2 bg-black rounded-full"></div>
                        <div className="w-1.5 h-2 bg-black rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {phase === 'blob' && (
                    <div className="relative">
                      {/* Display current attack */}
                      {appearance.attack !== 'none' && (
                        getAttackComponent(appearance.attack, getAttackPosition())
                      )}

                      <div
                        className={cn(
                          "w-20 h-20 rounded-full shadow-lg",
                          typeMap[appearance.type].bg,
                          "animate-blob-idle"
                        )}
                      >
                        {/* Eyes */}
                        <div className="relative w-full h-full">
                          {/* Left eye */}
                          <div className="absolute top-6 left-4 w-2 h-3">
                            {eyeMap[appearance.eyes]}
                          </div>

                          {/* Right eye */}
                          <div className="absolute top-6 right-4 w-2 h-3">
                            {eyeMap[appearance.eyes]}
                          </div>

                          {/* Mouth */}
                          <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 w-8 h-3">
                            {mouthMap[appearance.mouth]}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {phase === 'baby' && (
                    <div className="relative">
                      {/* Display current attack */}
                      {appearance.attack !== 'none' && (
                        getAttackComponent(appearance.attack, getAttackPosition())
                      )}

                      {/* Body - slightly larger with stubby limbs */}
                      <div
                        className={cn(
                          "w-24 h-24 rounded-full shadow-lg relative",
                          typeMap[appearance.type].bg,
                          "animate-blob-idle"
                        )}
                      >
                        {/* Left arm - stubby */}
                        <div className={cn("absolute -left-2 top-10 w-4 h-6 rounded-full", typeMap[appearance.type].bg)}></div>

                        {/* Right arm - stubby */}
                        <div className={cn("absolute -right-2 top-10 w-4 h-6 rounded-full", typeMap[appearance.type].bg)}></div>

                        {/* Left leg - stubby */}
                        <div className={cn("absolute left-5 -bottom-2 w-6 h-4 rounded-full", typeMap[appearance.type].bg)}></div>

                        {/* Right leg - stubby */}
                        <div className={cn("absolute right-5 -bottom-2 w-6 h-4 rounded-full", typeMap[appearance.type].bg)}></div>

                        {/* Face */}
                        <div className="relative w-full h-full">
                          {/* Left eye - slightly larger */}
                          <div className="absolute top-7 left-7 w-3 h-3">
                            {eyeMap[appearance.eyes]}
                          </div>

                          {/* Right eye - slightly larger */}
                          <div className="absolute top-7 right-7 w-3 h-3">
                            {eyeMap[appearance.eyes]}
                          </div>

                          {/* Mouth */}
                          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-3">
                            {mouthMap[appearance.mouth]}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {phase === 'adult' && (
                    <div className="relative scale-75">
                      {/* Body - full humanoid but still blob-like */}
                      <div
                        className={cn(
                          "w-28 h-32 rounded-2xl shadow-lg relative",
                          typeMap[appearance.type].bg,
                          "animate-blob-idle"
                        )}
                      >
                        {/* Head */}
                        <div className={cn("absolute left-1/2 transform -translate-x-1/2 -top-12 w-20 h-20 rounded-full", typeMap[appearance.type].bg)}>
                          {/* Display current attack */}
                          {appearance.attack !== 'none' && (
                            getAttackComponent(appearance.attack, getAttackPosition())
                          )}

                          {/* Face */}
                          <div className="relative w-full h-full">
                            {/* Left eye */}
                            <div className="absolute top-8 left-5 w-3 h-3">
                              {eyeMap[appearance.eyes]}
                            </div>

                            {/* Right eye */}
                            <div className="absolute top-8 right-5 w-3 h-3">
                              {eyeMap[appearance.eyes]}
                            </div>

                            {/* Mouth */}
                            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-10 h-3">
                              {mouthMap[appearance.mouth]}
                            </div>
                          </div>
                        </div>

                        {/* Left arm */}
                        <div className={cn("absolute -left-4 top-5 w-6 h-20 rounded-full", typeMap[appearance.type].bg)}>
                          {/* Hand */}
                          <div className={cn("absolute bottom-0 left-0 w-8 h-8 rounded-full", typeMap[appearance.type].bg)}></div>
                        </div>

                        {/* Right arm */}
                        <div className={cn("absolute -right-4 top-5 w-6 h-20 rounded-full", typeMap[appearance.type].bg)}>
                          {/* Hand */}
                          <div className={cn("absolute bottom-0 right-0 w-8 h-8 rounded-full", typeMap[appearance.type].bg)}></div>
                        </div>

                        {/* Left leg */}
                        <div className={cn("absolute left-5 -bottom-8 w-6 h-10 rounded-full", typeMap[appearance.type].bg)}></div>

                        {/* Right leg */}
                        <div className={cn("absolute right-5 -bottom-8 w-6 h-10 rounded-full", typeMap[appearance.type].bg)}></div>

                        {/* Outfit - book for the intellectual adult blob */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-10 bg-blue-100 border border-blue-700"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Types Tab */}
              {activeTab === 'types' && (
                <div>
                  <h4 className="text-white pixel-text mb-2">Choose a Type</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {unlockedOptions.types.filter(type => typeMap[type]?.bg).map((type) => (
                      <button
                        key={type}
                        className={`w-12 h-12 ${typeMap[type]?.bg} rounded-full ${appearance.type === type ? 'ring-2 ring-offset-2 ring-white' : ''} flex items-center justify-center text-lg`}
                        onClick={() => {
                          onTypeChange(type);
                          if (settings.sound) {
                            playSoundEffect('click');
                          }
                        }}
                      >
                        {typeMap[type]?.icon}
                      </button>
                    ))}
                    {evolutionLevel < 7 && (
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs">
                        🔒
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Eyes Tab */}
              {activeTab === 'eyes' && (
                <div>
                  <h4 className="text-white pixel-text mb-2">Choose Eyes</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {unlockedOptions.eyes.map((eyeStyle) => (
                      <button
                        key={eyeStyle}
                        className={`w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center ${appearance.eyes === eyeStyle ? 'ring-2 ring-offset-2 ring-white' : ''}`}
                        onClick={() => {
                          onEyesChange(eyeStyle);
                          if (settings.sound) {
                            playSoundEffect('click');
                          }
                        }}
                      >
                        <div className="w-6 h-6">
                          {eyeMap[eyeStyle]}
                        </div>
                      </button>
                    ))}
                    {evolutionLevel < 7 && (
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs">
                        🔒
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mouths Tab */}
              {activeTab === 'mouths' && (
                <div>
                  <h4 className="text-white pixel-text mb-2">Choose Mouth</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {unlockedOptions.mouths.map((mouthStyle) => (
                      <button
                        key={mouthStyle}
                        className={`w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center ${appearance.mouth === mouthStyle ? 'ring-2 ring-offset-2 ring-white' : ''}`}
                        onClick={() => {
                          onMouthChange(mouthStyle);
                          if (settings.sound) {
                            playSoundEffect('click');
                          }
                        }}
                      >
                        <div className="w-6 h-3">
                          {mouthMap[mouthStyle]}
                        </div>
                      </button>
                    ))}
                    {evolutionLevel < 7 && (
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs">
                        🔒
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reset button */}
              <div className="mt-4 flex justify-center">
                <button
                  className="px-4 py-2 bg-blob-tertiary rounded text-white pixel-text hover:bg-blob-secondary transition-colors"
                  onClick={() => {
                    onReset();
                    if (settings.sound) {
                      playSoundEffect('click');
                    }
                  }}
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppearanceTreasure; 