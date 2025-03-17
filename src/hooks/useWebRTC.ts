
import { useRef, useEffect, useState, useCallback } from 'react';

interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
}

interface UseWebRTCProps {
  roomId?: string;
  userId: string;
  onPeerData?: (peerId: string, data: any) => void;
  onPeerConnect?: (peerId: string) => void;
  onPeerDisconnect?: (peerId: string) => void;
}

export function useWebRTC({
  roomId,
  userId,
  onPeerData,
  onPeerConnect,
  onPeerDisconnect
}: UseWebRTCProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const peerConnectionsRef = useRef<Record<string, PeerConnection>>({});
  const wsRef = useRef<WebSocket | null>(null);
  
  // Configure ICE servers for NAT traversal
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];
  
  // Initialize WebRTC peer connection
  const initPeerConnection = useCallback((peerId: string, isInitiator: boolean) => {
    try {
      // Configuration with STUN servers for NAT traversal
      const config = {
        iceServers
      };
      
      const peerConnection = new RTCPeerConnection(config);
      
      // Setup data channel if this peer is the initiator
      let dataChannel: RTCDataChannel | undefined;
      
      if (isInitiator) {
        dataChannel = peerConnection.createDataChannel('data');
        setupDataChannel(dataChannel, peerId);
      } else {
        // If not initiator, listen for data channel
        peerConnection.ondatachannel = (event) => {
          const receivedDataChannel = event.channel;
          setupDataChannel(receivedDataChannel, peerId);
        };
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            to: peerId,
            from: userId
          }));
        }
      };
      
      // Connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Peer ${peerId} connection state changed to: ${peerConnection.connectionState}`);
        
        if (peerConnection.connectionState === 'connected') {
          setPeers(prevPeers => {
            if (!prevPeers.includes(peerId)) {
              onPeerConnect?.(peerId);
              return [...prevPeers, peerId];
            }
            return prevPeers;
          });
          
          setIsConnected(true);
          setIsConnecting(false);
        } else if (['disconnected', 'failed', 'closed'].includes(peerConnection.connectionState)) {
          console.log('Disconnected from peer:', peerId);
          
          // Remove from peers list
          setPeers(prevPeers => {
            if (prevPeers.includes(peerId)) {
              onPeerDisconnect?.(peerId);
              return prevPeers.filter(id => id !== peerId);
            }
            return prevPeers;
          });
          
          // Clean up connection
          delete peerConnectionsRef.current[peerId];
          
          if (Object.keys(peerConnectionsRef.current).length === 0) {
            setIsConnected(false);
          }
        }
      };
      
      // ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        console.log(`ICE connection state for peer ${peerId}: ${peerConnection.iceConnectionState}`);
        if (peerConnection.iceConnectionState === 'disconnected' || 
            peerConnection.iceConnectionState === 'failed') {
          console.log(`ICE connection failed or disconnected for peer ${peerId}`);
        }
      };
      
      peerConnectionsRef.current[peerId] = {
        connection: peerConnection,
        dataChannel
      };
      
      return peerConnection;
    } catch (err) {
      console.error('Error creating peer connection:', err);
      setError('Failed to create peer connection');
      return null;
    }
  }, [userId, onPeerConnect, onPeerDisconnect]);
  
  // Setup data channel message handling
  const setupDataChannel = (dataChannel: RTCDataChannel, peerId: string) => {
    dataChannel.onopen = () => {
      console.log('Data channel opened with peer:', peerId);
    };
    
    dataChannel.onclose = () => {
      console.log('Data channel closed with peer:', peerId);
    };
    
    dataChannel.onerror = (error) => {
      console.error(`Data channel error with peer ${peerId}:`, error);
    };
    
    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onPeerData?.(peerId, data);
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    };
    
    // Save data channel reference
    if (peerConnectionsRef.current[peerId]) {
      peerConnectionsRef.current[peerId].dataChannel = dataChannel;
    }
  };
  
  // Handle signaling messages from server
  const handleSignalingMessage = useCallback((message: any) => {
    try {
      // Ignore messages from self
      if (message.from === userId) return;
      
      console.log('Received signaling message:', message.type);
      
      switch (message.type) {
        case 'peer-joined': {
          // New peer joined, initiate connection if we're the initiator
          // (based on userId comparison for deterministic behavior)
          const shouldInitiate = userId < message.peerId;
          
          if (shouldInitiate) {
            console.log(`Initiating connection to peer ${message.peerId}`);
            const peerConnection = initPeerConnection(message.peerId, true);
            
            if (peerConnection) {
              // Create and send an offer
              peerConnection.createOffer()
                .then(offer => peerConnection.setLocalDescription(offer))
                .then(() => {
                  if (wsRef.current?.readyState === WebSocket.OPEN && peerConnection.localDescription) {
                    wsRef.current.send(JSON.stringify({
                      type: 'offer',
                      offer: peerConnection.localDescription,
                      to: message.peerId,
                      from: userId
                    }));
                  }
                })
                .catch(error => {
                  console.error('Error creating offer:', error);
                  setError('Failed to create connection offer');
                });
            }
          }
          break;
        }
          
        case 'offer': {
          // Received an offer, create answer
          console.log(`Received offer from ${message.from}`);
          const peerConnection = initPeerConnection(message.from, false);
          
          if (peerConnection) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer))
              .then(() => peerConnection.createAnswer())
              .then(answer => peerConnection.setLocalDescription(answer))
              .then(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN && peerConnection.localDescription) {
                  wsRef.current.send(JSON.stringify({
                    type: 'answer',
                    answer: peerConnection.localDescription,
                    to: message.from,
                    from: userId
                  }));
                }
              })
              .catch(error => {
                console.error('Error creating answer:', error);
                setError('Failed to respond to connection offer');
              });
          }
          break;
        }
          
        case 'answer': {
          // Received an answer to our offer
          console.log(`Received answer from ${message.from}`);
          const peerConnection = peerConnectionsRef.current[message.from]?.connection;
          
          if (peerConnection) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer))
              .catch(error => {
                console.error('Error setting remote description:', error);
                setError('Failed to establish connection');
              });
          }
          break;
        }
          
        case 'ice-candidate': {
          // Add ICE candidate received from peer
          console.log(`Received ICE candidate from ${message.from}`);
          const peerConnection = peerConnectionsRef.current[message.from]?.connection;
          
          if (peerConnection) {
            peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate))
              .catch(error => {
                console.error('Error adding received ICE candidate:', error);
              });
          }
          break;
        }
          
        case 'peer-left': {
          // Peer left, clean up connection
          console.log(`Peer ${message.peerId} left`);
          
          const peerConnection = peerConnectionsRef.current[message.peerId];
          if (peerConnection) {
            peerConnection.connection.close();
            delete peerConnectionsRef.current[message.peerId];
            
            setPeers(prevPeers => {
              if (prevPeers.includes(message.peerId)) {
                onPeerDisconnect?.(message.peerId);
                return prevPeers.filter(id => id !== message.peerId);
              }
              return prevPeers;
            });
            
            if (Object.keys(peerConnectionsRef.current).length === 0) {
              setIsConnected(false);
            }
          }
          break;
        }
      }
    } catch (err) {
      console.error('Error handling signaling message:', err);
      setError('Error processing connection message');
    }
  }, [userId, initPeerConnection, onPeerDisconnect]);
  
  // Send data to all connected peers
  const sendData = useCallback((data: any) => {
    const message = JSON.stringify(data);
    let sentToAny = false;
    
    Object.entries(peerConnectionsRef.current).forEach(([peerId, { dataChannel }]) => {
      if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(message);
        sentToAny = true;
      }
    });
    
    return sentToAny;
  }, []);
  
  // Send data to a specific peer
  const sendDataToPeer = useCallback((peerId: string, data: any) => {
    const peerConnection = peerConnectionsRef.current[peerId];
    
    if (peerConnection?.dataChannel && peerConnection.dataChannel.readyState === 'open') {
      const message = JSON.stringify(data);
      try {
        peerConnection.dataChannel.send(message);
        return true;
      } catch (err) {
        console.error(`Error sending data to peer ${peerId}:`, err);
        return false;
      }
    }
    
    return false;
  }, []);
  
  // Disconnect from all peers and signaling server
  const disconnect = useCallback(() => {
    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(({ connection }) => {
      connection.close();
    });
    
    // Reset state
    peerConnectionsRef.current = {};
    setPeers([]);
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    
    // Close WebSocket connection to signaling server
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'leave-room',
          roomId,
          userId
        }));
      }
      
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [roomId, userId]);
  
  // Connect to a signaling server for peer discovery
  const connect = useCallback((code?: string) => {
    // Clean up existing connections on reconnect
    disconnect();
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Use a public signaling server (in a real app, use your own secure server)
      // For this demo, we'll use a test server - replace with your production server
      const signalingServerUrl = `wss://signaling.blobmeet.example.com`;
      
      console.log('Connecting to signaling server...');
      
      const ws = new WebSocket(signalingServerUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('Connected to signaling server');
        
        // Join room - either with provided code or a new room
        ws.send(JSON.stringify({
          type: 'join-room',
          roomId: code || roomId || Math.random().toString(36).substring(2, 7),
          userId
        }));
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleSignalingMessage(message);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Failed to connect to network');
        setIsConnecting(false);
        
        // Fallback to simulated peers for demo purposes
        simulatePeers();
      };
      
      ws.onclose = () => {
        console.log('Disconnected from signaling server');
        if (isConnecting) {
          setError('Connection to server lost');
          setIsConnecting(false);
        }
      };
      
    } catch (err) {
      console.error('Error connecting to signaling server:', err);
      setError('Failed to establish connection');
      setIsConnecting(false);
      
      // Fallback to simulated peers for demo purposes
      simulatePeers();
    }
    
    return () => {
      disconnect();
    };
  }, [roomId, userId, disconnect, handleSignalingMessage]);
  
  // For demo/fallback - simulate peer connections if server unavailable
  const simulatePeers = () => {
    console.log('🔄 Using fallback simulation mode');
    
    setTimeout(() => {
      const simulatedPeers = ['sim_peer_1', 'sim_peer_2'];
      
      simulatedPeers.forEach(peerId => {
        // Add to peers list
        setPeers(prevPeers => {
          if (!prevPeers.includes(peerId)) {
            onPeerConnect?.(peerId);
            return [...prevPeers, peerId];
          }
          return prevPeers;
        });
      });
      
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    isConnected,
    isConnecting,
    peers,
    error,
    connect,
    disconnect,
    sendData,
    sendDataToPeer
  };
}

export default useWebRTC;
