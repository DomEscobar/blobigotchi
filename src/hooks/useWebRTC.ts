import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from './useSettings';
import { toast } from "sonner";

// Types for our WebRTC implementation
type PeerConnection = RTCPeerConnection | null;
type DataChannel = RTCDataChannel | null;
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
type MessageType = 'chat' | 'battle-action' | 'system' | 'ping';

interface WebRTCMessage {
  type: MessageType;
  data: any;
  sender: string;
  timestamp: number;
}

interface BattleMoveAction {
  move: string;
  seed: number;
}

interface BattleState {
  playerHP: number;
  opponentHP: number;
  playerStatus: string[];
  opponentStatus: string[];
  turn: 'player' | 'opponent';
  round: number;
  lastMove?: string;
  lastDamage?: number;
}

export function useWebRTC() {
  const { settings } = useSettings();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<WebRTCMessage[]>([]);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [connectionCode, setConnectionCode] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  const peerConnectionRef = useRef<PeerConnection>(null);
  const dataChannelRef = useRef<DataChannel>(null);
  
  // Cleanup function to properly close connections
  const disconnect = useCallback(() => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setConnectionStatus('disconnected');
    setOpponentName(null);
    setConnectionCode(null);
    setIsWaitingForOpponent(false);
    setBattleState(null);
    
    // Notify user
    toast("Disconnected from battle", {
      description: "The connection has been closed",
      className: "pixel-text bg-crt-background text-white"
    });
  }, []);

  // Set up a timeout to automatically disconnect if no activity
  useEffect(() => {
    let pingInterval: NodeJS.Timeout | null = null;
    
    if (connectionStatus === 'connected' && dataChannelRef.current) {
      // Send ping every 10 seconds to keep connection alive
      pingInterval = setInterval(() => {
        sendMessage('ping', 'ping');
      }, 10000);
    }
    
    return () => {
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [connectionStatus]);

  // Function to send a message through the data channel
  const sendMessage = useCallback((type: MessageType, data: any) => {
    if (connectionStatus !== 'connected' && !isSimulationMode) {
      console.warn('Cannot send message: not connected');
      return false;
    }

    const message: WebRTCMessage = {
      type,
      data,
      sender: settings.username || 'Anonymous Blob',
      timestamp: Date.now()
    };

    try {
      if (isSimulationMode) {
        // In simulation mode, we'll just handle the message locally
        setMessages(prev => [...prev, message]);
        
        // Simulate opponent responses after a delay
        if (type === 'battle-action') {
          simulateOpponentResponse(data);
        }
      } else if (dataChannelRef.current) {
        dataChannelRef.current.send(JSON.stringify(message));
        setMessages(prev => [...prev, message]);
      }
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message", {
        description: "There was an error communicating with your opponent",
        className: "pixel-text bg-crt-background text-white"
      });
      return false;
    }
  }, [connectionStatus, settings.username, isSimulationMode]);

  // Function to handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebRTCMessage = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
      
      if (message.type === 'battle-action') {
        handleBattleAction(message.data, false);
      } else if (message.type === 'system' && message.data === 'ready-for-battle') {
        initBattleState();
        // Set opponent name from the message sender
        setOpponentName(message.sender);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }, []);

  // Initialize WebRTC connection as the initiator (creates offer)
  const createBattleInvite = useCallback(async () => {
    try {
      if (connectionStatus !== 'disconnected') {
        disconnect();
      }

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      peerConnectionRef.current = peerConnection;
      
      const dataChannel = peerConnection.createDataChannel('battleChannel');
      dataChannelRef.current = dataChannel;
      
      dataChannel.onopen = () => {
        setConnectionStatus('connected');
        sendMessage('system', 'ready-for-battle');
        initBattleState();
      };
      
      dataChannel.onclose = () => disconnect();
      dataChannel.onerror = (error) => console.error('Data channel error:', error);
      dataChannel.onmessage = handleMessage;
      
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In a full implementation, send this candidate to signaling server
          console.log('New ICE candidate:', event.candidate);
        } else {
          // ICE gathering completed, generate connection code
          generateConnectionCode(peerConnection);
        }
      };
      
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      setConnectionStatus('connecting');
      setIsWaitingForOpponent(true);
      
      toast("Creating battle invitation", {
        description: "A connection code will be generated shortly...",
        className: "pixel-text bg-crt-background text-white"
      });
      
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error("Failed to create battle invitation", {
        description: "Please try again later",
        className: "pixel-text bg-crt-background text-white"
      });
      disconnect();
    }
  }, [connectionStatus, disconnect, handleMessage]);

  // Join an existing battle using a connection code
  const joinBattleWithCode = useCallback(async (code: string) => {
    try {
      if (connectionStatus !== 'disconnected') {
        disconnect();
      }
      
      // Decode the connection code to get the offer
      const { offer } = decodeConnectionCode(code);
      
      if (!offer) {
        throw new Error('Invalid connection code');
      }
      
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      peerConnectionRef.current = peerConnection;
      
      peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannelRef.current = dataChannel;
        
        dataChannel.onopen = () => {
          setConnectionStatus('connected');
          sendMessage('system', 'ready-for-battle');
          toast("Connected to battle!", {
            description: "Get ready to fight!",
            className: "pixel-text bg-crt-background text-white"
          });
        };
        
        dataChannel.onclose = () => disconnect();
        dataChannel.onerror = (error) => console.error('Data channel error:', error);
        dataChannel.onmessage = handleMessage;
      };
      
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In a full implementation, send candidates through signaling server
          console.log('New ICE candidate:', event.candidate);
        }
      };
      
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      setConnectionStatus('connecting');
      
      // In a real implementation, we would send this answer back through signaling
      // For now, we'll just log it
      console.log('Answer created:', answer);
      
      toast("Joining battle", {
        description: "Connecting to opponent...",
        className: "pixel-text bg-crt-background text-white"
      });
      
    } catch (error) {
      console.error('Error joining battle:', error);
      toast.error("Failed to join battle", {
        description: "Invalid code or connection failed",
        className: "pixel-text bg-crt-background text-white"
      });
      disconnect();
    }
  }, [connectionStatus, disconnect, handleMessage]);

  // Start a simulated battle against AI
  const startSimulatedBattle = useCallback(() => {
    setIsSimulationMode(true);
    setConnectionStatus('connected');
    setOpponentName('Pixel Bot');
    initBattleState();
    
    toast("Starting practice battle", {
      description: "You're now in simulation mode against an AI opponent",
      className: "pixel-text bg-crt-background text-white"
    });
  }, []);

  // Generate a shareable connection code from SDP
  const generateConnectionCode = (peerConnection: RTCPeerConnection) => {
    if (peerConnection.localDescription) {
      // In a real implementation, we would use a signaling server
      // For this demo, we'll just encode the SDP as a connection code
      const code = btoa(JSON.stringify({
        offer: peerConnection.localDescription
      }));
      
      // Truncate and format for readability
      const formattedCode = code.substring(0, 16);
      setConnectionCode(formattedCode);
      
      toast("Battle invitation created!", {
        description: "Share your code with a friend to battle",
        className: "pixel-text bg-crt-background text-white"
      });
    }
  };

  // Decode a connection code back to SDP
  const decodeConnectionCode = (code: string) => {
    try {
      return JSON.parse(atob(code));
    } catch {
      return { offer: null };
    }
  };

  // Initialize the battle state
  const initBattleState = () => {
    const initialHP = 100;
    
    setBattleState({
      playerHP: initialHP,
      opponentHP: initialHP,
      playerStatus: [],
      opponentStatus: [],
      turn: Math.random() < 0.5 ? 'player' : 'opponent',
      round: 1
    });
    
    toast("Battle started!", {
      description: "May the best blob win!",
      className: "pixel-text bg-crt-background text-white"
    });
    
    // If it's the opponent's turn in simulation mode, make them move
    if (isSimulationMode) {
      simulateOpponentTurn();
    }
  };

  // Calculate damage based on move and seed
  const calculateDamage = (move: string, seed: number): number => {
    // Simple deterministic formula based on move and seed
    const moveHash = move.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 5 + ((moveHash * seed) % 20);
  };

  // Handle a battle action from either player or opponent
  const handleBattleAction = (action: BattleMoveAction, isPlayer: boolean) => {
    setBattleState(prev => {
      if (!prev) return null;
      
      const damage = calculateDamage(action.move, action.seed);
      const newState = { ...prev };
      
      if (isPlayer) {
        // Player attacking opponent
        newState.opponentHP = Math.max(0, prev.opponentHP - damage);
        newState.lastMove = action.move;
        newState.lastDamage = damage;
        newState.turn = 'opponent';
      } else {
        // Opponent attacking player
        newState.playerHP = Math.max(0, prev.playerHP - damage);
        newState.lastMove = action.move;
        newState.lastDamage = damage;
        newState.turn = 'player';
      }
      
      newState.round += 1;
      
      // Check for victory
      if (newState.opponentHP <= 0 || newState.playerHP <= 0) {
        const winner = newState.opponentHP <= 0 ? 'player' : 'opponent';
        
        toast(winner === 'player' ? "Victory!" : "Defeated!", {
          description: winner === 'player' 
            ? "Your blob has triumphed!" 
            : "Your blob has been defeated!",
          className: `pixel-text bg-crt-background ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`
        });
        
        // In a full implementation, we would handle rewards here
        setTimeout(() => {
          disconnect();
        }, 3000);
      } else if (isSimulationMode && newState.turn === 'opponent') {
        // If in simulation mode and it's the opponent's turn, simulate their move
        simulateOpponentTurn();
      }
      
      return newState;
    });
  };

  // Simulate an opponent's response in simulation mode
  const simulateOpponentResponse = (playerAction: BattleMoveAction) => {
    // Process the player's action first
    handleBattleAction(playerAction, true);
  };

  // Simulate an opponent's turn in simulation mode
  const simulateOpponentTurn = () => {
    setTimeout(() => {
      const moves = ['Pixel Punch', 'Blob Beam', 'Digital Dash', 'Static Slam'];
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      const randomSeed = Math.floor(Math.random() * 1000);
      
      const opponentAction: BattleMoveAction = {
        move: randomMove,
        seed: randomSeed
      };
      
      // Add a simulated message from the opponent
      setMessages(prev => [...prev, {
        type: 'battle-action',
        data: opponentAction,
        sender: 'Pixel Bot',
        timestamp: Date.now()
      }]);
      
      // Process the opponent's action
      handleBattleAction(opponentAction, false);
    }, 1500);
  };

  // Execute a battle move
  const executeMove = useCallback((moveName: string) => {
    if (!battleState || battleState.turn !== 'player') {
      toast("Not your turn", {
        description: "Wait for your opponent to make a move",
        className: "pixel-text bg-crt-background text-white"
      });
      return false;
    }
    
    // Create a deterministic seed based on both players and time
    const seed = Math.floor(Date.now() % 1000);
    
    const moveAction: BattleMoveAction = {
      move: moveName,
      seed
    };
    
    // Send the move to the opponent
    const success = sendMessage('battle-action', moveAction);
    
    if (success) {
      // Process the move locally as well
      handleBattleAction(moveAction, true);
      return true;
    }
    
    return false;
  }, [battleState, sendMessage]);

  return {
    connectionStatus,
    isWaitingForOpponent,
    connectionCode,
    opponentName,
    battleState,
    messages,
    createBattleInvite,
    joinBattleWithCode,
    startSimulatedBattle,
    sendMessage,
    executeMove,
    disconnect
  };
}
