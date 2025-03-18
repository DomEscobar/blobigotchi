import React, { useState, useEffect } from 'react';
import { X, Shield, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useBattle } from '@/contexts/BattleContext';
import Blob from '@/components/Blob';
import { BlobAppearance, BlobAttack, BlobType } from '@/hooks/useBlobAppearance';
import { getAttackById } from '@/data/attacks';

interface BattleArenaProps {
  evolutionLevel: number;
  onClose: () => void;
  appearance: BlobAppearance;
}

const BattleArena: React.FC<BattleArenaProps> = ({ evolutionLevel, onClose, appearance }) => {
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  
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
    : ['quick_attack', 'blob_beam', 'pixel_punch', 'static_slam'] as BlobAttack[];
  
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
            executeMove(attack.name);
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
  }, [battleState, showEndScreen, executeMove, attacksToUse]);
  
  // Show end screen when battle is over
  useEffect(() => {
    if (battleState?.gameOver) {
      setShowEndScreen(true);
    }
  }, [battleState?.gameOver]);
  
  // Handle move button click
  const handleMoveClick = (attackId: BlobAttack) => {
    if (battleState?.turn !== 'player' || showEndScreen) return;
    
    setSelectedMove(attackId);
    
    const attack = getAttackById(attackId);
    if (!attack) return;
    
    // Execute the move with a small delay for animation
    setTimeout(() => {
      executeMove(attack.name);
      setSelectedMove(null);
    }, 300);
  };
  
  // Handle closing the battle
  const handleCloseBattle = () => {
    disconnect();
    onClose();
  };
  
  // Log appearance and evolution data for debugging
  useEffect(() => {
    console.log('BattleArena using appearance:', appearance);
    console.log('BattleArena using evolution level:', evolutionLevel);
  }, [appearance, evolutionLevel]);
  
  // Create default opponent appearance if none received
  const getOpponentAppearance = (): BlobAppearance => {
    if (opponentAppearance) {
      console.log('Using received opponent appearance:', opponentAppearance);
      return {
        type: opponentAppearance.type || 'normal',
        eyes: opponentAppearance.eyes || 'default',
        mouth: opponentAppearance.mouth || 'default',
        attack: opponentAppearance.attack as BlobAttack || 'none'
      };
    }
    
    console.log('No opponent appearance data, using fallback');
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
  
  // Get attack color based on type
  const getAttackColor = (attackId: BlobAttack): string => {
    const attack = getAttackById(attackId);
    if (!attack) return "bg-gray-900/30 border-gray-700";
    
    switch (attack.type) {
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
  
  // Main battle arena screen
  return (
    <div className="h-full w-full flex flex-col justify-between bg-gradient-to-b from-black to-gray-900 p-6">
      <div className="absolute top-4 right-4">
        <button onClick={() => setShowOverlay(true)} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      {/* Opponent section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg text-white pixel-text">{opponentName || 'Opponent'}</h3>
          <div className="bg-gray-800 rounded-lg w-64 h-4 mt-1">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-lg transition-all duration-500 ease-out"
              style={{ width: `${(battleState?.opponentHP || 0) / 100 * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 pixel-text mt-1">
            HP: {battleState?.opponentHP || 0}/100
          </p>
        </div>
        
        <div className="h-32 w-32 relative">
          {/* Opponent blob with proper appearance */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Blob 
              mood="normal" 
              onClick={() => {}} 
              evolutionLevel={opponentEvolutionLevel || 1} 
              appearance={getOpponentAppearance()}
            />
          </div>
        </div>
      </div>
      
      {/* Battle log section */}
      <div className="flex-1 my-4 flex flex-col items-center justify-center">
        {battleState?.lastMove ? (
          <div className="text-center mb-4">
            <p className="text-white pixel-text">
              {battleState.turn === 'player' 
                ? `${opponentName || 'Opponent'} used ${battleState.lastMove}!` 
                : `You used ${battleState.lastMove}!`}
            </p>
            {battleState.lastDamage && (
              <p className={battleState.lastEffectiveness === 'super' 
                ? "text-green-400 pixel-text mt-1"
                : battleState.lastEffectiveness === 'weak'
                  ? "text-red-400 pixel-text mt-1"
                  : "text-white pixel-text mt-1"
              }>
                {battleState.lastEffectiveness === 'super' && "It's super effective! "}
                {battleState.lastEffectiveness === 'weak' && "It's not very effective... "}
                Dealt {battleState.lastDamage} damage!
              </p>
            )}
          </div>
        ) : (
          <div className="text-center mb-4">
            <p className="text-white pixel-text">
              {battleState?.turn === 'player'
                ? 'Your turn! Choose a move.'
                : `Waiting for ${opponentName || 'opponent'} to make a move...`}
            </p>
          </div>
        )}
        
        {battleState?.turn !== 'player' && (
          <div className="animate-pulse">
            <span className="inline-block w-4 h-4 bg-blob-primary rounded-full mx-1"></span>
            <span className="inline-block w-4 h-4 bg-blob-primary rounded-full mx-1 animate-delay-200"></span>
            <span className="inline-block w-4 h-4 bg-blob-primary rounded-full mx-1 animate-delay-400"></span>
          </div>
        )}
      </div>
      
      {/* Player section */}
      <div className="flex justify-between items-center">
        <div className="h-32 w-32 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Blob 
              mood={battleState?.playerHP && battleState.playerHP < 30 ? "sad" : "happy"} 
              onClick={() => {}} 
              evolutionLevel={evolutionLevel} 
              appearance={appearance} 
            />
          </div>
        </div>
        
        <div className="text-right">
          <h3 className="text-lg text-white pixel-text">Your Blob</h3>
          <div className="bg-gray-800 rounded-lg w-64 h-4 mt-1">
            <div 
              className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-lg transition-all duration-500 ease-out"
              style={{ width: `${(battleState?.playerHP || 0) / 100 * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 pixel-text mt-1">
            HP: {battleState?.playerHP || 0}/100
          </p>
        </div>
      </div>
      
      {/* Moves section */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {attacksToUse.map((attackId, index) => {
          const attack = getAttackById(attackId);
          if (!attack) return null;
          
          return (
            <Button
              key={attackId}
              onClick={() => handleMoveClick(attackId)}
              disabled={battleState?.turn !== 'player'}
              className={cn(
                "pixel-button h-16 p-4",
                selectedMove === attackId ? "animate-button-press" : "",
                battleState?.turn !== 'player' ? "opacity-50 cursor-not-allowed" : "",
                getAttackColor(attackId)
              )}
            >
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2">{attack.icon}</span>
                  <span className="pixel-text text-white">{attack.name}</span>
                </div>
                <span className="text-xs text-gray-400">#{index + 1}</span>
              </div>
            </Button>
          );
        })}
        
        {/* Fill empty slots if we have fewer than 4 attacks */}
        {Array.from({ length: Math.max(0, 4 - attacksToUse.length) }).map((_, index) => (
          <div 
            key={`empty-${index}`}
            className="pixel-button h-16 p-4 bg-gray-900/20 border-gray-800/50 opacity-30"
          >
            <div className="w-full flex items-center justify-between">
              <span className="pixel-text text-gray-500">No Attack</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleArena;
