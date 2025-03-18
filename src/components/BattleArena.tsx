import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useBattle } from '@/contexts/BattleContext';
import Blob from '@/components/Blob';
import { BlobAppearance, BlobAttack, BlobType } from '@/hooks/useBlobAppearance';
import { getAttackById } from '@/data/attacks';

// Sound effects component
const SoundEffects = ({ activeSound }: { activeSound: string | null }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (activeSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error("Audio play error:", err));
    }
  }, [activeSound]);
  
  return (
    <div className="hidden">
      <audio ref={audioRef} src={`/sounds/${activeSound || 'none'}.mp3`} />
    </div>
  );
};

// Battle character component
const BattleCharacter = ({
  name, 
  hp, 
  maxHp, 
  appearance, 
  evolutionLevel, 
  isOpponent,
  isAnimating,
  animationType
}: {
  name: string;
  hp: number;
  maxHp: number;
  appearance: BlobAppearance;
  evolutionLevel: number;
  isOpponent: boolean;
  isAnimating: boolean;
  animationType: string | null;
}) => {
  // Determine mood based on HP
  const mood = hp < 30 ? "sad" : "happy";
  
  // Get animation class based on attack type
  const getAnimationClass = () => {
    if (!isAnimating) return "";
    
    if (animationType?.includes('fire')) return "animate-blob-shake";
    if (animationType?.includes('water')) return "animate-blob-shake";
    if (animationType?.includes('electric')) return "animate-blob-shake";
    if (animationType?.includes('fighting')) return "animate-blob-shake";
    if (animationType?.includes('ghost')) return "animate-pulse";
    
    return "animate-blob-shake";
  };
  
  return (
    <div className={`flex ${isOpponent ? 'justify-between' : 'justify-between flex-row-reverse'} items-center mb-2 sm:mb-4`}>
      <div className="flex-1 max-w-[180px] sm:max-w-[250px]">
        <h3 className="text-sm sm:text-lg text-white pixel-text truncate">{name}</h3>
        <div className="bg-gray-800 rounded-lg w-full h-3 sm:h-4 mt-1">
          <div 
            className={`bg-gradient-to-r ${isOpponent ? 'from-red-600 to-red-400' : 'from-green-600 to-green-400'} h-full rounded-lg transition-all duration-500 ease-out`}
            style={{ width: `${(hp / maxHp) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 pixel-text mt-1">
          HP: {hp || 0}/{maxHp}
        </p>
      </div>
      
      <div className={`h-20 w-20 sm:h-32 sm:w-32 relative ${getAnimationClass()}`}>
        <div className="absolute inset-0 flex items-center justify-center right-2">
          <Blob 
            mood={isOpponent ? "normal" : mood} 
            onClick={() => {}} 
            evolutionLevel={evolutionLevel} 
            appearance={appearance} 
          />
        </div>
      </div>
    </div>
  );
};

// Battle animation effects component
const BattleAnimationEffects = ({ activeAnimation }: { activeAnimation: string | null }) => {
  if (!activeAnimation) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {activeAnimation === 'animate-fire-attack' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full max-w-md max-h-md flex items-center justify-center">
            <div className="animate-fire-spread absolute w-20 h-20 sm:w-32 sm:h-32 bg-orange-500 rounded-full opacity-0"></div>
            <div className="animate-fire-particles absolute w-full h-full">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-2 h-2 bg-yellow-500 rounded-full animate-float-up" 
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${50 + Math.random() * 30}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    opacity: Math.random() * 0.8 + 0.2
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeAnimation === 'animate-water-attack' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full max-w-md max-h-md flex items-center justify-center">
            <div className="animate-water-spread absolute w-20 h-10 sm:w-32 sm:h-16 bg-blue-500 rounded-full opacity-0"></div>
            <div className="animate-water-splash absolute w-full h-full">
              {Array.from({ length: 15 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-2 h-2 bg-blue-400 rounded-full animate-splash" 
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${50 + Math.random() * 20}%`,
                    animationDelay: `${Math.random() * 0.3}s`,
                    opacity: Math.random() * 0.8 + 0.2
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeAnimation === 'animate-electric-attack' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-lightning-flash absolute inset-0 bg-yellow-300 opacity-0"></div>
          <div className="animate-lightning w-1 sm:w-2 h-64 bg-yellow-300 opacity-70 origin-top"></div>
          <div className="animate-lightning w-1 sm:w-2 h-64 bg-yellow-300 opacity-70 origin-top rotate-12 delay-75"></div>
          <div className="animate-lightning w-1 sm:w-2 h-64 bg-yellow-300 opacity-70 origin-top -rotate-12 delay-100"></div>
        </div>
      )}
      
      {activeAnimation === 'animate-grass-attack' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full max-w-md max-h-md flex items-center justify-center">
            <div className="animate-grass-grow absolute w-20 h-20 sm:w-32 sm:h-32 bg-green-500 rounded-full opacity-0"></div>
            <div className="animate-leaf-swirl absolute w-full h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-3 h-3 bg-green-400 rounded-sm animate-spin-float" 
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${50 + Math.random() * 30}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    opacity: Math.random() * 0.8 + 0.2
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeAnimation === 'animate-ice-attack' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-ice-grow absolute w-20 h-20 sm:w-32 sm:h-32 bg-cyan-300 opacity-0 rounded-full"></div>
          <div className="animate-snowflakes absolute w-full h-full">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute w-2 h-2 bg-white rounded-full animate-fall-rotate" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 20}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
      
      {activeAnimation === 'animate-fighting-attack' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-impact-shake absolute w-20 h-20 sm:w-32 sm:h-32 rounded-full flex items-center justify-center">
            <div className="w-full h-full bg-orange-700 rounded-full animate-pulse opacity-70"></div>
            <div className="absolute text-5xl animate-grow">👊</div>
          </div>
        </div>
      )}
      
      {activeAnimation === 'animate-psychic-attack' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-psychic-pulse absolute w-20 h-20 sm:w-32 sm:h-32 bg-purple-500 rounded-full opacity-0"></div>
          <div className="animate-psychic-rings w-32 h-32 sm:w-48 sm:h-48 border-4 border-pink-500 rounded-full opacity-0"></div>
          <div className="animate-psychic-rings w-32 h-32 sm:w-48 sm:h-48 border-4 border-purple-500 rounded-full opacity-0 animation-delay-200"></div>
          <div className="animate-psychic-rings w-32 h-32 sm:w-48 sm:h-48 border-4 border-indigo-500 rounded-full opacity-0 animation-delay-400"></div>
        </div>
      )}
      
      {activeAnimation === 'animate-ghost-attack' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-ghost-fade absolute w-full h-full bg-indigo-900 opacity-0"></div>
          <div className="animate-ghost-appear absolute text-6xl sm:text-7xl opacity-0">👻</div>
        </div>
      )}
      
      {activeAnimation === 'animate-poison-attack' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-poison-cloud absolute w-20 h-20 sm:w-32 sm:h-32 bg-purple-700 rounded-full opacity-0"></div>
          <div className="animate-poison-bubbles absolute w-full h-full">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute w-3 h-3 bg-purple-500 rounded-full animate-float-random" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${40 + Math.random() * 30}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  opacity: Math.random() * 0.7 + 0.3
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
      
      {activeAnimation === 'animate-normal-attack' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-impact absolute w-20 h-20 sm:w-32 sm:h-32 bg-gray-400 rounded-full opacity-0"></div>
          <div className="absolute text-4xl animate-bounce-once">💥</div>
        </div>
      )}
    </div>
  );
};

