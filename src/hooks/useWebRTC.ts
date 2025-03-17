
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
  const [peers, setPeers] = useState<string[]>([]);
  const peerConnectionsRef = useRef<Record<string, PeerConnection>>({});
  const wsRef = useRef<WebSocket | null>(null);
  
  // Initialize WebRTC configuration
  const initPeerConnection = useCallback((peerId: string, isInitiator: boolean) => {
    // Configuration with STUN servers for NAT traversal
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
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
      if (event.candidate) {
        // In a real app, send candidate to the other peer via signaling server
        console.log('Generated ICE candidate for peer:', peerId);
      }
    };
    
    // Connection state changes
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        console.log('Connected to peer:', peerId);
        
        // Add to peers list
        setPeers(prevPeers => {
          if (!prevPeers.includes(peerId)) {
            onPeerConnect?.(peerId);
            return [...prevPeers, peerId];
          }
          return prevPeers;
        });
        
        setIsConnected(true);
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
    
    peerConnectionsRef.current[peerId] = {
      connection: peerConnection,
      dataChannel
    };
    
    return peerConnection;
  }, [onPeerConnect, onPeerDisconnect]);
  
  // Setup data channel message handling
  const setupDataChannel = (dataChannel: RTCDataChannel, peerId: string) => {
    dataChannel.onopen = () => {
      console.log('Data channel opened with peer:', peerId);
    };
    
    dataChannel.onclose = () => {
      console.log('Data channel closed with peer:', peerId);
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
  
  // Send data to all connected peers
  const sendData = useCallback((data: any) => {
    const message = JSON.stringify(data);
    
    Object.entries(peerConnectionsRef.current).forEach(([peerId, { dataChannel }]) => {
      if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(message);
      }
    });
  }, []);
  
  // Send data to a specific peer
  const sendDataToPeer = useCallback((peerId: string, data: any) => {
    const peerConnection = peerConnectionsRef.current[peerId];
    
    if (peerConnection?.dataChannel && peerConnection.dataChannel.readyState === 'open') {
      const message = JSON.stringify(data);
      peerConnection.dataChannel.send(message);
      return true;
    }
    
    return false;
  }, []);
  
  // Connect to a signaling server for peer discovery (simulated)
  const connect = useCallback(() => {
    // In a real implementation, this would connect to a WebSocket server
    // For this example, we'll simulate this behavior
    
    console.log('Connecting to signaling server...');
    
    // Clean up existing connections on reconnect
    disconnect();
    
    // Simulate WebSocket connection and peer discovery
    setTimeout(() => {
      console.log('Connected to signaling server');
      
      // Simulate discovering peers
      // In a real implementation, the server would send a list of peers in the room
      const simulatedPeers = ['sim_peer_1', 'sim_peer_2'];
      
      // Create connections to the simulated peers
      simulatedPeers.forEach(peerId => {
        const peerConnection = initPeerConnection(peerId, true);
        
        // Create and send an offer (this would normally go through the signaling server)
        peerConnection.createOffer()
          .then(offer => peerConnection.setLocalDescription(offer))
          .then(() => {
            console.log('Created offer for peer:', peerId);
            // In a real implementation, the offer would be sent to the peer via the signaling server
          })
          .catch(error => console.error('Error creating offer:', error));
      });
    }, 1000);
    
    return () => {
      disconnect();
    };
  }, [disconnect, initPeerConnection]);
  
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
    
    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    isConnected,
    peers,
    connect,
    disconnect,
    sendData,
    sendDataToPeer
  };
}

export default useWebRTC;
