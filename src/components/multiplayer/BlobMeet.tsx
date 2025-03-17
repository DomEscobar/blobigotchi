
import React, { useState, useEffect, useRef } from 'react';
import { Network, Users, MessageCircle, Gamepad } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BlobMood } from '@/components/Blob';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { useSounds } from '@/hooks/useSounds';

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'public' | 'friend' | null>(null);
  const [peers, setPeers] = useState<PeerData[]>([]);
  const [friendCode, setFriendCode] = useState('');
  const [localPosition, setLocalPosition] = useState({ x: 50, y: 50 });
  const [messages, setMessages] = useState<{text: string, sender: string}[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const dataChannelsRef = useRef<Record<string, RTCDataChannel>>({});
  const wsRef = useRef<WebSocket | null>(null);
  
  const { toast } = useToast();
  const { settings } = useSettings();
  const { playSoundEffect } = useSounds();
  
  // Generate a unique session ID for this user
  const localIdRef = useRef(`user_${Math.floor(Math.random() * 1000000)}`);
  
  // Play sound effect if enabled in settings
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

  // Handle connection to public lobby
  const connectToPublicLobby = () => {
    setConnectionType('public');
    setIsConnecting(true);
    initializeWebSocketConnection();
    playSound('connect');
    
    toast({
      title: "Connecting to Blob Network...",
      description: "Looking for other blobs to meet!",
    });
  };

  // Handle connection via friend code
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
    setIsConnecting(true);
    initializeWebSocketConnection(friendCode);
    playSound('connect');
    
    toast({
      title: "Connecting to friend...",
      description: `Trying to connect with code: ${friendCode}`,
    });
  };

  // Initialize WebSocket connection for signaling
  const initializeWebSocketConnection = (code?: string) => {
    // In a real implementation, this would connect to a WebSocket server
    // For the demo, we'll simulate the connection
    
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      
      // Simulate other peers joining
      const fakePeers: PeerData[] = [
        {
          id: 'user_123456',
          mood: 'happy',
          evolutionLevel: Math.floor(Math.random() * 3) + 5,
          x: 30,
          y: 70,
          username: 'CoolBlob42'
        },
        {
          id: 'user_789012',
          mood: 'normal',
          evolutionLevel: Math.floor(Math.random() * 3) + 4,
          x: 70,
          y: 30,
          username: 'BlobMaster99'
        }
      ];
      
      setPeers(fakePeers);
      playSound('success');
      
      toast({
        title: "Connected!",
        description: `${fakePeers.length} other blobs found in the arcade`,
      });
      
      // Simulate receiving a welcome message
      setTimeout(() => {
        setMessages([
          { 
            text: "Welcome to Blob Arcade! Use /dance, /feed, or /wave to interact.", 
            sender: "SYSTEM" 
          }
        ]);
        playSound('message');
      }, 1000);
    }, 3000);
  };

  // Cleanup connections on unmount
  useEffect(() => {
    return () => {
      // Close all peer connections
      Object.values(peerConnectionsRef.current).forEach(conn => {
        conn.close();
      });
      
      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handle sending a message or command
  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    
    // Handle slash commands
    if (currentMessage.startsWith('/')) {
      const command = currentMessage.split(' ')[0].substring(1);
      
      switch (command) {
        case 'dance':
          // Simulate sending dance action to peers
          setMessages(prev => [...prev, { text: "You started dancing!", sender: "SYSTEM" }]);
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              text: "CoolBlob42 is dancing with you!", 
              sender: "SYSTEM" 
            }]);
          }, 1000);
          break;
          
        case 'feed':
          const food = currentMessage.split(' ')[1] || 'snack';
          setMessages(prev => [...prev, { 
            text: `You offered a ${food} to everyone!`, 
            sender: "SYSTEM" 
          }]);
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              text: "BlobMaster99 enjoyed your " + food + "!", 
              sender: "SYSTEM" 
            }]);
          }, 1000);
          break;
          
        case 'wave':
          setMessages(prev => [...prev, { text: "You waved hello!", sender: "SYSTEM" }]);
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              text: "Everyone waves back at you!", 
              sender: "SYSTEM" 
            }]);
          }, 1000);
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
      
      // Simulate response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "Hello there! Nice blob you have!", 
          sender: "CoolBlob42" 
        }]);
        playSound('message');
      }, 1500);
    }
    
    playSound('message');
    setCurrentMessage('');
  };

  // Handle disconnect
  const handleDisconnect = () => {
    setIsConnected(false);
    setPeers([]);
    setMessages([]);
    playSound('disconnect');
    onClose();
    
    toast({
      title: "Disconnected",
      description: "You've left the Blob Arcade",
    });
  };

  // Render the loading/connecting screen
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
          Establishing P2P connections via BlobNet...
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          className="mt-6"
          onClick={() => {
            setIsConnecting(false);
            onClose();
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }

  // Render the connected arcade view
  if (isConnected) {
    return (
      <div className="absolute inset-0 bg-crt-background/95 z-50 flex flex-col">
        {/* Header with connection info */}
        <div className="bg-gray-900 p-2 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center">
            <Network className="w-4 h-4 text-green-500 mr-1" />
            <span className="pixel-text text-white text-xs">BLOB ARCADE</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 text-cyan-400 mr-1" />
            <span className="pixel-text text-white text-xs">{peers.length + 1} ONLINE</span>
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
        
        {/* Main arcade area */}
        <div className="flex-1 relative overflow-hidden" style={{ background: 'repeating-linear-gradient(0deg, #111 0px, #111 2px, #222 2px, #222 4px)' }}>
          {/* Arcade decoration elements */}
          <div className="absolute top-4 left-4 w-12 h-6 bg-pink-600 rounded-sm shadow-[0_0_8px_rgba(236,72,153,0.6)] flex items-center justify-center">
            <span className="text-white text-[8px]">GAMES</span>
          </div>
          
          <div className="absolute top-4 right-4 w-12 h-6 bg-cyan-600 rounded-sm shadow-[0_0_8px_rgba(8,145,178,0.6)] flex items-center justify-center">
            <span className="text-white text-[8px]">SHOP</span>
          </div>
          
          {/* Render local player */}
          <div 
            className="absolute w-12 h-12 transition-all duration-200"
            style={{ 
              left: `${localPosition.x}%`, 
              top: `${localPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-10 h-10 bg-blob-primary rounded-full flex items-center justify-center">
              <span className="text-[8px]">YOU</span>
            </div>
            <div className="text-white text-[8px] text-center mt-1">You</div>
          </div>
          
          {/* Render other players */}
          {peers.map((peer) => (
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
            </div>
          ))}
          
          {/* Mini-game zone */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-20 h-20 border-2 border-dashed border-yellow-400 rounded-full flex items-center justify-center">
            <Gamepad className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        {/* Chat/interaction panel */}
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

  // Render the initial connection screen
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
          <p>Your Blob must be at least level 4 to use all features</p>
          <p className="mt-1">Current Level: {evolutionLevel}</p>
        </div>
      </div>
    </div>
  );
};

export default BlobMeet;
