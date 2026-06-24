import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import type { EventItem, EventCreate } from '../api/events.ts';
import { api, getBackendUrl } from '../api/client.ts';
import {
  getStored,
  setStored,
  STORAGE_KEYS,
  isOnline,
  listenOnline,
} from './storage.ts';
import {
  getLocalEvents,
  setLocalEvents,
  upsertLocalEvent,
  deleteLocalEvent,
  getQueue,
  addToQueue,
  removeFromQueue,
  // clearQueue,
  applyPendingToLocal,
} from './syncQueue.ts';

interface SyncContextType {
  events: EventItem[];
  loading: boolean;
  error: string;
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  refresh: () => Promise<void>;
  createEvent: (data: EventCreate) => Promise<void>;
  updateEvent: (id: string, data: Partial<EventCreate>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [events, setEventsState] = useState<EventItem[]>(getLocalEvents());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [online, setOnline] = useState(isOnline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(getQueue().length);
  const socketRef = useRef<Socket | null>(null);

  const token = getStored<string | null>(STORAGE_KEYS.TOKEN, null);

  const computeEvents = useCallback(() => {
    applyPendingToLocal();
    const merged = getLocalEvents();
    setEventsState(merged);
    return merged;
  }, []);

  const setEvents = useCallback((next: EventItem[]) => {
    setLocalEvents(next);
    setEventsState(next);
  }, []);

  const updatePendingCount = useCallback(() => {
    setPendingCount(getQueue().length);
  }, []);

  // Load from server or local
  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (token && isOnline()) {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const res = await api.get('/events', { params: { month, year } });
        const serverEvents: EventItem[] = res.data;
        // Merge server events into local (last-write-wins)
        const local = getLocalEvents();
        const map = new Map<string, EventItem>();
        for (const e of local) map.set(e.id, e);
        for (const e of serverEvents) {
          const existing = map.get(e.id);
          if (!existing || new Date(e.updatedAt) >= new Date(existing.updatedAt)) {
            map.set(e.id, e);
          }
        }
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        setEvents(merged);
        setStored(STORAGE_KEYS.LAST_SYNC, Date.now());
      }
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e
        ? String((e as { message?: string }).message)
        : 'Не удалось загрузить события';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, setEvents]);

  // Socket.IO real-time + reconnect recovery
  useEffect(() => {
    if (!token || !online) return;
    const socketUrl = getBackendUrl() || 'http://localhost:3001';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Sync] Socket connected');
      // After reconnect, reload events from server
      refresh();
    });

    socket.on('event:created', (data: EventItem) => {
      upsertLocalEvent(data);
      computeEvents();
    });
    socket.on('event:updated', (data: EventItem) => {
      upsertLocalEvent(data);
      computeEvents();
    });
    socket.on('event:deleted', (data: { id: string }) => {
      deleteLocalEvent(data.id);
      computeEvents();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, online, refresh, computeEvents]);

  // Watch online/offline
  useEffect(() => {
    return listenOnline((status) => {
      setOnline(status);
      if (status && token) {
        // Auto-sync when coming back online
        syncQueue();
      }
    });
  }, [token]);

  // Process pending queue
  const syncQueue = useCallback(async () => {
    if (!token || !isOnline()) return;
    const q = getQueue();
    if (q.length === 0) return;

    setIsSyncing(true);
    try {
      for (const action of [...q]) {
        try {
          if (action.op === 'create') {
            const res = await api.post('/events', action.payload);
            removeFromQueue(action.id, 'create');
            upsertLocalEvent(res.data);
          } else if (action.op === 'update') {
            const res = await api.put(`/events/${action.id}`, action.payload);
            removeFromQueue(action.id, 'update');
            upsertLocalEvent(res.data);
          } else if (action.op === 'delete') {
            await api.delete(`/events/${action.id}`);
            removeFromQueue(action.id, 'delete');
            deleteLocalEvent(action.id);
          }
        } catch {
          // leave in queue, retry next time
        }
      }
      computeEvents();
      setStored(STORAGE_KEYS.LAST_SYNC, Date.now());
    } finally {
      setIsSyncing(false);
      updatePendingCount();
    }
  }, [token, computeEvents, updatePendingCount]);

  const syncNow = useCallback(async () => {
    await refresh();
    await syncQueue();
  }, [refresh, syncQueue]);

  // --- CRUD with offline support ---

  const createEvent = useCallback(async (data: EventCreate) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const userId = getStored<{ id: string } | null>(STORAGE_KEYS.USER, null)?.id || '';

    // Optimistic local create
    const optimistic: EventItem = {
      id: tempId,
      userId,
      title: data.title || '',
      description: data.description || null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      type: data.type,
      recurrence: data.recurrence || null,
      recurrenceEnd: data.recurrenceEnd || null,
      recurrenceInterval: data.recurrenceInterval || null,
      amount: data.amount ?? null,
      reminderMinutes: data.reminderMinutes ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertLocalEvent(optimistic);
    computeEvents();

    if (!isOnline() || !token) {
      addToQueue({ op: 'create', id: tempId, payload: data, ts: Date.now() });
      updatePendingCount();
      return;
    }

    try {
      const res = await api.post('/events', data);
      // Replace temp id with real id in local storage
      const stored = getLocalEvents().filter((e) => e.id !== tempId);
      stored.push(res.data);
      stored.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      setLocalEvents(stored);
      computeEvents();
    } catch {
      // Queue for later
      addToQueue({ op: 'create', id: tempId, payload: data, ts: Date.now() });
      updatePendingCount();
    }
  }, [token, computeEvents, updatePendingCount]);

  const updateEvent = useCallback(async (id: string, data: Partial<EventCreate>) => {
    // Optimistic local update
    const events = getLocalEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx >= 0) {
      events[idx] = { ...events[idx], ...data, updatedAt: new Date().toISOString() };
      setLocalEvents(events);
      computeEvents();
    }

    if (!isOnline() || !token) {
      addToQueue({ op: 'update', id, payload: data, ts: Date.now() });
      updatePendingCount();
      return;
    }

    try {
      const res = await api.put(`/events/${id}`, data);
      upsertLocalEvent(res.data);
      computeEvents();
    } catch {
      addToQueue({ op: 'update', id, payload: data, ts: Date.now() });
      updatePendingCount();
    }
  }, [token, computeEvents, updatePendingCount]);

  const deleteEvent = useCallback(async (id: string) => {
    // Optimistic local delete
    deleteLocalEvent(id);
    computeEvents();

    if (!isOnline() || !token) {
      addToQueue({ op: 'delete', id, ts: Date.now() });
      updatePendingCount();
      return;
    }

    try {
      await api.delete(`/events/${id}`);
    } catch {
      addToQueue({ op: 'delete', id, ts: Date.now() });
      updatePendingCount();
    }
  }, [token, computeEvents, updatePendingCount]);

  const value: SyncContextType = {
    events,
    loading,
    error,
    isOnline: online,
    isSyncing,
    pendingCount,
    refresh,
    createEvent,
    updateEvent,
    deleteEvent,
    syncNow,
  };

  return (
    <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
}
