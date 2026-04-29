import React, { useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { getAccessToken } from '../utils/api';
import { SocketContext } from './SocketContext';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Only connect if user is logged in
    if (user) {
      const token = getAccessToken();
      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      console.log('[Socket] Initializing connection to:', socketUrl);
      
      const newSocket = io(socketUrl, {
        auth: {
          token: `Bearer ${token}`,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        setConnected(true);
        console.log('[Socket] Connected! ID:', newSocket.id);
      });

      newSocket.on('disconnect', (reason) => {
        setConnected(false);
        console.log('[Socket] Disconnected:', reason);
      });

      newSocket.on('connect_error', (err) => {
        console.error('[Socket] Connection Error:', err.message);
      });

      newSocket.on('force_logout', async (data: { reason: string }) => {
        console.warn('[Socket] Force Logout Event Received:', data.reason);
        await logout();
        window.location.href = '/#/login'; // Ensure redirect to login
      });

      setSocket(newSocket);

      return () => {
        console.log('[Socket] Cleaning up connection...');
        newSocket.close();
      };
    } else {
      // Logic for logouts
      setSocket(null);
      setConnected(false);
    }
  }, [user]); // Re-run when user changes

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
