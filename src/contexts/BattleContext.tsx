import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { getAttackById } from '@/data/attacks';
import attacks from '@/data/attacks';
import { BlobType } from '@/hooks/useBlobAppearance';

// Types for our WebSocket battle implementation
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
export type MessageType = 'chat' | 'battle-action' | 'system' | 'ping' | 'error' | 'battleCode';
export type BattleView = 'menu' | 'lobby' | 'battle' | 'leaderboard' | 'matchmaking' | 'debug';

interface BattleMessage {
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
  lastEffectiveness?: 'super' | 'normal' | 'weak' | 'immune';
  gameOver?: boolean;
  winner?: 'player' | 'opponent';
  opponentType?: string; // The blob type of the opponent
  opponentAppearance?: {
    type: BlobType;
    eyes: any;
    mouth: any;
    attack: string;
    selectedAttacks: string[];
  };
}

// Server URL - should be configured based on environment
const SERVER_URL = 'https://plot-production-b63b.up.railway.app';

// Generate stable user ID
function generateUserId() {
  if (typeof window === 'undefined') return `user_${Date.now()}`;
  
  try {
    const storedId = localStorage.getItem('blobBattleUserId');
    if (storedId) {
      console.log('Using existing user ID:', storedId);
      return storedId;
    }
    
    const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log('Created new user ID:', newId);
    localStorage.setItem('blobBattleUserId', newId);
    return newId;
  } catch (e) {
    console.error('Error accessing localStorage for user ID:', e);
    return `user_${Date.now()}`;
  }
}

// Context type definition
interface BattleContextType {
  // State
  connectionStatus: ConnectionStatus;
  battleView: BattleView;
  isWaitingForOpponent: boolean;
  connectionCode: string | null;
  opponentName: string | null;
  battleState: BattleState | null;
  messages: BattleMessage[];
  matchmakingQueue: any[];
  serverMessages: BattleMessage[];
  opponentAppearance: any | null;
  opponentEvolutionLevel: number;
  
  // Actions
  startMatchmaking: () => void;
  createBattleInvite: () => Promise<void>;
  joinBattleWithCode: (code: string) => void;
  startSimulatedBattle: () => void;
  executeMove: (moveName: string) => boolean;
  disconnect: () => void;
  setBattleView: (view: BattleView) => void;
}

// Create the context with a default value
const BattleContext = createContext<BattleContextType | undefined>(undefined);

