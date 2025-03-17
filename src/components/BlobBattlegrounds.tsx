
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useSettings } from '@/hooks/useSettings';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Gamepad, Users, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import BattleArena from './BattleArena';

interface BlobBattlegroundsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evolutionLevel: number;
}

const BlobBattlegrounds: React.FC<BlobBattlegroundsProps> = ({ 
  open, 
  onOpenChange,
  evolutionLevel
}) => {
  const [battleView, setBattleView] = useState<'menu' | 'lobby' | 'battle'>('menu');
  const [inviteCode, setInviteCode] = useState('');
  
  const { 
    connectionStatus, 
    isWaitingForOpponent, 
    connectionCode, 
    createBattleInvite, 
    joinBattleWithCode,
    startSimulatedBattle,
    disconnect
  } = useWebRTC();
  
  const { settings } = useSettings();
  
  // Handle closing the dialog
  const handleClose = () => {
    // If we're in a battle, disconnect first
    if (connectionStatus !== 'disconnected') {
      disconnect();
    }
    setBattleView('menu');
    onOpenChange(false);
  };
  
  // If connected, show the battle arena
  if (connectionStatus === 'connected' && open) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 bg-crt-background border-blob-tertiary crt-screen">
          <BattleArena evolutionLevel={evolutionLevel} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-crt-background border-blob-tertiary overflow-hidden">
        <div className="absolute top-4 right-4">
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <h2 className="text-xl font-bold text-center text-white pixel-text mb-6">
          BLOB BATTLEGROUNDS
        </h2>
        
        {battleView === 'menu' && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-block p-4 bg-black/50 rounded-lg border border-blob-tertiary/50 mb-2">
                <Gamepad size={40} className="text-blob-secondary" />
              </div>
              <p className="text-sm text-gray-300 pixel-text mt-2">
                Challenge other blob trainers to battles!
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  setBattleView('lobby');
                  createBattleInvite();
                }}
                className="pixel-button group p-4 border-blob-secondary hover:border-blob-primary"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <Users className="text-blob-tertiary group-hover:text-blob-primary" />
                    <span className="pixel-text text-white">CHALLENGE A FRIEND</span>
                  </div>
                  <span className="text-gray-400 text-xs">→</span>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setBattleView('battle');
                  startSimulatedBattle();
                }}
                className="pixel-button group p-4 border-gray-700 hover:border-blob-tertiary"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <Trophy className="text-yellow-500 group-hover:text-yellow-400" />
                    <span className="pixel-text text-white">PRACTICE BATTLE</span>
                  </div>
                  <span className="text-gray-400 text-xs">→</span>
                </div>
              </button>
              
              <div className="mt-4 pt-4 border-t border-gray-800">
                <label className="block text-sm text-gray-400 pixel-text mb-2">Have a battle code?</label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="bg-black border-gray-700 text-white"
                  />
                  <Button
                    onClick={() => {
                      if (inviteCode.trim()) {
                        joinBattleWithCode(inviteCode.trim());
                        setBattleView('battle');
                      }
                    }}
                    disabled={!inviteCode.trim()}
                    className="bg-blob-tertiary hover:bg-blob-secondary text-white pixel-text"
                  >
                    Join
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {battleView === 'lobby' && (
          <div className="space-y-6 text-center">
            <div className="inline-block p-6 bg-black/50 rounded-lg border border-blob-tertiary/50 mb-4 animate-pulse">
              <Gamepad size={50} className="text-blob-secondary" />
            </div>
            
            <h3 className="text-lg text-white pixel-text">
              {isWaitingForOpponent ? "Waiting for opponent..." : "Generating battle code..."}
            </h3>
            
            {connectionCode && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 pixel-text mb-2">Share this code with your friend:</p>
                <div className="bg-black p-3 rounded border border-blob-tertiary/50 flex items-center justify-center">
                  <span className="text-xl text-blob-primary pixel-text letter-spacing-wide">
                    {connectionCode}
                  </span>
                </div>
                <p className="text-xs text-gray-500 pixel-text mt-2">
                  When they join, the battle will start automatically
                </p>
              </div>
            )}
            
            <button
              onClick={() => {
                disconnect();
                setBattleView('menu');
              }}
              className="mt-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded pixel-text text-sm inline-block"
            >
              Cancel
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BlobBattlegrounds;
