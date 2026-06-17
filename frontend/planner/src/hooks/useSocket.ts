import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { EventItem } from '../api/events.ts';
import { getBackendUrl } from '../api/client.ts';

function getSocketUrl(): string {
  const url = getBackendUrl();
  if (url) return url;
  if (import.meta.env.DEV) return 'http://localhost:3001';
  return 'http://localhost:3001';
}

export function useSocket(token: string | null, onEvent: (type: string, data: EventItem) => void) {
  const socketRef = useRef<Socket | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!token) return;

    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected to', socketUrl);
    });

    socket.on('event:created', (data) => {
      onEventRef.current('created', data);
    });

    socket.on('event:updated', (data) => {
      onEventRef.current('updated', data);
    });

    socket.on('event:deleted', (data) => {
      onEventRef.current('deleted', data);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Returning the ref itself (not .current) avoids accessing ref during render
  return socketRef;
}