// Battle attack button component
const BattleAttackButton = ({
  attackId,
  index,
  disabled,
  isSelected,
  isAnimating,
  onClick
}: {
  attackId: BlobAttack;
  index: number;
  disabled: boolean;
  isSelected: boolean;
  isAnimating: boolean;
  onClick: () => void;
}) => {
  const attack = getAttackById(attackId);
  if (!attack) return null;
  
  // Get attack color based on type
  const getAttackColor = (type: BlobType): string => {
    switch (type) {
      case 'fire': return "bg-red-900/30 border-red-700 hover:border-red-600";
      case 'water': return "bg-blue-900/30 border-blue-700 hover:border-blue-600";
      case 'electric': return "bg-yellow-900/30 border-yellow-700 hover:border-yellow-600";
      case 'grass': return "bg-green-900/30 border-green-700 hover:border-green-600";
      case 'ice': return "bg-cyan-900/30 border-cyan-700 hover:border-cyan-600";
      case 'fighting': return "bg-orange-900/30 border-orange-700 hover:border-orange-600";
      case 'poison': return "bg-purple-900/30 border-purple-700 hover:border-purple-600";
      case 'ground': 
      case 'rock': return "bg-amber-900/30 border-amber-700 hover:border-amber-600";
      case 'psychic': return "bg-pink-900/30 border-pink-700 hover:border-pink-600";
      case 'ghost': return "bg-indigo-900/30 border-indigo-700 hover:border-indigo-600";
      default: return "bg-gray-900/30 border-gray-700 hover:border-gray-600";
    }
  };
  
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "pixel-button h-16 sm:h-24 p-0 overflow-hidden relative group",
        isSelected ? "animate-button-press" : "",
        isAnimating ? "ring-2 ring-white/50" : "",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        getAttackColor(attack.type)
      )}
    >
      {/* Attack type badge */}
      <div className="absolute top-0 left-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-br-md bg-black/30">
        <span className="text-lg sm:text-xl">{attack.icon}</span>
      </div>
      
      {/* Attack number badge */}
      <div className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[8px] sm:text-[10px] bg-black/30 rounded-bl-md text-white font-bold">
        {index + 1}
      </div>
      
      {/* Main content */}
      <div className="w-full h-full flex flex-col pt-5 pb-1 px-2">
        {/* Attack name */}
        <div className="text-center mb-1">
          <span className="pixel-text text-white text-xs sm:text-sm font-semibold tracking-wide truncate block">
            {attack.name}
          </span>
        </div>
        
        {/* Type and power bar */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center bg-black/40 px-1.5 py-0.5 rounded-sm">
            <span className="text-[8px] sm:text-[10px] capitalize text-white">
              {attack.type}
            </span>
          </div>
          
          <div className="flex items-center bg-black/40 px-1.5 py-0.5 rounded-sm">
            <span className="text-[8px] sm:text-[10px] text-white">
              PWR: {attack.basePower}
            </span>
          </div>
        </div>
        
        {/* Effect description */}
        {attack.effectDescription && (
          <div className="w-full mt-0.5 bg-black/30 px-1 py-0.5 rounded-sm">
            <p className="text-[7px] sm:text-[9px] text-gray-200 italic truncate text-center">
              {attack.effectDescription}
            </p>
          </div>
        )}
      </div>
      
      {/* Hover/press effect overlay */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </Button>
  );
};

