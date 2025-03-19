import { useState, useEffect } from 'react';

export interface BlobBattleRecord {
    id: string;
    player1: string;
    player2: string;
    winner?: string;
    date: number;
    moves: string[];
}

export interface BlobProfile {
    userId: string;
    username: string;
    wins: number;
    losses: number;
    lastActive: number;
    evolutionLevel: number;
}

export interface MatchmakingEntry {
    userId: string;
    username: string;
    timestamp: number;
    connectionOffer?: string;
}

// WebSocket connection
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://websocket-server-production-5380.up.railway.app';
let ws: WebSocket | null = null;

/**
 * Hook to interact with the game server
 */
export function useGameServer() {
    const [isConnected, setIsConnected] = useState(false);
    const [profiles, setProfiles] = useState<Record<string, BlobProfile>>({});
    const [battles, setBattles] = useState<Record<string, BlobBattleRecord>>({});
    const [matchmakingQueue, setMatchmakingQueue] = useState<Record<string, MatchmakingEntry>>({});

    // Initialize WebSocket connection
    useEffect(() => {
        if (!ws) {
            ws = new WebSocket(WS_URL);
            
            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                // Request initial data
                ws.send(JSON.stringify({ type: 'GET_RECENT_BATTLES' }));
            };
            
            ws.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                // Attempt to reconnect after a delay
                setTimeout(() => {
                    ws = null;
                }, 5000);
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received', data.type);
                switch (data.type) {
                    case 'QUEUE_UPDATE':
                        const queueObj: Record<string, MatchmakingEntry> = {};
                        data.queue.forEach((entry: MatchmakingEntry) => {
                            queueObj[entry.userId] = entry;
                        });
                        setMatchmakingQueue(queueObj);
                        break;

                    case 'PROFILE_UPDATE':
                        setProfiles(prev => ({
                            ...prev,
                            [data.profile.userId]: data.profile
                        }));
                        break;

                    case 'GET_PROFILE_RESPONSE':
                        setProfiles(prev => ({
                            ...prev,
                            [data.profile.userId]: data.profile
                        }));
                        break;

                    case 'BATTLES_UPDATE':
                        const battlesObj: Record<string, BlobBattleRecord> = {};
                        data.battles.forEach((battle: BlobBattleRecord) => {
                            battlesObj[battle.id] = battle;
                        });
                        setBattles(battlesObj);
                        break;
                }
            };
        }

        return () => {
            if (ws) {
                ws.close();
                ws = null;
            }
        };
    }, []);

    // Add player to matchmaking queue
    const addToMatchmaking = (userId: string, username: string, connectionOffer?: string) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        ws.send(JSON.stringify({
            type: 'JOIN_QUEUE',
            userId,
            username,
            connectionOffer
        }));
    };

    // Remove player from matchmaking queue
    const removeFromMatchmaking = (userId: string) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        ws.send(JSON.stringify({
            type: 'LEAVE_QUEUE',
            userId
        }));
    };

    // Get all players in matchmaking queue
    const getMatchmakingQueue = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return [];
        }

        ws.send(JSON.stringify({
            type: 'GET_QUEUE'
        }));

        return Object.values(matchmakingQueue)
            .sort((a, b) => a.timestamp - b.timestamp);
    };

    // Get a specific player in the queue
    const getPlayerInQueue = (userId: string) => {
        return matchmakingQueue[userId] || null;
    };

    // Update player's matchmaking entry with connection offer
    const updateMatchmakingOffer = (userId: string, connectionOffer: string) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        ws.send(JSON.stringify({
            type: 'UPDATE_OFFER',
            userId,
            connectionOffer
        }));
    };

    // Save user profile
    const saveProfile = (userId: string, profile: Partial<BlobProfile>) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        ws.send(JSON.stringify({
            type: 'SAVE_PROFILE',
            userId,
            profile
        }));
    };

    // Record a battle
    const recordBattle = (battleData: Omit<BlobBattleRecord, 'id'>) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        ws.send(JSON.stringify({
            type: 'RECORD_BATTLE',
            battle: battleData
        }));
    };

    // Get recent battles
    const getRecentBattles = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return [];
        }

        ws.send(JSON.stringify({
            type: 'GET_RECENT_BATTLES'
        }));

        return Object.values(battles)
            .sort((a, b) => b.date - a.date)
            .slice(0, 10);
    };

    // Get user stats
    const getUserStats = (userId: string) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return null;
        }

        ws.send(JSON.stringify({
            type: 'GET_PROFILE',
            userId
        }));

        return profiles[userId] || null;
    };

    // Clear matchmaking queue
    const clearMatchmakingQueue = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        // Clear local state immediately for better UI feedback
        setMatchmakingQueue({});
        
        // Send clear queue request to server
        ws.send(JSON.stringify({
            type: 'CLEAR_QUEUE'
        }));
    };

    return {
        isConnected,
        profiles,
        battles,
        matchmakingQueue,
        saveProfile,
        recordBattle,
        getRecentBattles,
        getUserStats,
        addToMatchmaking,
        removeFromMatchmaking,
        getMatchmakingQueue,
        getPlayerInQueue,
        updateMatchmakingOffer,
        clearMatchmakingQueue
    };
} 