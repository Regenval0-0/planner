import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { EventItem, EventCreate } from '../api/events.ts';
import { fetchAllEvents, createEventApi, updateEventApi, deleteEventApi } from '../api/events.ts';
import { getBackendUrl, isRetryableError, errorMessage } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { uuid } from '../lib/platform.ts';
import { syncReminders } from '../lib/reminders.ts';
import { getStored, setStored, STORAGE_KEYS, isOnline, listenOnline } from './storage.ts';
import { enqueue, applyQueue, applyServerResult, removeAction, type PendingAction } from './syncQueue.ts';

interface SyncContextType {
  /** Все события пользователя (повторяющиеся — одной записью), с учётом неотправленных изменений. */
  events: EventItem[];
  /** Данные ещё ни разу не загружались на этом устройстве. */
  initialLoading: boolean;
  error: string;
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSync: number | null;
  createEvent: (data: EventCreate) => Promise<string>;
  updateEvent: (id: string, data: Partial<EventCreate>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | null>(null);

const AUTO_SYNC_MS = 2 * 60 * 1000;

function readServer(): EventItem[] {
  return getStored<EventItem[]>(STORAGE_KEYS.SERVER_EVENTS, []);
}
function readQueue(): PendingAction[] {
  return getStored<PendingAction[]>(STORAGE_KEYS.QUEUE, []);
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const userId = user?.id || '';

  const [events, setEvents] = useState<EventItem[]>(() => applyQueue(readServer(), readQueue(), userId));
  const [pendingCount, setPendingCount] = useState(() => readQueue().length);
  const [online, setOnline] = useState(isOnline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState<number | null>(() => getStored<number | null>(STORAGE_KEYS.LAST_SYNC, null));

  const syncPromise = useRef<Promise<void> | null>(null);
  const syncAgain = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef(token);
  const userIdRef = useRef(userId);
  /** id события, которое сейчас отправляется на сервер. */
  const inFlightId = useRef<string | null>(null);

  useEffect(() => {
    tokenRef.current = token;
    userIdRef.current = userId;
  }, [token, userId]);

  /** Пересчитать видимый список из снимка сервера и очереди. */
  const recompute = useCallback(() => {
    const queue = readQueue();
    setEvents(applyQueue(readServer(), queue, userIdRef.current));
    setPendingCount(queue.length);
  }, []);

  // Смена пользователя (вход/выход) — перечитать хранилище.
  useEffect(() => {
    recompute();
    setLastSync(getStored<number | null>(STORAGE_KEYS.LAST_SYNC, null));
    setError('');
  }, [token, userId, recompute]);

  /** Отправить очередь на сервер по порядку. Возвращает false, если отправка прервалась. */
  const flushQueue = useCallback(async (): Promise<boolean> => {
    let queue = readQueue();
    for (const action of [...queue]) {
      if (!tokenRef.current) return false;
      // Действие могло измениться или отмениться, пока отправлялись предыдущие.
      if (!readQueue().some((a) => a.id === action.id && a.op === action.op && a.ts === action.ts)) continue;
      inFlightId.current = action.id;
      try {
        let result: EventItem | null = null;
        if (action.op === 'create') result = await createEventApi(action.id, action.payload);
        else if (action.op === 'update') result = await updateEventApi(action.id, action.payload);
        else await deleteEventApi(action.id);
        setStored(STORAGE_KEYS.SERVER_EVENTS, applyServerResult(readServer(), action, result));
      } catch (err) {
        if (isRetryableError(err)) {
          inFlightId.current = null;
          return false;
        }
        // Сервер отклонил изменение (например, событие уже удалено на другом устройстве) —
        // убираем его из очереди, чтобы не повторять бесконечно.
        console.warn('Изменение отклонено сервером', action, err);
        setError(errorMessage(err, 'Одно из изменений не удалось сохранить'));
      }
      queue = removeAction(readQueue(), action);
      // Пока создание отправлялось, событие успели изменить: правка была дописана
      // в создание — превращаем её в обычное изменение уже существующего события.
      if (action.op === 'create') {
        queue = queue.map((a) =>
          a.op === 'create' && a.id === action.id ? { op: 'update' as const, id: a.id, payload: a.payload, ts: a.ts } : a,
        );
      }
      setStored(STORAGE_KEYS.QUEUE, queue);
    }
    inFlightId.current = null;
    return true;
  }, []);

  const runSync = useCallback(async () => {
    if (!tokenRef.current || !isOnline()) return;
    setIsSyncing(true);
    try {
      const flushed = await flushQueue();
      if (flushed && tokenRef.current) {
        const serverEvents = await fetchAllEvents();
        // Пока шёл запрос, пользователь мог выйти или войти в другой аккаунт.
        if (!tokenRef.current) return;
        setStored(STORAGE_KEYS.SERVER_EVENTS, serverEvents);
        const now = Date.now();
        setStored(STORAGE_KEYS.LAST_SYNC, now);
        setLastSync(now);
        setError('');
      }
    } catch (err) {
      if (!isRetryableError(err)) setError(errorMessage(err, 'Не удалось загрузить события'));
    } finally {
      recompute();
      setIsSyncing(false);
    }
  }, [flushQueue, recompute]);

  /** Синхронизация без наложения: если уже идёт — запустится ещё раз после неё. */
  const syncNow = useCallback(async () => {
    if (syncPromise.current) {
      syncAgain.current = true;
      return syncPromise.current;
    }
    const loop = async () => {
      do {
        syncAgain.current = false;
        await runSync();
      } while (syncAgain.current);
    };
    syncPromise.current = loop().finally(() => {
      syncPromise.current = null;
    });
    return syncPromise.current;
  }, [runSync]);

  const scheduleSync = useCallback(
    (delay = 400) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null;
        syncNow();
      }, delay);
    },
    [syncNow],
  );