// Battle status component
const BattleStatus = ({ battleState, opponentName }: { battleState: any, opponentName: string }) => {
  if (!battleState) return null;
  
  return (
    <div className="flex-1 my-2 sm:my-4 flex flex-col items-center justify-center">
      {battleState.lastMove ? (
        <div className="text-center mb-2 sm:mb-4">
          <p className="text-sm sm:text-base text-white pixel-text">
            {battleState.turn === 'player' 
              ? `${opponentName || 'Opponent'} used ${battleState.lastMove}!` 
              : `You used ${battleState.lastMove}!`}
          </p>
          {battleState.lastDamage && (
            <p className={battleState.lastEffectiveness === 'super' 
              ? "text-green-400 pixel-text mt-1 text-xs sm:text-sm"
              : battleState.lastEffectiveness === 'weak'
                ? "text-red-400 pixel-text mt-1 text-xs sm:text-sm"
                : "text-white pixel-text mt-1 text-xs sm:text-sm"
            }>
              {battleState.lastEffectiveness === 'super' && "It's super effective! "}
              {battleState.lastEffectiveness === 'weak' && "It's not very effective... "}
              Dealt {battleState.lastDamage} damage!
            </p>
          )}
        </div>
      ) : (
        <div className="text-center mb-2 sm:mb-4">
          <p className="text-sm sm:text-base text-white pixel-text">
            {battleState.turn === 'player'
              ? 'Your turn! Choose a move.'
              : `Waiting for ${opponentName || 'opponent'} to make a move...`}
          </p>
        </div>
      )}
      
      {battleState.turn !== 'player' && (
        <div className="animate-pulse">
          <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-blob-primary rounded-full mx-1"></span>
          <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-blob-primary rounded-full mx-1 animate-delay-200"></span>
          <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-blob-primary rounded-full mx-1 animate-delay-400"></span>
        </div>
      )}
    </div>
  );
};

// Main battle arena component
interface BattleArenaProps {
  evolutionLevel: number;
  onClose: () => void;
  appearance: BlobAppearance;
}

