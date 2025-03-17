
import React, { useState, useEffect, useRef } from 'react';
import { Network, Users, MessageCircle, Gamepad } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BlobMood } from '@/components/Blob';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { useSounds } from '@/hooks/useSounds';
import useWebRTC from '@/hooks/useWebRTC';

interface BlobMeetProps {
  onClose: () => void;
  evolutionLevel: number;
  mood: BlobMood;
}

// Define the peer data interface
interface PeerData {
  id: string;
  mood: BlobMood;
  evolutionLevel: number;
  x: number;
  y: number;
  action?: string;
  username?: string;
}

const BlobMeet: React.FC<BlobMeetProps> = ({ onClose, evolutionLevel, mood }) => {
  const [connectionType, setConnectionType] = useState<'public' | 'friend' | null>(null);
  const [friendCode, setFriendCode] = useState('');
  const [localPosition, setLocalPosition] = useState({ x: 50, y: 50 });
  const [messages, setMessages] = useState<{text: string, sender: string}[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [peerPositions, setPeerPositions] = useState<Record<string, PeerData>>({});
  const [roomCode, setRoomCode] = useState<string>('');
  
  const localIdRef = useRef(`user_${Math.floor(Math.random() * 1000000)}`);
  const lastPositionUpdateRef = useRef(Date.now());
  const { toast } = useToast();
  const { settings } = useSettings();
  const { playSoundEffect } = useSounds();
  
  // WebRTC connection
  const {
    isConnected,
    isConnecting,
    peers,
    error,
    connect,
    disconnect,
    sendData, 
    sendDataToPeer
  } = useWebRTC({
    userId: localIdRef.current,
    roomId: roomCode,
    onPeerConnect: (peerId) => {
      playSound('connect');
      
      // Send my initial data to the new peer
      sendDataToPeer(peerId, {
        type: 'init',
        id: localIdRef.current,
        mood,
        evolutionLevel,
        x: localPosition.x,
        y: localPosition.y,
        username: settings.username || 'Anonymous Blob'
      });
      
      // Add system message
      setMessages(prev => [...prev, { 
        text: `${peerId.startsWith('sim_') ? 'A blob' : 'Someone'} joined`, 
        sender: "SYSTEM" 
      }]);
      
      toast({
        title: "New connection!",
        description: "Another blob has joined",
      });
    },
    onPeerDisconnect: (peerId) => {
      playSound('disconnect');
      
      // Remove peer from positions
      setPeerPositions(prev => {
        const newPositions = {...prev};
        delete newPositions[peerId];
        return newPositions;
      });
      
      // Add system message
      setMessages(prev => [...prev, { 
        text: `${peerPositions[peerId]?.username || 'Someone'} left`, 
        sender: "SYSTEM" 
      }]);
    },
    onPeerData: (peerId, data) => {
      handlePeerData(peerId, data);
    }
  });
  
  const playSound = (sound: 'connect' | 'disconnect' | 'message' | 'error' | 'success') => {
    if (settings.sound) {
      switch (sound) {
        case 'connect':
          playSoundEffect('play');
          break;
        case 'disconnect':
          playSoundEffect('rest');
          break;
        case 'message':
          playSoundEffect('click');
          break;
        case 'error':
          playSoundEffect('feed');
          break;
        case 'success':
          playSoundEffect('clean');
          break;
      }
    }
  };

  const handlePeerData = (peerId: string, data: any) => {
    if (!data || !data.type) return;
    
    switch (data.type) {
      case 'init':
        // Received initial peer data
        setPeerPositions(prev => ({
          ...prev,
          [peerId]: {
            id: peerId,
            mood: data.mood || 'normal',
            evolutionLevel: data.evolutionLevel || 1,
            x: data.x || 50,
            y: data.y || 50,
            username: data.username || 'Unknown Blob'
          }
        }));
        break;
        
      case 'position':
        // Update peer position
        setPeerPositions(prev => {
          if (!prev[peerId]) return prev;
          return {
            ...prev,
            [peerId]: {
              ...prev[peerId],
              x: data.x,
              y: data.y
            }
          };
        });
        break;
        
      case 'action':
        // Handle peer action (emote, etc)
        setPeerPositions(prev => {
          if (!prev[peerId]) return prev;
          return {
            ...prev,
            [peerId]: {
              ...prev[peerId],
              action: data.action
            }
          };
        });
        
        // Add to messages if it's a global action
        if (data.message) {
          setMessages(prev => [...prev, { 
            text: data.message, 
            sender: peerPositions[peerId]?.username || 'Unknown Blob' 
          }]);
          playSound('message');
        }
        break;
        
      case 'chat':
        // Handle chat message
        setMessages(prev => [...prev, { 
          text: data.text, 
          sender: peerPositions[peerId]?.username || 'Unknown Blob' 
        }]);
        playSound('message');
        break;
        
      case 'mood':
        // Update peer mood
        setPeerPositions(prev => {
          if (!prev[peerId]) return prev;
          return {
            ...prev,
            [peerId]: {
              ...prev[peerId],
              mood: data.mood
            }
          };
        });
        break;
    }
  };

  const connectToPublicLobby = () => {
    setConnectionType('public');
    const generatedRoomCode = Math.random().toString(36).substring(2, 7);
    setRoomCode(generatedRoomCode);
    
    toast({
      title: "Connecting to Blob Network...",
      description: "Looking for other blobs to meet!",
    });
    
    connect();
  };

  const connectViaFriendCode = () => {
    if (!friendCode.trim()) {
      toast({
        title: "Friend code required",
        description: "Please enter a valid friend code",
        variant: "destructive"
      });
      return;
    }
    
    setConnectionType('friend');
    setRoomCode(friendCode);
    
    toast({
      title: "Connecting to friend...",
      description: `Trying to connect with code: ${friendCode}`,
    });
    
    connect(friendCode);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isConnected) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    
    // Get coordinates (works for both mouse and touch)
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    
    // Calculate position as percentage of container
    const x = Math.max(0, Math.min(100, ((pageX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((pageY - rect.top) / rect.height) * 100));
    
    setLocalPosition({ x, y });
    
    // Don't spam position updates, throttle to every 100ms
    if (Date.now() - lastPositionUpdateRef.current > 100) {
      lastPositionUpdateRef.current = Date.now();
      
      // Send position update to all peers
      sendData({
        type: 'position',
        x,
        y
      });
    }
  };
  
  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    
    if (currentMessage.startsWith('/')) {
      const commandParts = currentMessage.split(' ');
      const command = commandParts[0].substring(1);
      
      switch (command) {
        case 'dance':
          setMessages(prev => [...prev, { text: "You started dancing!", sender: "SYSTEM" }]);
          
          // Send action to peers
          sendData({
            type: 'action',
            action: 'dance',
            message: `${settings.username || 'Someone'} is dancing!`
          });
          break;
          
        case 'feed':
          const food = commandParts[1] || 'snack';
          setMessages(prev => [...prev, { 
            text: `You offered a ${food} to everyone!`, 
            sender: "SYSTEM" 
          }]);
          
          // Send action to peers
          sendData({
            type: 'action',
            action: 'feed',
            foodType: food,
            message: `${settings.username || 'Someone'} offered you a ${food}!`
          });
          break;
          
        case 'wave':
          setMessages(prev => [...prev, { text: "You waved hello!", sender: "SYSTEM" }]);
          
          // Send action to peers
          sendData({
            type: 'action',
            action: 'wave',
            message: `${settings.username || 'Someone'} waved at everyone!`
          });
          break;
          
        default:
          setMessages(prev => [...prev, { 
            text: `Unknown command: ${command}`, 
            sender: "SYSTEM" 
          }]);
      }
    } else {
      // Regular chat message
      setMessages(prev => [...prev, { text: currentMessage, sender: "You" }]);
      
      // Send to all peers
      sendData({
        type: 'chat',
        text: currentMessage
      });
    }
    
    playSound('message');
    setCurrentMessage('');
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
    
    toast({
      title: "Disconnected",
      description: "You've left the Blob Arcade",
    });
  };

  // Effect to show welcome message when connected
  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        setMessages([
          { 
            text: connectionType === 'friend' 
              ? `You're in room: ${roomCode}. Share this code with friends!` 
              : "Welcome to Blob Arcade! Use /dance, /feed, or /wave to interact.", 
            sender: "SYSTEM" 
          }
        ]);
        playSound('message');
      }, 1000);
    }
  }, [isConnected, connectionType, roomCode]);
  
  // Cleanup connections on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  if (isConnecting) {
    return (
      <div className="absolute inset-0 bg-crt-background/95 z-50 flex flex-col items-center justify-center">
        <div className="pixel-text text-xl text-cyan-400 mb-4 animate-pulse">CONNECTING...</div>
        <div className="flex space-x-2 mb-6">
          <div className="w-3 h-3 bg-blob-tertiary animate-pulse"></div>
          <div className="w-3 h-3 bg-blob-secondary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blob-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <div className="pixel-text text-xs text-gray-400 max-w-xs text-center">
          {error ? `Error: ${error}` : 'Establishing P2P connections via BlobNet...'}
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          className="mt-6"
          onClick={() => {
            disconnect();
            onClose();
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (isConnected) {
    const allPeers = Object.values(peerPositions);
    
    return (
      <div className="absolute inset-0 bg-crt-background/95 z-50 flex flex-col">
        <div className="bg-gray-900 p-2 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center">
            <Network className="w-4 h-4 text-green-500 mr-1" />
            <span className="pixel-text text-white text-xs">BLOB ARCADE</span>
            {connectionType === 'friend' && (
              <span className="pixel-text text-xs text-cyan-400 ml-2">ROOM: {roomCode}</span>
            )}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 text-cyan-400 mr-1" />
            <span className="pixel-text text-white text-xs">{allPeers.length + 1} ONLINE</span>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDisconnect}
            className="pixel-text text-xs h-6 px-2 py-0"
          >
            DISCONNECT
          </Button>
        </div>
        
        <div 
          className="flex-1 relative overflow-hidden cursor-pointer touch-none" 
          style={{ background: 'repeating-linear-gradient(0deg, #111 0px, #111 2px, #222 2px, #222 4px)' }}
          onMouseMove={handleDragMove}
          onTouchMove={handleDragMove}
        >
          <div className="absolute top-4 left-4 w-12 h-6 bg-pink-600 rounded-sm shadow-[0_0_8px_rgba(236,72,153,0.6)] flex items-center justify-center">
            <span className="text-white text-[8px]">GAMES</span>
          </div>
          
          <div className="absolute top-4 right-4 w-12 h-6 bg-cyan-600 rounded-sm shadow-[0_0_8px_rgba(8,145,178,0.6)] flex items-center justify-center">
            <span className="text-white text-[8px]">SHOP</span>
          </div>
          
          {/* Local blob */}
          <div className="absolute w-12 h-12 transition-all duration-200"
            style={{ 
              left: `${localPosition.x}%`, 
              top: `${localPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              mood === 'happy' ? 'bg-blob-happy' :
              mood === 'sad' ? 'bg-blob-sad' :
              mood === 'hungry' ? 'bg-blob-hungry' :
              'bg-blob-primary'
            )}>
              <span className="text-[8px]">YOU</span>
            </div>
            <div className="text-white text-[8px] text-center mt-1">
              {settings.username || 'You'}
            </div>
          </div>
          
          {/* Remote peer blobs */}
          {allPeers.map((peer) => (
            <div 
              key={peer.id}
              className="absolute w-12 h-12 transition-all duration-200"
              style={{ 
                left: `${peer.x}%`, 
                top: `${peer.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  peer.mood === 'happy' ? 'bg-blob-happy' :
                  peer.mood === 'sad' ? 'bg-blob-sad' :
                  peer.mood === 'hungry' ? 'bg-blob-hungry' :
                  'bg-blob-primary'
                )}
              >
                <span className="text-[8px]">{peer.username?.charAt(0) || '?'}</span>
              </div>
              <div className="text-white text-[8px] text-center mt-1">{peer.username}</div>
              
              {/* Action indicator */}
              {peer.action && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-white text-center">
                  {peer.action === 'dance' && '💃'}
                  {peer.action === 'wave' && '👋'}
                  {peer.action === 'feed' && '🍔'}
                </div>
              )}
            </div>
          ))}
          
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-20 h-20 border-2 border-dashed border-yellow-400 rounded-full flex items-center justify-center">
            <Gamepad className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="h-1/3 bg-gray-900 border-t border-gray-700 p-2 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-2 bg-gray-950 rounded p-2">
            {messages.map((msg, i) => (
              <div key={i} className="mb-1">
                <span className={cn(
                  "text-xs font-bold",
                  msg.sender === "SYSTEM" ? "text-yellow-400" :
                  msg.sender === "You" ? "text-cyan-400" : "text-green-400"
                )}>
                  {msg.sender}:
                </span>
                <span className="text-xs text-white ml-1">{msg.text}</span>
              </div>
            ))}
          </div>
          
          <div className="flex">
            <input
              type="text"
              className="flex-1 bg-gray-800 text-white text-xs rounded-l p-2 outline-none"
              placeholder="Type a message or /command"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              className="bg-blob-tertiary text-white px-2 rounded-r"
              onClick={sendMessage}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-1 text-gray-400 text-[8px]">
            Try: /dance, /feed pizza, /wave
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-crt-background/95 z-50 flex flex-col">
      <div className="bg-gray-900 p-2 flex justify-between items-center border-b border-gray-700">
        <div className="pixel-text text-white">BLOBNET TERMINAL</div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 py-0"
          onClick={onClose}
        >
          X
        </Button>
      </div>
      
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-blob-tertiary mb-2">Blob Meet</h2>
          <p className="text-gray-300 text-sm max-w-xs">
            Connect with other blobs in real-time! 
            Interact, play mini-games, and make new friends.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
          <Button 
            variant="outline" 
            className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-950/30"
            onClick={connectToPublicLobby}
          >
            <Network className="mr-2" /> 
            Public Lobby
          </Button>
          
          <div className="relative">
            <Button 
              variant="outline"
              className="border-2 border-purple-500 text-purple-400 w-full hover:bg-purple-950/30"
              onClick={connectViaFriendCode}
            >
              <Users className="mr-2" /> 
              Connect with Friend Code
            </Button>
            
            <div className="mt-2 flex">
              <input
                type="text"
                className="flex-1 bg-gray-800 text-white p-2 text-sm rounded-l border border-gray-700 focus:border-purple-500 outline-none"
                placeholder="Enter friend code"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && connectViaFriendCode()}
              />
              <button 
                className="bg-purple-600 text-white px-3 rounded-r"
                onClick={connectViaFriendCode}
              >
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-gray-500 text-xs text-center">
          <p>Connect and play with other blobs online!</p>
          <p className="mt-1">Your Evolution Level: {evolutionLevel}</p>
          {error && (
            <p className="mt-2 text-red-500">Error: {error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlobMeet;
