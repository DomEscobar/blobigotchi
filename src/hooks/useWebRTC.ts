import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from './useSettings';
import { toast } from "sonner";

// Types for our WebSocket battle implementation
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
type MessageType = 'chat' | 'battle-action' | 'system' | 'ping';

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
  gameOver?: boolean;
  winner?: 'player' | 'opponent';
}

// Matchmaking and battle types
interface MatchmakingEntry {
  userId: string;
  username: string;
  timestamp: number;
}

// Server URL - should be configured based on environment
const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://your-production-server.com' 
  : 'ws://localhost:3001';

// Create a function to generate a stable userId that won't change on re-renders
function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function useWebRTC() {
  const { settings } = useSettings();
  
  // State for UI updates
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<BattleMessage[]>([]);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [connectionCode, setConnectionCode] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  // Refs for values that shouldn't trigger re-renders
  const webSocketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const matchmakingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string>(generateUserId());
  const isCleanedUpRef = useRef(false);
  const isDisconnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const battleRoomRef = useRef<string | null>(null);
  const simulateTurnRef = useRef<((opponentAction: BattleMoveAction) => void) | null>(null);
  
  // Calculate damage based on move and seed
  const calculateDamage = useCallback((move: string, seed: number): number => {
    // Simple deterministic formula based on move and seed
    const moveHash = move.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 5 + ((moveHash * seed) % 20);
  }, []);
  
  // Clean up connections and state
  const disconnect = useCallback(() => {
    debugger;
    // Prevent duplicate cleanups
    if (isDisconnectingRef.current) {
      console.log('Already disconnecting, skipping cleanup');
      return;
    }

    isDisconnectingRef.current = true;
    console.log('Disconnecting from battle');
    
    try {
      // If we have an active WebSocket and we're in a battle, send a leave message
      if (webSocketRef.current && battleRoomRef.current) {
        const leaveMessage = {
          type: 'LEAVE_BATTLE',
          battleId: battleRoomRef.current,
          userId: userIdRef.current
        };
        
        webSocketRef.current.send(JSON.stringify(leaveMessage));
      }
      
      // If we're in the matchmaking queue, leave it
      if (webSocketRef.current && isWaitingForOpponent) {
        const leaveQueueMessage = {
          type: 'LEAVE_QUEUE',
          userId: userIdRef.current
        };
        
        webSocketRef.current.send(JSON.stringify(leaveQueueMessage));
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
          className: "pixel-text bg-crt-background text-white"
        });
      }
      
    } catch (error) {
      console.error('Error during disconnect:', error);
    } finally {
      setTimeout(() => {
        isDisconnectingRef.current = false;
      }, 500);
    }
  }, [connectionStatus]);

  // Handle a battle action from either player or opponent
  const handleBattleAction = useCallback((action: BattleMoveAction, isPlayer: boolean) => {
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

        // Set gameOver and winner properties
        newState.gameOver = true;
        newState.winner = winner;

        toast(winner === 'player' ? "Victory!" : "Defeated!", {
          description: winner === 'player'
            ? "Your blob has triumphed!"
            : "Your blob has been defeated!",
          className: `pixel-text bg-crt-background ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`
        });

        // In a full implementation, we would record the battle result here
        // For now, just disconnect after a delay
        setTimeout(() => {
          disconnect();
        }, 3000);
      } else if (isSimulationMode && newState.turn === 'opponent' && simulateTurnRef.current) {
        // If in simulation mode and it's the opponent's turn, simulate their move
        // Use the simulateTurnRef.current function to avoid circular dependencies
        const opponentAction: BattleMoveAction = {
          move: ['Pixel Punch', 'Blob Beam', 'Digital Dash', 'Static Slam'][Math.floor(Math.random() * 4)],
          seed: Math.floor(Math.random() * 1000)
        };
        
        simulateTurnRef.current(opponentAction);
      }

      return newState;
    });
  }, [calculateDamage, disconnect, isSimulationMode]);
  
  // Simulate an opponent's turn in simulation mode
  const simulateOpponentTurn = useCallback(() => {
    if (!isSimulationMode) return;
    
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
  }, [isSimulationMode, handleBattleAction]);
  
  // Store the simulateOpponentTurn function in a ref to avoid circular references
  useEffect(() => {
    simulateTurnRef.current = (opponentAction: BattleMoveAction) => {
      setTimeout(() => {
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
  }, [handleBattleAction]);

  // Initialize the battle state
  const initBattleState = useCallback(() => {
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
  }, [isSimulationMode, simulateOpponentTurn]);

  // Simulate an opponent's response in simulation mode
  const simulateOpponentResponse = useCallback((playerAction: BattleMoveAction) => {
    if (!isSimulationMode) return;
    // Process the player's action
    handleBattleAction(playerAction, true);
  }, [handleBattleAction, isSimulationMode]);

  // Handle messages from the server
  const handleServerMessage = useCallback((message: any) => {
    console.log('Received server message:', message.type);
    
    switch (message.type) {
      case 'CONNECTED':
        console.log('Successfully connected to server');
        break;
        
      case 'QUEUE_UPDATE':
        // Handle queue updates for UI if needed
        console.log('Queue updated, players in queue:', message.queue.length);
        break;
        
      case 'MATCH_FOUND':
        // Server found a match for us
        setIsWaitingForOpponent(false);
        setOpponentName(message.opponentName);
        battleRoomRef.current = message.battleId;
        setConnectionStatus('connected');
        
        toast.success("Opponent found!", {
          description: `Connected to ${message.opponentName}`,
          className: "pixel-text bg-crt-background text-white"
        });
        
        // Initialize battle state
        initBattleState();
        break;
        
      case 'BATTLE_MESSAGE':
        // Handle a message in the current battle
        const battleMessage: BattleMessage = message.message;
        setMessages(prev => [...prev, battleMessage]);
        
        // Process battle actions
        if (battleMessage.type === 'battle-action') {
          handleBattleAction(battleMessage.data, false);
        } else if (battleMessage.type === 'system' && battleMessage.data === 'ready-for-battle') {
          // If we receive a ready message, make sure we have the opponent's name
          setOpponentName(battleMessage.sender);
        }
        break;
        
      case 'OPPONENT_DISCONNECTED':
        debugger;
        toast.error("Opponent disconnected", {
          description: "Your opponent has left the battle",
          className: "pixel-text bg-crt-background text-white"
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
        break;
        
      case 'BATTLE_CODE_GENERATED':
        // For direct connections with invitation code
        setConnectionCode(message.code);

      toast("Battle invitation created!", {
        description: "Share your code with a friend to battle",
          className: "pixel-text bg-crt-background text-white"
        });
        break;
        
      case 'BATTLE_JOIN_SUCCESS':
        setConnectionStatus('connected');
        setOpponentName(message.opponentName);
        battleRoomRef.current = message.battleId;
        
        toast.success("Joined battle!", {
          description: `Connected to ${message.opponentName}`,
          className: "pixel-text bg-crt-background text-white"
        });
        
        // Initialize battle state
        initBattleState();
        break;
        
      case 'ERROR':
        console.error('Server error:', message.error);
        toast.error("Server error", {
          description: message.error,
          className: "pixel-text bg-crt-background text-white"
        });
        break;
    }
  }, [disconnect, initBattleState, handleBattleAction]);
  
  // Function to establish websocket connection
  const connectToServer = useCallback(() => {
    // If already connected, do nothing
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      console.log('Connecting to game server:', SERVER_URL);
      const socket = new WebSocket(SERVER_URL);
      webSocketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        // The server will send a CONNECTED message when ready
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        
        // If we're in a battle or matchmaking, handle the disconnection
        if (connectionStatus === 'connected' || isWaitingForOpponent) {
          toast.error("Connection to server lost", {
            description: "Attempting to reconnect...",
            className: "pixel-text bg-crt-background text-white"
          });
          
          // Try to reconnect after a delay
          if (!reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              connectToServer();
            }, 3000);
          }
        }
        
        // If the socket is closed, clear the reference
        webSocketRef.current = null;
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error("Connection error", {
          description: "There was a problem connecting to the game server",
          className: "pixel-text bg-crt-background text-white"
        });
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleServerMessage(message);
        } catch (error) {
          console.error('Error parsing server message:', error);
        }
      };
      
    } catch (error) {
      console.error('Error connecting to server:', error);
      toast.error("Connection failed", {
        description: "Could not connect to the game server",
        className: "pixel-text bg-crt-background text-white"
      });
    }
  }, [connectionStatus, isWaitingForOpponent, handleServerMessage]);
  
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
          simulateOpponentResponse(data);
        }
        return true;
      } else if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        // Send the message to the server to relay to the opponent
        const serverMessage = {
          type: 'SEND_BATTLE_MESSAGE',
          battleId: battleRoomRef.current,
          userId: userIdRef.current,
          message
        };
        
        webSocketRef.current.send(JSON.stringify(serverMessage));
        setMessages(prev => [...prev, message]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message", {
        description: "There was an error communicating with your opponent",
        className: "pixel-text bg-crt-background text-white"
      });
      return false;
    }
  }, [connectionStatus, settings.username, isSimulationMode, simulateOpponentResponse]);

  // Execute a battle move
  const executeMove = useCallback((moveName: string) => {
    if (!battleState || battleState.turn !== 'player') {
      toast("Not your turn", {
        description: "Wait for your opponent to make a move",
        className: "pixel-text bg-crt-background text-white"
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

  // Connect to WebSocket server when hook is initialized
  useEffect(() => {
    // Don't connect automatically on startup - only connect when explicitly needed
    // connectToServer(); - REMOVED to fix auto-connection issue
    
    // Clean up when component unmounts
    return () => {
      console.log('Component unmounting, cleaning up connections WEBETC');
      isCleanedUpRef.current = true;
      
      // Clear all intervals and timeouts
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      
      if (matchmakingIntervalRef.current) {
        clearInterval(matchmakingIntervalRef.current);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Close WebSocket if open
      if (webSocketRef.current) {
        try {
          // If in a battle, send leave message
          if (battleRoomRef.current) {
            const leaveMessage = {
              type: 'LEAVE_BATTLE',
              battleId: battleRoomRef.current,
              userId: userIdRef.current
            };
            
            webSocketRef.current.send(JSON.stringify(leaveMessage));
          }
          
          // If in queue, leave queue
          if (isWaitingForOpponent) {
            const leaveQueueMessage = {
              type: 'LEAVE_QUEUE',
              userId: userIdRef.current
            };
            
            webSocketRef.current.send(JSON.stringify(leaveQueueMessage));
          }
          
        } catch (error) {
          console.error('Error sending cleanup messages:', error);
        }
        
        // Close the connection
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, [isWaitingForOpponent]);
  
  // Start matchmaking to find an opponent
  const startMatchmaking = useCallback(() => {
    // Make sure we're connected to the server
    if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
      console.log('Connecting to server before matchmaking');
      connectToServer();
      
      // Wait for connection to be established before proceeding
      const maxAttempts = 5;
      let attempts = 0;
      
      const checkConnection = setInterval(() => {
        attempts++;
        
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
          // Connection is ready, continue with matchmaking
          clearInterval(checkConnection);
          continueMatchmaking();
        } else if (attempts >= maxAttempts) {
          // Connection failed after max attempts
          clearInterval(checkConnection);
          toast.error("Cannot connect to server", {
            description: "Unable to establish connection after several attempts",
            className: "pixel-text bg-crt-background text-white"
          });
          setIsWaitingForOpponent(false);
        debugger;
          setConnectionStatus('disconnected');
        }
      }, 500);
        } else {
      // Already connected, proceed with matchmaking
      continueMatchmaking();
    }
    
    function continueMatchmaking() {
      // Do NOT disconnect here as it was doing before
      // Remove: disconnect(); - This line was causing the issue
      
      // Update UI state
      setIsWaitingForOpponent(true);
      setConnectionStatus('connecting');

      toast("Finding an opponent...", {
        description: "Searching for other blob trainers",
        className: "pixel-text bg-crt-background text-white"
      });

      // Join the matchmaking queue
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        const joinQueueMessage = {
          type: 'JOIN_QUEUE',
          userId: userIdRef.current,
          username: settings.username || 'Anonymous Blob'
        };
        
        webSocketRef.current.send(JSON.stringify(joinQueueMessage));
        
        // Periodically check if we're still in the queue to prevent stale state
        if (matchmakingIntervalRef.current) {
          clearInterval(matchmakingIntervalRef.current);
        }
        
        matchmakingIntervalRef.current = setInterval(() => {
          if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            const checkQueueMessage = {
              type: 'GET_QUEUE'
            };
            
            webSocketRef.current.send(JSON.stringify(checkQueueMessage));
          }
        }, 5000);
      } else {
        toast.error("Cannot join matchmaking", {
          description: "Not connected to the game server",
        className: "pixel-text bg-crt-background text-white"
      });
        setIsWaitingForOpponent(false);
        setConnectionStatus('disconnected');
      }
    }
  }, [connectToServer, settings.username]);
  
  // Create a battle invitation with a code
  const createBattleInvite = useCallback(() => {
    // Make sure we're connected to the server
    if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
      console.log('Connecting to server before creating battle invite');
      connectToServer();
      
      // Wait for connection to be established before proceeding
      const maxAttempts = 5;
      let attempts = 0;
      
      const checkConnection = setInterval(() => {
        attempts++;
        
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
          // Connection is ready, continue with creating battle invite
          clearInterval(checkConnection);
          continueBattleInvite();
        } else if (attempts >= maxAttempts) {
          // Connection failed after max attempts
          clearInterval(checkConnection);
          toast.error("Cannot connect to server", {
            description: "Unable to establish connection after several attempts",
            className: "pixel-text bg-crt-background text-white"
          });
          setIsWaitingForOpponent(false);
          debugger;
          setConnectionStatus('disconnected');
        }
      }, 500);
    } else {
      // Already connected, proceed with creating battle invite
      continueBattleInvite();
    }
    
    function continueBattleInvite() {
      // Do NOT disconnect here as it was doing before
      // Remove: disconnect();
      
      // Update UI state
      setIsWaitingForOpponent(true);
      setConnectionStatus('connecting');

      toast("Creating battle invitation", {
        description: "A connection code will be generated shortly...",
            className: "pixel-text bg-crt-background text-white"
          });

      // Request a battle code from the server
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        const createBattleMessage = {
          type: 'CREATE_BATTLE',
          userId: userIdRef.current,
          username: settings.username || 'Anonymous Blob'
        };
        
        webSocketRef.current.send(JSON.stringify(createBattleMessage));
      } else {
        toast.error("Cannot create battle invitation", {
          description: "Not connected to the game server",
          className: "pixel-text bg-crt-background text-white"
        });
        setIsWaitingForOpponent(false);
        debugger;
        setConnectionStatus('disconnected');
      }
    }
  }, [connectToServer, settings.username]);
  
  // Join a battle using a connection code
  const joinBattleWithCode = useCallback((code: string) => {
    // Make sure we're connected to the server
    if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
      console.log('Connecting to server before joining battle');
      connectToServer();
      
      // Wait for connection to be established before proceeding
      const maxAttempts = 5;
      let attempts = 0;
      
      const checkConnection = setInterval(() => {
        attempts++;
        
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
          // Connection is ready, continue with joining battle
          clearInterval(checkConnection);
          continueJoinBattle(code);
        } else if (attempts >= maxAttempts) {
          // Connection failed after max attempts
          clearInterval(checkConnection);
          toast.error("Cannot connect to server", {
            description: "Unable to establish connection after several attempts",
            className: "pixel-text bg-crt-background text-white"
          });
          debugger;
          setConnectionStatus('disconnected');
        }
      }, 500);
    } else {
      // Already connected, proceed with joining battle
      continueJoinBattle(code);
    }
    
    function continueJoinBattle(code: string) {
      // Do NOT disconnect here as it was doing before
      // Remove: disconnect();
      
      // Update UI state
      setConnectionStatus('connecting');

      toast("Joining battle", {
        description: "Connecting to opponent...",
        className: "pixel-text bg-crt-background text-white"
      });

      // Send join request to the server
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        const joinBattleMessage = {
          type: 'JOIN_BATTLE',
          userId: userIdRef.current,
          username: settings.username || 'Anonymous Blob',
          code
        };
        
        webSocketRef.current.send(JSON.stringify(joinBattleMessage));
      } else {
        toast.error("Cannot join battle", {
          description: "Not connected to the game server",
        className: "pixel-text bg-crt-background text-white"
      });
        debugger;
        setConnectionStatus('disconnected');
    }
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
    initBattleState();

    toast("Starting practice battle", {
      description: "You're now in simulation mode against an AI opponent",
      className: "pixel-text bg-crt-background text-white"
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
        webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      
      pingIntervalRef.current = setInterval(() => {
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
          const pingMessage = {
            type: 'PING',
            userId: userIdRef.current,
            timestamp: Date.now()
          };
          
          webSocketRef.current.send(JSON.stringify(pingMessage));
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
  
  // Return the public API
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
    startMatchmaking,
    sendMessage,
    executeMove,
    disconnect
  };
}