const BattleArena: React.FC<BattleArenaProps> = ({ evolutionLevel, onClose, appearance }) => {
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  
  // Setup state for attack animations
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [animatingAttackId, setAnimatingAttackId] = useState<string | null>(null);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  
  const { 
    battleState, 
    opponentName,
    opponentAppearance,
    opponentEvolutionLevel, 
    executeMove, 
    disconnect
  } = useBattle();

  // Filter out 'none' and get available attacks
  const availableAttacks = appearance.attack !== 'none' 
    ? [appearance.attack]
    : [] as BlobAttack[];
  
  // Get any additional attacks from a multi-attack system
  const getSelectedAttacks = (): BlobAttack[] => {
    // First check if we have access to localStorage for stored attacks
    if (typeof window !== 'undefined') {
      try {
        const savedAppearance = localStorage.getItem('blobAppearance');
        if (savedAppearance) {
          const parsed = JSON.parse(savedAppearance);
          if (parsed.selectedAttacks && Array.isArray(parsed.selectedAttacks) && parsed.selectedAttacks.length > 0) {
            return parsed.selectedAttacks
              .filter((a: string) => a !== 'none')
              .map((id: string) => id as BlobAttack);
          }
        }
      } catch (e) {
        console.error('Error parsing saved appearance', e);
      }
    }
    
    // If no attacks found in localStorage, return the single attack if it exists
    return appearance.attack !== 'none' ? [appearance.attack] : [];
  };
  
  // Use the selected attacks or fallback to default attacks
  const selectedAttacks = getSelectedAttacks();
  const attacksToUse = selectedAttacks.length > 0 
    ? selectedAttacks
    : ['quick_attack'] as BlobAttack[];
  
  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Number keys 1-4 for selecting moves
      if (['1', '2', '3', '4'].includes(key) && !showEndScreen && battleState?.turn === 'player') {
        const moveIndex = parseInt(key) - 1;
        
        if (moveIndex >= 0 && moveIndex < attacksToUse.length) {
          const attack = getAttackById(attacksToUse[moveIndex]);
          if (attack) {
            handleMoveClick(attacksToUse[moveIndex]);
          }
        }
      }
      
      // Escape key to show confirm dialog
      if (e.key === 'Escape') {
        setShowOverlay(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [battleState, showEndScreen, attacksToUse]);
  
  // Show end screen when battle is over
  useEffect(() => {
    if (battleState?.gameOver) {
      setShowEndScreen(true);
      setActiveSound(battleState?.winner === 'player' ? 'victory' : 'defeat');
    }
  }, [battleState?.gameOver]);
  
  // Handle move button click
  const handleMoveClick = (attackId: BlobAttack) => {
    if (battleState?.turn !== 'player' || showEndScreen) return;
    
    setSelectedMove(attackId);
    
    const attack = getAttackById(attackId);
    if (!attack) return;
    
    // Get sound effect based on attack type
    const getSoundEffect = (type: BlobType): string => {
      switch (type) {
        case 'fire': return 'fire';
        case 'water': return 'water';
        case 'electric': return 'electric';
        case 'grass': return 'grass';
        case 'ice': return 'ice';
        case 'fighting': return 'hit';
        case 'poison': return 'poison';
        case 'ground': 
        case 'rock': return 'rock';
        case 'psychic': return 'psychic';
        case 'ghost': return 'ghost';
        default: return 'normal';
      }
    };
    
    // Start animation and sound
    setAnimatingAttackId(attackId);
    setActiveAnimation(attack.animation || getDefaultAnimation(attack.type));
    setActiveSound(getSoundEffect(attack.type));
    
    // Execute the move with a small delay for animation
    setTimeout(() => {
      executeMove(attack.name);
      
      // End animation after a delay
      setTimeout(() => {
        setAnimatingAttackId(null);
        setActiveAnimation(null);
        setSelectedMove(null);
      }, 800);
    }, 500);
  };
  
  // Get default animation based on attack type if none specified
  const getDefaultAnimation = (type: BlobType): string => {
    switch (type) {
      case 'fire': return 'animate-fire-attack';
      case 'water': return 'animate-water-attack';
      case 'electric': return 'animate-electric-attack';
      case 'grass': return 'animate-grass-attack';
      case 'ice': return 'animate-ice-attack';
      case 'fighting': return 'animate-fighting-attack';
      case 'poison': return 'animate-poison-attack';
      case 'ghost': return 'animate-ghost-attack';
      case 'psychic': return 'animate-psychic-attack';
      default: return 'animate-normal-attack';
    }
  };
  
  // Handle closing the battle
  const handleCloseBattle = () => {
    disconnect();
    onClose();
  };
  
  // Create default opponent appearance if none received
  const getOpponentAppearance = (): BlobAppearance => {
    if (opponentAppearance) {
      return {
        type: opponentAppearance.type || 'normal',
        eyes: opponentAppearance.eyes || 'default',
        mouth: opponentAppearance.mouth || 'default',
        attack: opponentAppearance.attack as BlobAttack || 'none'
      };
    }
    
    // Fallback to a random type if no appearance data
    const types: BlobType[] = ['normal', 'fire', 'water', 'electric', 'grass', 'ice'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    return {
      type: (battleState?.opponentType as BlobType) || randomType,
      eyes: 'default',
      mouth: 'default',
      attack: 'none'
    };
  };
  
  return (
    <div className="h-full w-full flex flex-col justify-between bg-gradient-to-b from-black to-gray-900 p-3 sm:p-6">
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-40">
        <button onClick={() => setShowOverlay(true)} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      {/* Sound effects */}
      <SoundEffects activeSound={activeSound} />
      
      {/* Animation effects */}
      <BattleAnimationEffects activeAnimation={activeAnimation} />
      
      {/* Opponent character */}
      <BattleCharacter 
        name={opponentName || 'Opponent'} 
        hp={battleState?.opponentHP || 0} 
        maxHp={100} 
        appearance={getOpponentAppearance()} 
        evolutionLevel={opponentEvolutionLevel || 1}
        isOpponent={true}
        isAnimating={activeAnimation !== null && battleState?.turn !== 'player'}
        animationType={activeAnimation}
      />
      
      {/* Battle status */}
      <BattleStatus battleState={battleState} opponentName={opponentName || 'Opponent'} />
      
      {/* Player character */}
      <BattleCharacter 
        name="Your Blob" 
        hp={battleState?.playerHP || 0} 
        maxHp={100} 
        appearance={appearance} 
        evolutionLevel={evolutionLevel}
        isOpponent={false}
        isAnimating={activeAnimation !== null && battleState?.turn === 'player'}
        animationType={activeAnimation}
      />
      
      {/* Moves section */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-6">
        {attacksToUse.map((attackId, index) => (
          <BattleAttackButton 
            key={attackId}
            attackId={attackId}
            index={index}
            disabled={battleState?.turn !== 'player'}
            isSelected={selectedMove === attackId}
            isAnimating={animatingAttackId === attackId}
            onClick={() => handleMoveClick(attackId)}
          />
        ))}
        
        {/* Fill empty slots if we have fewer than 4 attacks */}
        {Array.from({ length: Math.max(0, 4 - attacksToUse.length) }).map((_, index) => (
          <div 
            key={`empty-${index}`}
            className="pixel-button h-16 sm:h-24 p-0 overflow-hidden relative bg-gray-900/20 border-gray-800/50 opacity-30"
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="pixel-text text-gray-500 text-xs">No Attack</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Confirmation overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 p-4">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4 max-w-xs w-full">
            <h3 className="text-lg text-white pixel-text mb-4 text-center">Forfeit Battle?</h3>
            <p className="text-gray-300 text-sm mb-6 text-center">
              Are you sure you want to forfeit this battle? You will lose any progress.
            </p>
            <div className="flex justify-between gap-4">
              <Button 
                onClick={handleCloseBattle}
                className="flex-1 bg-red-900/30 border-red-700 hover:bg-red-800/40 pixel-button"
              >
                <div className="flex items-center justify-center">
                  <X size={16} className="mr-2" />
                  <span>Forfeit</span>
                </div>
              </Button>
              <Button 
                onClick={() => setShowOverlay(false)}
                className="flex-1 bg-green-900/30 border-green-700 hover:bg-green-800/40 pixel-button"
              >
                <div className="flex items-center justify-center">
                  <Shield size={16} className="mr-2" />
                  <span>Continue</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* End screen */}
      {showEndScreen && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 p-4">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-xs w-full text-center">
            <h2 className="text-xl text-white pixel-text mb-2">
              {battleState?.winner === 'player' ? 'Victory!' : 'Defeat!'}
            </h2>
            <p className="text-gray-300 mb-6">
              {battleState?.winner === 'player' 
                ? 'Your blob won the battle!'
                : 'Your blob was defeated.'}
            </p>
            <Button 
              onClick={handleCloseBattle}
              className="w-full bg-purple-900/30 border-purple-700 hover:bg-purple-800/40 pixel-button"
            >
              <div className="flex items-center justify-center">
                <Swords size={16} className="mr-2" />
                <span>Return to Home</span>
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleArena;