// Provider component
export const BattleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  
  // State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [battleView, setBattleView] = useState<BattleView>('menu');
  const [messages, setMessages] = useState<BattleMessage[]>([]);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [connectionCode, setConnectionCode] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [matchmakingQueue, setMatchmakingQueue] = useState<any[]>([]);
  const [opponentAppearance, setOpponentAppearance] = useState<any | null>(null);
  const [opponentEvolutionLevel, setOpponentEvolutionLevel] = useState<number>(1);
  
  // Refs for values that shouldn't trigger re-renders
  const socketRef = useRef<Socket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const matchmakingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string>(generateUserId());
  const isCleanedUpRef = useRef(false);
  const isConnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const battleRoomRef = useRef<string | null>(null);
  const handleBattleActionRef = useRef<((action: BattleMoveAction, isPlayer: boolean) => void) | null>(null);
  const simulateOpponentMoveRef = useRef<(() => void) | null>(null);
  const initBattleStateRef = useRef<(() => void) | null>(null);
  
  // Make the socket globally accessible for debugging
  if (typeof window !== 'undefined') {
    (window as any).socketRef = socketRef;
  }
  
  // Log state changes
  useEffect(() => {
    console.log(`Connection status changed to: ${connectionStatus}`);
  }, [connectionStatus]);
  
  useEffect(() => {
    console.log(`Battle view changed to: ${battleView}`);
  }, [battleView]);
  
  // Function to establish socket.io connection
  const connectToServer = useCallback((): Promise<boolean> => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log('Already attempting to connect, ignoring additional request');
      return Promise.resolve(false);
    }
    
    // If already connected, resolve immediately
    if (socketRef.current && socketRef.current.connected) {
      console.log('Already connected to server');
      return Promise.resolve(true);
    }
    
    return new Promise((resolve) => {
      isConnectingRef.current = true;
      
      try {
        console.log('Connecting to game server:', SERVER_URL);
        console.log('Using user ID:', userIdRef.current);
        
        // Initialize Socket.IO with auto-reconnect enabled
        const socket = io(SERVER_URL, {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 5000
        });
        
        socketRef.current = socket;
        
        // Set up event handlers
        socket.on('connect', () => {
          console.log('Socket.IO connection established');
          setConnectionStatus('connected');
          isConnectingRef.current = false;
          resolve(true);
        });
        
        socket.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          isConnectingRef.current = false;
          
          toast.error("Connection error", {
            description: "There was a problem connecting to the game server",
            className: "pixel-text"
          });
          
          resolve(false);
        });
        
        socket.on('disconnect', (reason) => {
          console.log('Socket.IO disconnected:', reason);
          setConnectionStatus('disconnected');
          
          // If we're in a battle or matchmaking, handle the disconnection
          if (connectionStatus === 'connected' || isWaitingForOpponent) {
            toast.error("Connection to server lost", {
              description: "The server connection was closed",
              className: "pixel-text"
            });
          }
        });
        
        // Server message handlers
        socket.on('CONNECTED', () => {
          console.log('Received connection confirmation from server');
        });
        
        socket.on('QUEUE_UPDATE', (data) => {
          console.log('Queue updated, players in queue:', data.queue.length);
          setMatchmakingQueue(data.queue || []);
        });
        
        socket.on('MATCH_FOUND', (data) => {

          console.log('Match found', data);

          setIsWaitingForOpponent(false);
          setOpponentName(data.opponentName);
          battleRoomRef.current = data.battleId;
          setConnectionStatus('connected');
          setBattleView('battle');
          
          // Set opponent appearance and evolution level
          if (data.opponentAppearance) {
            console.log('Opponent appearance:', data.opponentAppearance);
            setOpponentAppearance(data.opponentAppearance);
          }
          
          if (data.opponentEvolutionLevel) {
            setOpponentEvolutionLevel(data.opponentEvolutionLevel);
          }
          
          toast.success("Opponent found!", {
            description: `Connected to ${data.opponentName}`,
            className: "pixel-text"
          });
          
          // Initialize battle state using the ref
          if (initBattleStateRef.current) {
            initBattleStateRef.current();
          }
        });
        
        socket.on('BATTLE_MESSAGE', (data) => {
          const battleMessage: BattleMessage = data.message;
          setMessages(prev => [...prev, battleMessage]);
          
          // Process battle actions
          if (battleMessage.type === 'battle-action') {
            handleBattleAction(battleMessage.data, false);
          }
        });
        
        socket.on('OPPONENT_DISCONNECTED', () => {
          toast.error("Opponent disconnected", {
            description: "Your opponent has left the battle",
            className: "pixel-text"
          });
          
          // End the battle with a victory
          setBattleState(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              gameOver: true,
              winner: 'player'
            };
          });
          
          // Disconnect after a delay
          setTimeout(() => {
            disconnect();
          }, 3000);
        });
        
        socket.on('BATTLE_CODE_GENERATED', (data) => {
          setConnectionCode(data.code);
          
          toast("Battle invitation created!", {
            description: "Share your code with a friend to battle",
            className: "pixel-text"
          });
        });
        
        socket.on('ERROR', (data) => {
          console.error('Server error:', data.error);
          
          toast.error("Server error", {
            description: data.error,
            className: "pixel-text"
          });
        });
        
        socket.on('PONG', () => {
          // Just for debugging
          console.log('Received pong from server');
        });
        
      } catch (error) {
        console.error('Error connecting to server:', error);
        isConnectingRef.current = false;
        
        toast.error("Connection failed", {
          description: "Could not connect to the game server",
          className: "pixel-text"
        });
        
        resolve(false);
      }
    });
  }, [connectionStatus, isWaitingForOpponent]);
  
  // Calculate damage based on move, seed, and type effectiveness
  const calculateDamage = useCallback((move: string, seed: number, attackType?: string, defenderType?: string): { damage: number; effectiveness?: 'super' | 'normal' | 'weak' | 'immune' } => {
    // Default damage calculation (simple deterministic formula based on move and seed)
    const moveHash = move.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let baseDamage = 5 + ((moveHash * seed) % 20);
    let effectiveness: 'super' | 'normal' | 'weak' | 'immune' = 'normal';
    
    // Apply type effectiveness if we have type information
    if (attackType && defenderType) {
      // Type effectiveness matrix
      const typeEffectiveness: Record<string, { strong: string[], weak: string[], immune: string[] }> = {
        'fire': { 
          strong: ['grass', 'ice'], 
          weak: ['water', 'rock'], 
          immune: [] 
        },
        'water': { 
          strong: ['fire', 'ground', 'rock'], 
          weak: ['grass', 'electric'], 
          immune: [] 
        },
        'electric': { 
          strong: ['water'], 
          weak: ['ground', 'grass'], 
          immune: [] 
        },
        'grass': { 
          strong: ['water', 'ground', 'rock'], 
          weak: ['fire', 'ice', 'poison', 'flying'], 
          immune: [] 
        },
        'ice': { 
          strong: ['grass', 'ground'], 
          weak: ['fire', 'fighting'], 
          immune: [] 
        },
        'fighting': { 
          strong: ['normal', 'ice', 'rock'], 
          weak: ['psychic', 'flying'], 
          immune: ['ghost'] 
        },
        'poison': { 
          strong: ['grass'], 
          weak: ['ground', 'psychic'], 
          immune: [] 
        },
        'ground': { 
          strong: ['fire', 'electric', 'poison', 'rock'], 
          weak: ['water', 'grass', 'ice'], 
          immune: ['electric'] 
        },
        'rock': { 
          strong: ['fire', 'ice', 'flying'], 
          weak: ['water', 'grass', 'fighting', 'ground'], 
          immune: [] 
        },
        'psychic': { 
          strong: ['fighting', 'poison'], 
          weak: ['bug', 'ghost'], 
          immune: [] 
        },
        'ghost': { 
          strong: ['psychic', 'ghost'], 
          weak: ['ghost'], 
          immune: ['normal', 'fighting'] 
        },
        'normal': { 
          strong: [], 
          weak: ['fighting'], 
          immune: ['ghost'] 
        }
      };
      
      // Get the effectiveness data for this attack type
      const attackEffectiveness = typeEffectiveness[attackType];
      if (attackEffectiveness) {
        if (attackEffectiveness.strong.includes(defenderType)) {
          // Super effective: 1.5x damage
          baseDamage = Math.floor(baseDamage * 1.5);
          effectiveness = 'super';
        } else if (attackEffectiveness.weak.includes(defenderType)) {
          // Not very effective: 0.5x damage
          baseDamage = Math.floor(baseDamage * 0.5);
          effectiveness = 'weak';
        } else if (attackEffectiveness.immune.includes(defenderType)) {
          // Immune: no damage
          baseDamage = 0;
          effectiveness = 'immune';
        }
      }
    }
    
    return { damage: baseDamage, effectiveness };
  }, []);
  
  // Initialize the battle state
  const initBattleState = useCallback(() => {
    const initialHP = 100;
    
    // Generate a complete random opponent appearance
    const blobTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'psychic'];
    const eyeTypes = ['default', 'round', 'oval', 'star', 'heart', 'square', 'sleepy', 'angry', 'cute', 'pixel'];
    const mouthTypes = ['default', 'wide', 'small', 'kawaii', 'surprised', 'cool', 'wide', 'smirk', 'sad', 'tongue', 'pixel'];
    
    const randomOpponentType = blobTypes[Math.floor(Math.random() * blobTypes.length)];
    const randomOpponentEyes = eyeTypes[Math.floor(Math.random() * eyeTypes.length)];
    const randomOpponentMouth = mouthTypes[Math.floor(Math.random() * mouthTypes.length)];
    
    // Get type-appropriate attacks for the opponent
    let opponentAttacks: string[] = [];
    if (randomOpponentType) {
      const typeAttacks = attacks.filter(attack => attack.type === randomOpponentType);
      if (typeAttacks.length > 0) {
        // Get 1-2 type-specific attacks
        const numTypeAttacks = Math.min(2, typeAttacks.length);
        for (let i = 0; i < numTypeAttacks; i++) {
          const randomIndex = Math.floor(Math.random() * typeAttacks.length);
          opponentAttacks.push(typeAttacks[randomIndex].id);
          typeAttacks.splice(randomIndex, 1); // Remove chosen attack
        }
      }
      
      // Add 1-2 random attacks from other types
      const otherAttacks = attacks.filter(attack => attack.type !== randomOpponentType);
      const numOtherAttacks = Math.min(4 - opponentAttacks.length, 2, otherAttacks.length);
      for (let i = 0; i < numOtherAttacks; i++) {
        const randomIndex = Math.floor(Math.random() * otherAttacks.length);
        opponentAttacks.push(otherAttacks[randomIndex].id);
        otherAttacks.splice(randomIndex, 1); // Remove chosen attack
      }
    }
    
    setBattleState({
      playerHP: initialHP,
      opponentHP: initialHP,
      playerStatus: [],
      opponentStatus: [],
      turn: Math.random() < 0.5 ? 'player' : 'opponent',
      round: 1,
      opponentType: randomOpponentType,
      opponentAppearance: {
        type: randomOpponentType as BlobType,
        eyes: randomOpponentEyes as any, // Cast to match expected type
        mouth: randomOpponentMouth as any, // Cast to match expected type
        attack: opponentAttacks[0] as any, // Primary attack
        selectedAttacks: opponentAttacks
      }
    });
    
    toast.success("Battle started!", {
      description: "May the best blob win!",
      className: "pixel-text"
    });
    
    // If it's the opponent's turn in simulation mode, make them move
    if (isSimulationMode && simulateOpponentMoveRef.current) {
      simulateOpponentMoveRef.current();
    }
  }, [isSimulationMode]);
  
  // Clean up connections and state
  const disconnect = useCallback(() => {
    console.log('Disconnecting from battle');
    
    try {
      // If we have an active socket and we're in a battle, send a leave message
      if (socketRef.current && battleRoomRef.current) {
        socketRef.current.emit('message', {
          type: 'LEAVE_BATTLE',
          battleId: battleRoomRef.current,
          userId: userIdRef.current
        });
      }
      
      // If we're in the matchmaking queue, leave it
      if (socketRef.current && isWaitingForOpponent) {
        socketRef.current.emit('message', {
          type: 'LEAVE_QUEUE',
          userId: userIdRef.current
        });
      }
      
      // Clear intervals
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      if (matchmakingIntervalRef.current) {
        clearInterval(matchmakingIntervalRef.current);
        matchmakingIntervalRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Reset state
      setIsSimulationMode(false);
      setConnectionStatus('disconnected');
      setOpponentName(null);
      setConnectionCode(null);
      setIsWaitingForOpponent(false);
      setBattleState(null);
      battleRoomRef.current = null;
      
      // Only show toast if we were previously in a battle
      if (connectionStatus === 'connected') {
        toast("Disconnected from battle", {
          description: "The connection has been closed",
          className: "pixel-text"
        });
      }
      
      // Don't actually disconnect the socket unless we're cleaning up completely
      // Socket.IO will handle reconnections automatically
      
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }, [connectionStatus, isWaitingForOpponent]);
  
  // Simulate an opponent's move in simulation mode
  const simulateOpponentMove = useCallback(() => {
    if (!isSimulationMode) return;
    
    setTimeout(() => {
      // Use opponent's available attacks if they exist
      let availableAttacks: string[] = [];
      
      if (battleState?.opponentAppearance?.selectedAttacks?.length) {
        availableAttacks = battleState.opponentAppearance.selectedAttacks;
      } else {
        // Fallback to default attacks
        availableAttacks = ['Pixel Punch', 'Blob Beam', 'Digital Dash', 'Static Slam'];
      }
      
      const randomMove = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
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
      
      // Process the opponent's action using the ref
      if (handleBattleActionRef.current) {
        handleBattleActionRef.current(opponentAction, false);
      }
    }, 1500);
  }, [isSimulationMode, battleState]);
  
  // Handle a battle action from either player or opponent
  const handleBattleAction = useCallback((action: BattleMoveAction, isPlayer: boolean) => {
    setBattleState(prev => {
      if (!prev) return null;
      
      // Get attack type if available
      const attack = getAttackById(action.move);
      const attackType = attack?.type || 'normal';
      
      // Get defender type based on who is attacking
      const defenderType = isPlayer 
        ? (prev.opponentType || 'normal') // Player attacking opponent
        : (window && localStorage.getItem('blobAppearance')) 
          ? (() => { 
              try {
                const stored = JSON.parse(localStorage.getItem('blobAppearance') || '{}');
                return stored.type || 'normal';
              } catch (e) {
                return 'normal';
              }
            })()
          : 'normal'; // Default to normal if no storage
      
      // Calculate damage with type effectiveness
      const { damage, effectiveness } = calculateDamage(
        action.move, 
        action.seed,
        attackType,
        defenderType
      );
      
      const newState = { ...prev };
      
      if (isPlayer) {
        // Player attacking opponent
        newState.opponentHP = Math.max(0, prev.opponentHP - damage);
        newState.lastMove = action.move;
        newState.lastDamage = damage;
        newState.lastEffectiveness = effectiveness;
        newState.turn = 'opponent';
      } else {
        // Opponent attacking player
        newState.playerHP = Math.max(0, prev.playerHP - damage);
        newState.lastMove = action.move;
        newState.lastDamage = damage;
        newState.lastEffectiveness = effectiveness;
        newState.turn = 'player';
      }
      
      newState.round += 1;
      
      // Check for victory
      if (newState.opponentHP <= 0 || newState.playerHP <= 0) {
        const winner = newState.opponentHP <= 0 ? 'player' : 'opponent';
        
        // Set gameOver and winner properties
        newState.gameOver = true;
        newState.winner = winner;
        
        toast(winner === 'player' ? "Victory!" : "Defeated!", {
          description: winner === 'player'
            ? "Your blob has triumphed!"
            : "Your blob has been defeated!",
          className: `pixel-text ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`
        });
        
        // In a full implementation, we would record the battle result here
        // For now, just disconnect after a delay
        setTimeout(() => {
          disconnect();
        }, 3000);
      } else if (isSimulationMode && newState.turn === 'opponent') {
        // If in simulation mode and it's the opponent's turn, simulate their move
        simulateOpponentMove();
      }
      
      return newState;
    });
  }, [calculateDamage, disconnect, isSimulationMode, simulateOpponentMove]);
  
  // Store the current handleBattleAction in a ref to avoid circular dependencies
  useEffect(() => {
    handleBattleActionRef.current = handleBattleAction;
  }, [handleBattleAction]);
  
  // Send a message to the opponent via the server
  const sendMessage = useCallback((type: MessageType, data: any) => {
    if ((connectionStatus !== 'connected' && !isSimulationMode) || (!battleRoomRef.current && !isSimulationMode)) {
      console.warn('Cannot send message: not connected to a battle');
      return false;
    }
    
    const message: BattleMessage = {
      type,
      data,
      sender: settings.username || 'Anonymous Blob',
      timestamp: Date.now()
    };
    
    try {
      if (isSimulationMode) {
        // In simulation mode, handle the message locally
        setMessages(prev => [...prev, message]);
        
        // Simulate opponent response if it's a battle action
        if (type === 'battle-action') {
          // Process the player's action
          handleBattleAction(data, true);
        }
        return true;
      } else if (socketRef.current && socketRef.current.connected) {
        // Send the message to the server to relay to the opponent
        socketRef.current.emit('message', {
          type: 'SEND_BATTLE_MESSAGE',
          battleId: battleRoomRef.current,
          userId: userIdRef.current,
          message
        });
        
        setMessages(prev => [...prev, message]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message", {
        description: "There was an error communicating with your opponent",
        className: "pixel-text"
      });
      return false;
    }
  }, [connectionStatus, settings.username, isSimulationMode, handleBattleAction]);
  
  // Execute a battle move
  const executeMove = useCallback((moveName: string) => {
    if (!battleState || battleState.turn !== 'player') {
      toast("Not your turn", {
        description: "Wait for your opponent to make a move",
        className: "pixel-text"
      });
      return false;
    }
    
    // Create a deterministic seed based on time
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
  }, [battleState, handleBattleAction, sendMessage]);
  
  // Store functions in refs to avoid circular dependencies
  useEffect(() => {
    simulateOpponentMoveRef.current = simulateOpponentMove;
    initBattleStateRef.current = initBattleState;
  }, [simulateOpponentMove, initBattleState]);
  
  // Get appearance data from localStorage with proper error handling
  const getAppearanceData = () => {
    let appearance = null;
    let evolutionLevel = 1;
    
    try {
      if (typeof window !== 'undefined') {
        const appearanceData = localStorage.getItem('blobAppearance');
        if (appearanceData) {
          appearance = JSON.parse(appearanceData);
          evolutionLevel = parseInt(appearance.evolutionLevel, 10) || 1;

          console.log('Found stored appearance:', appearance);
        } else {
          console.log('No appearance data found in localStorage');
        }
        
      }
    } catch (e) {
      console.error('Error getting appearance data from localStorage:', e);
    }
    
    return { appearance, evolutionLevel };
  };
  
  // Start matchmaking to find an opponent
  const startMatchmaking = useCallback(() => {
    setConnectionStatus('connecting');
    setBattleView('matchmaking');
    
    // Make sure we're connected to the server
    connectToServer().then(connected => {
      if (connected) {
        // Update UI state
        setIsWaitingForOpponent(true);
        
        toast("Finding an opponent...", {
          description: "Searching for other blob trainers",
          className: "pixel-text"
        });
        
        // Get appearance data from localStorage
        const { appearance, evolutionLevel } = getAppearanceData();
        
        // Join the matchmaking queue
        if (socketRef.current && socketRef.current.connected) {
          console.log('Joining queue with user ID:', userIdRef.current);
          console.log('Sending appearance:', appearance);
          console.log('Sending evolution level:', evolutionLevel);
          
          const joinQueueMessage = {
            type: 'JOIN_QUEUE',
            userId: userIdRef.current,
            username: settings.username || 'Anonymous Blob',
            appearance,
            evolutionLevel
          };
          
          socketRef.current.emit('message', joinQueueMessage);
          
          // Periodically check if we're still in the queue to prevent stale state
          if (matchmakingIntervalRef.current) {
            clearInterval(matchmakingIntervalRef.current);
          }
          
          matchmakingIntervalRef.current = setInterval(() => {
            if (socketRef.current && socketRef.current.connected) {
              socketRef.current.emit('message', { type: 'GET_QUEUE' });
            }
          }, 5000);
        } else {
          toast.error("Cannot join matchmaking", {
            description: "Not connected to the game server",
            className: "pixel-text"
          });
          
          setIsWaitingForOpponent(false);
          setConnectionStatus('disconnected');
        }
      } else {
        // Connection failed
        toast.error("Cannot connect to server", {
          description: "Unable to establish connection for matchmaking",
          className: "pixel-text"
        });
        
        setIsWaitingForOpponent(false);
        setConnectionStatus('disconnected');
      }
    });
  }, [connectToServer, settings.username]);
  
  // Create a battle invitation with a code
  const createBattleInvite = useCallback(async () => {
    setConnectionStatus('connecting');
    setBattleView('lobby');
    
    // Connect to the server
    const connected = await connectToServer();
    
    if (!connected) {
      toast.error("Cannot connect to server", {
        description: "Unable to establish connection to the game server",
        className: "pixel-text"
      });
      
      setConnectionStatus('disconnected');
      return;
    }
    
    // Update UI state
    setIsWaitingForOpponent(true);
    
    toast.info("Creating battle invitation", {
      description: "A connection code will be generated shortly...",
      className: "pixel-text"
    });
    
    // Get appearance data from localStorage
    const { appearance, evolutionLevel } = getAppearanceData();
    
    // Request a battle code from the server
    if (socketRef.current && socketRef.current.connected) {
      console.log('Creating battle with user ID:', userIdRef.current);
      console.log('Sending appearance:', appearance);
      console.log('Sending evolution level:', evolutionLevel);
      
      const createBattleMessage = {
        type: 'CREATE_BATTLE',
        userId: userIdRef.current,
        username: settings.username || 'Anonymous Blob',
        appearance,
        evolutionLevel
      };
      
      socketRef.current.emit('message', createBattleMessage);
    } else {
      toast.error("Cannot create battle invitation", {
        description: "Not connected to the game server",
        className: "pixel-text"
      });
      
      setIsWaitingForOpponent(false);
      setConnectionStatus('disconnected');
    }
  }, [connectToServer, settings.username]);
  
  // Join a battle using a connection code
  const joinBattleWithCode = useCallback(async (code: string) => {
    if (!code.trim()) return;
    
    setConnectionStatus('connecting');
    setBattleView('battle');
    
    // Connect to the server
    const connected = await connectToServer();
    
    if (!connected) {
      toast.error("Cannot connect to server", {
        description: "Unable to establish connection to the game server",
        className: "pixel-text"
      });
      
      setConnectionStatus('disconnected');
      return;
    }
    
    toast.info("Joining battle", {
      description: "Connecting to opponent...",
      className: "pixel-text"
    });
    
    // Get appearance data from localStorage
    const { appearance, evolutionLevel } = getAppearanceData();
    
    // Send join request to the server
    if (socketRef.current && socketRef.current.connected) {
      console.log('Joining battle with user ID:', userIdRef.current);
      console.log('Sending appearance:', appearance);
      console.log('Sending evolution level:', evolutionLevel);
      
      const joinBattleMessage = {
        type: 'JOIN_BATTLE',
        userId: userIdRef.current,
        username: settings.username || 'Anonymous Blob',
        code,
        appearance,
        evolutionLevel
      };
      
      socketRef.current.emit('message', joinBattleMessage);
    } else {
      toast.error("Cannot join battle", {
        description: "Not connected to the game server",
        className: "pixel-text"
      });
      
      setConnectionStatus('disconnected');
    }
  }, [connectToServer, settings.username]);
  
  // Start a simulated battle against AI
  const startSimulatedBattle = useCallback(() => {
    // Clean up any existing connection
    disconnect();
    
    // Set up simulation mode
    setIsSimulationMode(true);
    setConnectionStatus('connected');
    setOpponentName('Pixel Bot');
    setBattleView('battle');
    initBattleState();
    
    toast("Starting practice battle", {
      description: "You're now in simulation mode against an AI opponent",
      className: "pixel-text"
    });
  }, [disconnect, initBattleState]);
  
  // Set up ping interval when connected to keep connection alive
  useEffect(() => {
    // Clear any existing ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    // Only set up ping for connected state and real (non-simulation) battles
    if (connectionStatus === 'connected' && !isSimulationMode && 
        socketRef.current && socketRef.current.connected) {
      
      pingIntervalRef.current = setInterval(() => {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('message', {
            type: 'PING',
            userId: userIdRef.current,
            timestamp: Date.now()
          });
        }
      }, 30000); // Ping every 30 seconds
    }
    
    // Clean up on unmount or state change
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [connectionStatus, isSimulationMode]);
  
  // Prepare the context value
  const contextValue: BattleContextType = {
    // State
    connectionStatus,
    battleView,
    isWaitingForOpponent,
    connectionCode,
    opponentName,
    battleState,
    messages,
    matchmakingQueue,
    serverMessages: messages.filter(m => m.type === 'system' || m.type === 'error'),
    opponentAppearance,
    opponentEvolutionLevel,
    
    // Actions
    startMatchmaking,
    createBattleInvite,
    joinBattleWithCode,
    startSimulatedBattle,
    executeMove,
    disconnect,
    setBattleView
  };
  
  return (
    <BattleContext.Provider value={contextValue}>
      {children}
    </BattleContext.Provider>
  );
};

// Custom hook to use the battle context
export const useBattle = (): BattleContextType => {
  const context = useContext(BattleContext);
  
  if (context === undefined) {
    throw new Error('useBattle must be used within a BattleProvider');
  }
  
  return context;
}; 