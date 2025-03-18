import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PanelLeft, Globe, Copy, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import BattleArena from './BattleArena';
import { useBattle, BattleProvider } from '@/contexts/BattleContext';
import { useSettings } from '@/hooks/useSettings';
import { MessageType } from '@/contexts/BattleContext';

interface BlobBattlegroundsProps {
  evolutionLevel: number;
  onClose: () => void;
}

// Define a type for the battle views to avoid typos
type BattleView = 'menu' | 'lobby' | 'battle' | 'matchmaking' | 'debug';

// Create a wrapped component with its own BattleProvider
const BlobBattlegroundsWithProvider: React.FC<BlobBattlegroundsProps> = (props) => {
  return (
    <BattleProvider>
      <BlobBattlegroundsInner {...props} />
    </BattleProvider>
  );
};

// Inner component that uses the context
const BlobBattlegroundsInner: React.FC<BlobBattlegroundsProps> = ({ 
  evolutionLevel,
  onClose
}) => {
  // State management
  const [inviteCode, setInviteCode] = useState('');
  const [isJoiningBattle, setIsJoiningBattle] = useState(false);
  const [matchmakingStartTime, setMatchmakingStartTime] = useState<number | null>(null);
  const [battleCode, setBattleCode] = useState('');
  const [battleView, setBattleView] = useState<BattleView>('menu');
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  
  // Use refs to track the previous state for debugging
  const prevConnectionStatusRef = useRef<string | null>(null);
  
  // Get context data
  const { 
    connectionStatus, 
    isWaitingForOpponent, 
    connectionCode, 
    opponentName,
    matchmakingQueue,
    createBattleInvite, 
    joinBattleWithCode,
    startMatchmaking,
    disconnect,
    battleState,
    serverMessages
  } = useBattle();
  
  const { settings } = useSettings();
  
  // Log connection status changes for debugging
  useEffect(() => {
    if (prevConnectionStatusRef.current !== connectionStatus) {
      console.log(`BlobBattlegrounds: Connection status changed from ${prevConnectionStatusRef.current} to ${connectionStatus}`);
      prevConnectionStatusRef.current = connectionStatus;
    }
  }, [connectionStatus]);
  
  // Track matchmaking duration for timeout handling
  useEffect(() => {
    if (battleView === 'matchmaking' && matchmakingStartTime) {
      const checkTimeout = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - matchmakingStartTime;
        
        // If matchmaking has been going on for more than 30 seconds, show a notification
        if (elapsedTime > 30000 && connectionStatus !== 'connected') {
          clearInterval(checkTimeout);
          toast.info("Still searching...", {
            description: "Matchmaking is taking longer than usual. You can continue waiting or try again later.",
            duration: 5000,
            className: "pixel-text"
          });
        }
      }, 5000);
      
      return () => clearInterval(checkTimeout);
    }
  }, [battleView, matchmakingStartTime, connectionStatus]);
  
  // Reset to menu when disconnected
  useEffect(() => {
    if (connectionStatus === 'disconnected' && battleView !== 'menu') {
      setBattleView('menu');
    }
  }, [connectionStatus, battleView]);
  
  // Switch to battle view when battle state is received
  useEffect(() => {
    if (battleState && battleView !== 'battle') {
      setBattleView('battle');
    }
  }, [battleState, battleView]);
  
  // Handle copying battle code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Battle code copied to clipboard');
  };
  
  // Handle creating a new battle invite
  const handleCreateBattle = async () => {
    setBattleView('lobby');
    await createBattleInvite();
    toast.success(`Battle invite created`);
  };
  
  // Handle joining a battle with a code
  const handleJoinBattle = () => {
    if (!battleCode.trim()) {
      toast.error('Please enter a battle code');
      return;
    }
    
    setBattleView('lobby');
    joinBattleWithCode(battleCode.trim());
  };
  
  // Handle starting matchmaking for a quick match
  const handleQuickMatch = () => {
    setMatchmakingStartTime(Date.now());
    setBattleView('matchmaking');
    startMatchmaking();
  };
  
  // Handle closing the battle and returning to the menu
  const handleCloseBattle = () => {
    disconnect();
    setBattleView('menu');
    onClose();
  };
  
  // Render battle view if in battle
  if (battleView === 'battle' && battleState) {
    return (
      <div className="absolute inset-0 z-50 bg-black">
        <BattleArena evolutionLevel={evolutionLevel} onClose={handleCloseBattle} />
      </div>
    );
  }
  
  // Render matchmaking view if searching for a match
  if (battleView === 'matchmaking') {
    return (
      <div className="absolute inset-0 z-50 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6">
        <button onClick={() => { disconnect(); setBattleView('menu'); }} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white pixel-text mb-4">Finding a Match</h2>
          
          <div className="bg-black/50 rounded-lg border border-blob-tertiary/50 p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blob-primary"></div>
            </div>
            
            <p className="text-white pixel-text mb-2">Searching for opponents...</p>
            
            {matchmakingQueue && matchmakingQueue.length > 0 && (
              <p className="text-gray-400 pixel-text text-sm">
                {matchmakingQueue.length} other player{matchmakingQueue.length !== 1 ? 's' : ''} waiting
              </p>
            )}
            
            <div className="mt-4 flex items-center justify-center text-sm">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
              <span className="text-gray-400 pixel-text">
                Server: {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => { disconnect(); setBattleView('menu'); }}
            className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white rounded pixel-text"
          >
            Cancel Matchmaking
          </button>
        </div>
      </div>
    );
  }
  
  // Render lobby view if waiting in a created battle
  if (battleView === 'lobby') {
    return (
      <div className="absolute inset-0 z-50 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6">
        <button onClick={() => { disconnect(); setBattleView('menu'); }} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white pixel-text mb-4">Battle Lobby</h2>
          
          <div className="bg-black/50 rounded-lg border border-blob-tertiary/50 p-6 mb-6">
            {connectionStatus !== 'connected' ? (
              <div className="flex items-center justify-center space-x-2 mb-4 text-red-400">
                <AlertTriangle size={16} />
                <p className="pixel-text">Disconnected from server</p>
              </div>
            ) : (
              <>
                <p className="text-white pixel-text mb-4">Waiting for opponent to join...</p>
                
                {/* Battle code display */}
                <div className="bg-gray-900 rounded border border-gray-800 p-3 flex items-center justify-between mb-4">
                  <span className="text-blob-primary pixel-text overflow-hidden text-ellipsis">
                    {(() => {
                      // Find the battle code message in server messages
                      const codeMsg = serverMessages?.find(msg => 
                        msg.type === 'battleCode' || (msg.type === 'system' && msg.data?.includes('code'))
                      );
                      
                      if (codeMsg) {
                        if (codeMsg.type === 'battleCode') {
                          return codeMsg.data;
                        } else {
                          // Extract code from system message
                          const match = codeMsg.data.match(/code: ([A-Z0-9]+)/i);
                          return match ? match[1] : 'Generating code...';
                        }
                      }
                      
                      return 'Generating code...';
                    })()}
                  </span>
                  <button 
                    onClick={() => {
                      const codeMsg = serverMessages?.find(msg => 
                        msg.type === 'battleCode' || (msg.type === 'system' && msg.data?.includes('code'))
                      );
                      
                      if (codeMsg) {
                        if (codeMsg.type === 'battleCode') {
                          handleCopyCode(codeMsg.data);
                        } else {
                          const match = codeMsg.data.match(/code: ([A-Z0-9]+)/i);
                          if (match) handleCopyCode(match[1]);
                        }
                      }
                    }}
                    className="ml-2 p-1 hover:bg-gray-800 rounded"
                  >
                    <Copy size={16} className="text-gray-400" />
                  </button>
                </div>
                
                <div className="flex items-center justify-center text-sm mb-4">
                  <Info size={14} className="text-blob-tertiary mr-2" />
                  <p className="text-gray-400 pixel-text">
                    Share this code with a friend to battle
                  </p>
                </div>
              </>
            )}
            
            <div className="animate-pulse flex justify-center">
              <span className="inline-block w-3 h-3 bg-blob-primary rounded-full mx-1"></span>
              <span className="inline-block w-3 h-3 bg-blob-primary rounded-full mx-1 animate-delay-200"></span>
              <span className="inline-block w-3 h-3 bg-blob-primary rounded-full mx-1 animate-delay-400"></span>
            </div>
          </div>
          
          <button 
            onClick={() => { disconnect(); setBattleView('menu'); }}
            className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white rounded pixel-text"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  // Debug view for development
  if (battleView === 'debug') {
    return (
      <div className="absolute inset-0 z-50 bg-gradient-to-b from-gray-900 to-black">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white pixel-text">Debug Panel</h1>
          <button onClick={() => { setBattleView('menu'); }} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-black/50 rounded-lg border border-blob-tertiary/50 p-4">
            <h3 className="text-blob-secondary pixel-text mb-3">Connection Status</h3>
            <p className="text-sm text-white">WebSocket Status: <span className={connectionStatus === 'connected' ? "text-green-400" : connectionStatus === 'connecting' ? "text-yellow-400" : "text-red-400"}>{connectionStatus}</span></p>
            <p className="text-sm text-white">Current View: <span className="text-blue-400">{battleView}</span></p>
            <p className="text-sm text-white">Waiting for Opponent: <span className={isWaitingForOpponent ? "text-yellow-400" : "text-gray-400"}>{isWaitingForOpponent ? "Yes" : "No"}</span></p>
            <p className="text-sm text-white">Opponent Name: <span className="text-blue-400">{opponentName || 'None'}</span></p>
          </div>
          
          <div className="bg-black/50 rounded-lg border border-blob-tertiary/50 p-4">
            <h3 className="text-blob-secondary pixel-text mb-3">Server Messages</h3>
            <div className="max-h-60 overflow-y-auto bg-black p-2 rounded text-xs">
              {(!serverMessages || serverMessages.length === 0) ? (
                <p className="text-gray-500">No messages</p>
              ) : (
                <div className="space-y-1">
                  {serverMessages.map((msg, idx) => (
                    <div key={idx} className="border-b border-gray-800 pb-1">
                      <span className={`${msg.type === 'error' ? 'text-red-400' : 'text-blob-primary'}`}>
                        {msg.type}:
                      </span>
                      <span className="text-white ml-1 break-all">
                        {typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-black/50 rounded-lg border border-blob-tertiary/50 p-4">
            <h3 className="text-blob-secondary pixel-text mb-3">Test Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleQuickMatch}
                className="bg-blue-800 hover:bg-blue-700 text-white text-xs"
              >
                Start Matchmaking
              </Button>
              <Button
                onClick={disconnect}
                className="bg-gray-800 hover:bg-gray-700 text-white text-xs"
              >
                Disconnect
              </Button>
              <Button
                onClick={handleCreateBattle}
                className="bg-green-800 hover:bg-green-700 text-white text-xs"
              >
                Create Battle
              </Button>
              <Button
                onClick={() => {
                  // Access the WebSocket ref safely
                  const webSocketRef = (window as any).wsRef;
                  if (webSocketRef && webSocketRef.current) {
                    toast.success("WebSocket is connected", { className: "pixel-text" });
                  } else {
                    toast.error("WebSocket is not connected", { className: "pixel-text" });
                  }
                }}
                className="bg-purple-800 hover:bg-purple-700 text-white text-xs"
              >
                Check WebSocket
              </Button>
            </div>
          </div>
          
          <Button
            onClick={() => setBattleView('menu')}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white text-sm mt-4"
          >
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }
  
  // Main menu view
  return (
    <div className="absolute inset-0 z-50 bg-gradient-to-b from-gray-900 to-black">
      {/* Debug panel */}
      {process.env.NODE_ENV === 'development' && isDebugPanelOpen && (
        <div className="absolute inset-y-0 left-0 w-64 bg-black border-r border-gray-800 p-4 overflow-y-auto text-xs">
          <h3 className="text-white pixel-text mb-2">Debug Info</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-900 p-2 rounded">
              <p className="text-gray-400 pixel-text">Status</p>
              <p className={`pixel-text ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                {connectionStatus}
              </p>
            </div>
            <div className="bg-gray-900 p-2 rounded">
              <p className="text-gray-400 pixel-text">Queue</p>
              <p className="text-white pixel-text">{matchmakingQueue?.length || 0}</p>
            </div>
          </div>
          
          <h4 className="text-white pixel-text mb-1">Server Messages</h4>
          <div className="bg-gray-900 p-2 rounded mb-4 max-h-80 overflow-y-auto">
            {(!serverMessages || serverMessages.length === 0) ? (
              <p className="text-gray-500 pixel-text">No messages</p>
            ) : (
              serverMessages.map((msg, idx) => (
                <div key={idx} className="mb-1 border-b border-gray-800 pb-1">
                  <span className={`pixel-text ${msg.type === 'error' ? 'text-red-400' : 'text-blob-primary'}`}>
                    {msg.type}:
                  </span>
                  <span className="text-white pixel-text ml-1 break-all">
                    {typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white pixel-text">Battle Arena</h1>
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={() => setIsDebugPanelOpen(!isDebugPanelOpen)}
              className={cn(
                "ml-2 p-1 rounded",
                isDebugPanelOpen ? "bg-blob-primary text-black" : "bg-gray-800 text-gray-400"
              )}
            >
              <PanelLeft size={14} />
            </button>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto h-[calc(100%-4rem)]">
        <div className="w-full space-y-4">
          <Button 
            onClick={handleQuickMatch}
            className="w-full h-16 bg-blob-primary hover:bg-blob-primary/90 text-black font-bold"
          >
            <Globe className="mr-2" size={18} />
            <span className="pixel-text">Quick Match</span>
          </Button>
          
          <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
            <h3 className="text-white pixel-text mb-2">Create Private Battle</h3>
            <Button 
              onClick={handleCreateBattle}
              className="w-full bg-blob-secondary hover:bg-blob-secondary/90 text-white"
            >
              <span className="pixel-text">Create Battle Invite</span>
            </Button>
          </div>
          
          <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
            <h3 className="text-white pixel-text mb-2">Join Private Battle</h3>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter battle code"
                value={battleCode}
                onChange={(e) => setBattleCode(e.target.value.toUpperCase())}
                className="flex-1 bg-gray-900 border-gray-800 text-white pixel-text"
              />
              <Button 
                onClick={handleJoinBattle}
                disabled={!battleCode.trim()}
                className="bg-blob-tertiary hover:bg-blob-tertiary/90 text-white disabled:opacity-50"
              >
                <span className="pixel-text">Join</span>
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-gray-500'} mr-2`}></div>
            <span className="text-gray-400 text-sm pixel-text">
              {connectionStatus === 'connected' ? 'Connected to server' : 'Not connected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the wrapped component as default
export default BlobBattlegroundsWithProvider;