  // Синхронизация при входе, при появлении сети, при возврате в приложение и по таймеру.
  useEffect(() => {
    if (!token) return;
    syncNow();
    const stopOnline = listenOnline((status) => {
      setOnline(status);
      if (status) scheduleSync(1000);
    });
    const onVisible = () => {
      if (document.visibilityState === 'visible') scheduleSync(300);
    };
    document.addEventListener('visibilitychange', onVisible);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') syncNow();
    }, AUTO_SYNC_MS);
    return () => {
      stopOnline();
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
    };
  }, [token, syncNow, scheduleSync]);

  // Мгновенные обновления с других устройств.
  useEffect(() => {
    if (!token || !online) return;
    const url = getBackendUrl();
    if (!url) return;
    let socket: Socket | null = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 30000,
    });
    socket.on('connect', () => scheduleSync(200));
    socket.on('event:created', () => scheduleSync(300));
    socket.on('event:updated', () => scheduleSync(300));
    socket.on('event:deleted', () => scheduleSync(300));
    socket.on('session:revoked', () => scheduleSync(0));
    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [token, online, scheduleSync]);

  // Напоминания пересчитываются при любом изменении списка событий.
  useEffect(() => {
    if (!token) return;
    const t = setTimeout(() => syncReminders(events), 500);
    return () => clearTimeout(t);
  }, [events, token]);

  const mutate = useCallback(
    (action: PendingAction) => {
      let queue = enqueue(readQueue(), action);
      // Удаление события, которое прямо сейчас создаётся на сервере: само создание
      // уже не отменить, поэтому удаление тоже нужно отправить.
      if (action.op === 'delete' && inFlightId.current === action.id && !queue.some((a) => a.id === action.id)) {
        queue = [...queue, action];
      }
      setStored(STORAGE_KEYS.QUEUE, queue);
      recompute();
      scheduleSync(300);
    },
    [recompute, scheduleSync],
  );

  const createEvent = useCallback(
    async (data: EventCreate) => {
      const id = uuid();
      mutate({ op: 'create', id, payload: data, ts: Date.now() });
      return id;
    },
    [mutate],
  );

  const updateEvent = useCallback(
    async (id: string, data: Partial<EventCreate>) => {
      mutate({ op: 'update', id, payload: data, ts: Date.now() });
    },
    [mutate],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      mutate({ op: 'delete', id, ts: Date.now() });
    },
    [mutate],
  );

  const value: SyncContextType = {
    events,
    initialLoading: !!token && lastSync === null && isSyncing && events.length === 0,
    error,
    isOnline: online,
    isSyncing,
    pendingCount,
    lastSync,
    createEvent,
    updateEvent,
    deleteEvent,
    syncNow,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
}
