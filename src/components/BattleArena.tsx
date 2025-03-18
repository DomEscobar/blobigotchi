import React, { useState, useEffect } from 'react';
import { X, Shield, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useBattle } from '@/contexts/BattleContext';

interface BattleArenaProps {
  evolutionLevel: number;
  onClose: () => void;
}

const BattleArena: React.FC<BattleArenaProps> = ({ evolutionLevel, onClose }) => {
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  
  const { 
    battleState, 
    opponentName, 
    executeMove, 
    disconnect
  } = useBattle();
  
  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Number keys 1-4 for selecting moves
      if (['1', '2', '3', '4'].includes(key) && !showEndScreen && battleState?.turn === 'player') {
        const moveIndex = parseInt(key) - 1;
        const moves = ['Pixel Punch', 'Blob Beam', 'Digital Dash', 'Static Slam'];
        
        if (moveIndex >= 0 && moveIndex < moves.length) {
          executeMove(moves[moveIndex]);
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
  }, [battleState, showEndScreen, executeMove]);
  
  // Show end screen when battle is over
  useEffect(() => {
    if (battleState?.gameOver) {
      setShowEndScreen(true);
    }
  }, [battleState?.gameOver]);
  
  // Handle move button click
  const handleMoveClick = (moveName: string) => {
    if (battleState?.turn !== 'player' || showEndScreen) return;
    
    setSelectedMove(moveName);
    
    // Execute the move with a small delay for animation
    setTimeout(() => {
      executeMove(moveName);
      setSelectedMove(null);
    }, 300);
  };
  
  // Handle closing the battle
  const handleCloseBattle = () => {
    disconnect();
    onClose();
  };
  
  // Render battle end screen if the battle is over
  if (showEndScreen && battleState?.gameOver) {
    const isVictory = battleState.winner === 'player';
    
    return (
      <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 p-6">
        <div className="absolute top-4 right-4">
          <button onClick={handleCloseBattle} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="text-center max-w-md mx-auto">
          <h1 className={`text-4xl font-bold pixel-text mb-6 ${isVictory ? 'text-green-400' : 'text-red-400'}`}>
            {isVictory ? 'VICTORY!' : 'DEFEATED!'}
          </h1>
          
          <div className="bg-black/50 rounded-lg border border-blob-tertiary/50 p-6 mb-6">
            <p className="text-white pixel-text mb-4">
              {isVictory 
                ? 'Your blob has triumphed in battle!' 
                : 'Your blob fought bravely, but was defeated.'}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-center">
              <div>
                <p className="text-gray-400 pixel-text">Your HP</p>
                <p className={`text-xl font-bold pixel-text ${battleState.playerHP > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {battleState.playerHP}/100
                </p>
              </div>
              <div>
                <p className="text-gray-400 pixel-text">Opponent HP</p>
                <p className={`text-xl font-bold pixel-text ${battleState.opponentHP > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {battleState.opponentHP}/100
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleCloseBattle}
            className="px-6 py-3 bg-blob-tertiary hover:bg-blob-secondary text-white rounded pixel-text"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  }
  
  // Render confirmation overlay when trying to leave battle
  if (showOverlay) {
    return (
      <div className="relative h-full w-full">
        {/* Render the battle arena in the background */}
        <div className="absolute inset-0 filter blur-sm">
          <div className="h-full w-full flex flex-col justify-between bg-gradient-to-b from-black to-gray-900 p-6">
            {/* Battle arena content (blurred) */}
          </div>
        </div>
        
        {/* Confirmation overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-black rounded-lg border border-blob-tertiary p-6 max-w-sm">
            <h3 className="text-xl font-bold text-white pixel-text mb-4">Leave Battle?</h3>
            <p className="text-gray-300 pixel-text mb-6">
              Are you sure you want to leave the battle? This will count as a forfeit.
            </p>
            
            <div className="flex space-x-4">
              <button 
                onClick={handleCloseBattle}
                className="flex-1 px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded pixel-text"
              >
                Leave Battle
              </button>
              <button 
                onClick={() => setShowOverlay(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded pixel-text"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-blob-secondary rounded-full animate-pulse opacity-50"></div>
          </div>
          {/* Placeholder for opponent's blob image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield size={40} className="text-blob-tertiary" />
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
              <p className="text-red-400 pixel-text mt-1">
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
            <div className="w-20 h-20 bg-blob-primary rounded-full animate-pulse opacity-50"></div>
          </div>
          {/* Placeholder for player's blob image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Swords size={40} className="text-blob-primary" />
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
        {['Pixel Punch', 'Blob Beam', 'Digital Dash', 'Static Slam'].map((move, index) => (
          <Button
            key={move}
            onClick={() => handleMoveClick(move)}
            disabled={battleState?.turn !== 'player'}
            className={cn(
              "pixel-button h-16 p-4",
              selectedMove === move ? "animate-button-press" : "",
              battleState?.turn !== 'player' ? "opacity-50 cursor-not-allowed" : "",
              index === 0 ? "bg-red-900/30 border-red-700 hover:border-red-600" : "",
              index === 1 ? "bg-blue-900/30 border-blue-700 hover:border-blue-600" : "",
              index === 2 ? "bg-green-900/30 border-green-700 hover:border-green-600" : "",
              index === 3 ? "bg-purple-900/30 border-purple-700 hover:border-purple-600" : ""
            )}
          >
            <div className="w-full flex items-center justify-between">
              <span className="pixel-text text-white">{move}</span>
              <span className="text-xs text-gray-400">#{index + 1}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BattleArena;
