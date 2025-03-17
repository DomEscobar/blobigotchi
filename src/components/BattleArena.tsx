import React, { useState, useEffect } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Shield, Zap, Heart, Swords, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/hooks/useSettings';
import { useGunDB } from '@/hooks/useGunDB';
import BattleBlob from './BattleBlob';

interface BattleMove {
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'attack' | 'defense' | 'special';
}

interface BattleArenaProps {
  evolutionLevel: number;
  onClose: () => void;
}

const BattleArena: React.FC<BattleArenaProps> = ({ evolutionLevel, onClose }) => {
  const { 
    battleState, 
    executeMove, 
    opponentName, 
    connectionStatus,
    messages,
    sendMessage,
    disconnect
  } = useWebRTC();
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useIsMobile();
  const { settings } = useSettings();
  const { recordBattle } = useGunDB();
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  
  useEffect(() => {
    if (battleState?.lastMove && !moveHistory.includes(battleState.lastMove)) {
      setMoveHistory(prev => [...prev, battleState.lastMove]);
    }
  }, [battleState?.lastMove, moveHistory]);
  
  useEffect(() => {
    if (battleState?.gameOver && battleState.winner) {
      recordBattle({
        player1: settings.username,
        player2: opponentName || 'CPU Opponent',
        winner: battleState.winner === 'player' ? settings.username : opponentName || 'CPU Opponent',
        date: Date.now(),
        moves: moveHistory,
      });
      console.log('Battle recorded to GunDB');
    }
  }, [battleState?.gameOver, battleState?.winner, moveHistory, opponentName, recordBattle, settings.username]);
  
  const getMoves = (): BattleMove[] => {
    if (evolutionLevel <= 3) {
      return [
        { name: 'Milk Splash', description: 'A basic splash attack', icon: <Zap size={16} />, type: 'attack' },
        { name: 'Tummy Rush', description: 'Charge with your tummy!', icon: <Swords size={16} />, type: 'attack' },
        { name: 'Nap Heal', description: 'Restore some health', icon: <Heart size={16} />, type: 'defense' },
        { name: 'Baby Barrier', description: 'Reduce incoming damage', icon: <Shield size={16} />, type: 'defense' }
      ];
    } else if (evolutionLevel <= 6) {
      return [
        { name: 'Pixel Punch', description: 'A solid hit', icon: <Swords size={16} />, type: 'attack' },
        { name: 'Static Shock', description: 'Electrify your opponent', icon: <Zap size={16} />, type: 'attack' },
        { name: 'Candy Heal', description: 'Restore health with candy', icon: <Heart size={16} />, type: 'defense' },
        { name: 'Block Shield', description: 'Block incoming damage', icon: <Shield size={16} />, type: 'defense' }
      ];
    } else {
      return [
        { name: 'Chaos Beam', description: 'A powerful energy attack', icon: <Zap size={16} />, type: 'attack' },
        { name: 'Pixel Uppercut', description: 'A devastating uppercut', icon: <Swords size={16} />, type: 'attack' },
        { name: 'DNA Shield', description: 'Advanced protection', icon: <Shield size={16} />, type: 'defense' },
        { name: 'Fusion Heal', description: 'Powerful recovery', icon: <Heart size={16} />, type: 'special' }
      ];
    }
  };

  const moves = getMoves();
  
  const handleMoveClick = (move: BattleMove) => {
    if (connectionStatus !== 'connected' || !battleState) return;
    
    if (battleState.turn === 'player') {
      executeMove(move.name);
    }
  };
  
  const handleChatSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('chatInput') as HTMLInputElement;
    
    if (input.value.trim()) {
      sendMessage('chat', input.value.trim());
      input.value = '';
    }
  };
  
  const chatMessages = messages.filter(m => m.type === 'chat');
  
  if (!battleState) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="pixel-text text-white text-center">No active battle</p>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      <button 
        onClick={() => {
          disconnect();
          onClose();
        }}
        className="absolute top-2 right-2 z-50 p-1 bg-black/50 rounded-full"
      >
        <X size={16} className="text-white" />
      </button>
      
      <div className="flex-1 bg-gray-800/70 flex flex-col items-center justify-center relative p-4 border-b border-gray-700">
        <div className="absolute top-2 left-2 z-10">
          <p className="pixel-text text-white text-xs">{opponentName || 'Opponent'}</p>
        </div>
        
        <div className="absolute top-2 right-2 w-1/3 h-4 bg-gray-900 border border-gray-700 rounded-sm overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${(battleState.opponentHP / 100) * 100}%` }}
          ></div>
        </div>
        
        <div className="transform scale-x-[-1]">
          <BattleBlob 
            mood="normal" 
            evolutionLevel={evolutionLevel} 
            isAttacking={battleState.turn === 'opponent'}
            isHurt={battleState.lastMove && battleState.turn === 'player'}
          />
        </div>
      </div>
      
      <div className="h-16 bg-black/80 border-y border-gray-700 p-2 overflow-hidden">
        <p className="pixel-text text-white text-xs animate-fade-in">
          {battleState.lastMove ? (
            <>
              {battleState.turn === 'player' 
                ? `Opponent used ${battleState.lastMove}! Dealt ${battleState.lastDamage} damage!` 
                : `You used ${battleState.lastMove}! Dealt ${battleState.lastDamage} damage!`}
            </>
          ) : (
            <>
              {battleState.turn === 'player' 
                ? "Your turn! Select a move to attack."
                : "Opponent's turn. Waiting for their move..."}
            </>
          )}
        </p>
        <p className="pixel-text text-gray-400 text-[10px] mt-1">
          Round {battleState.round} | {battleState.turn === 'player' ? 'Your turn' : "Opponent's turn"}
        </p>
      </div>
      
      <div className="flex-1 bg-gray-900/90 flex flex-col items-center justify-center relative p-4">
        <div className="absolute bottom-2 left-2 z-10">
          <p className="pixel-text text-white text-xs">{settings.username || 'You'}</p>
        </div>
        
        <div className="absolute bottom-2 right-2 w-1/3 h-4 bg-gray-800 border border-gray-700 rounded-sm overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(battleState.playerHP / 100) * 100}%` }}
          ></div>
        </div>
        
        <BattleBlob 
          mood="normal" 
          evolutionLevel={evolutionLevel} 
          isAttacking={battleState.turn === 'player' && battleState.lastMove !== undefined}
          isHurt={battleState.lastMove && battleState.turn === 'opponent'}
        />
      </div>
      
      <div className="h-32 bg-black/80 border-t border-gray-700 p-2">
        {isChatOpen ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto mb-2 bg-gray-900/50 rounded p-1">
              {chatMessages.length === 0 ? (
                <p className="pixel-text text-gray-500 text-[10px]">No messages yet. Say hello!</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="mb-1">
                    <span className={`pixel-text text-[10px] ${msg.sender === (settings.username || 'Anonymous Blob') ? 'text-green-400' : 'text-blue-400'}`}>
                      {msg.sender}:
                    </span>
                    <span className="pixel-text text-white text-[10px] ml-1">{msg.data}</span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleChatSend} className="flex">
              <input 
                type="text" 
                name="chatInput"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-l text-white pixel-text text-xs p-1"
                placeholder="Send a message"
              />
              <button 
                type="submit"
                className="bg-gray-700 border border-gray-600 rounded-r px-2 text-white pixel-text text-xs"
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 h-full">
            {moves.map((move, index) => (
              <button
                key={index}
                onClick={() => handleMoveClick(move)}
                disabled={battleState.turn !== 'player'}
                className={cn(
                  "pixel-button text-left flex items-center overflow-hidden relative",
                  move.type === 'attack' && "border-red-900/50 bg-red-950/30",
                  move.type === 'defense' && "border-blue-900/50 bg-blue-950/30",
                  move.type === 'special' && "border-purple-900/50 bg-purple-950/30",
                  battleState.turn !== 'player' && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="mr-2">{move.icon}</div>
                <div>
                  <div className="pixel-text text-white text-xs">{move.name}</div>
                  {!isMobile && (
                    <div className="pixel-text text-gray-400 text-[8px]">{move.description}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 translate-y-16 p-2 bg-gray-800 rounded-full border border-gray-700 z-20"
      >
        <MessageCircle size={18} className={`${isChatOpen ? 'text-green-400' : 'text-white'}`} />
      </button>
    </div>
  );
};

export default BattleArena;
