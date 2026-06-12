import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const isDev = import.meta.env.DEV;
const envUrl = import.meta.env.VITE_BACKEND_URL;

const socketUrl = envUrl
  ? envUrl
  : isDev
    ? 'http://localhost:3001'
    : window.location.origin.includes('localhost')
      ? 'http://localhost:3001'
      : window.location.origin;

export function useSocket(token: string | null, onEvent: (type: string, data: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('event:created', (data) => {
      onEvent('created', data);
    });

    socket.on('event:updated', (data) => {
      onEvent('updated', data);
    });

    socket.on('event:deleted', (data) => {
      onEvent('deleted', data);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return socketRef.current;
}
