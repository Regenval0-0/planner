export const STORAGE_KEYS = {
  /** Последний полученный с сервера список событий. */
  SERVER_EVENTS: 'planner_server_events',
  /** Изменения, ещё не отправленные на сервер. */
  QUEUE: 'planner_queue',
  LAST_SYNC: 'planner_last_sync',
  USER: 'planner_user',
} as const;

/** Ключи прежних версий — удаляются при выходе. */
const LEGACY_KEYS = ['planner_events'];

export function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // хранилище переполнено или недоступно
  }
}

export function removeStored(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Удалить все локальные данные пользователя (при выходе или удалении аккаунта). */
export function clearUserData() {
  for (const key of [...Object.values(STORAGE_KEYS), ...LEGACY_KEYS]) removeStored(key);
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine !== false;
}

export function listenOnline(callback: (online: boolean) => void) {
  const on = () => callback(true);
  const off = () => callback(false);
  window.addEventListener('online', on);
  window.addEventListener('offline', off);
  return () => {
    window.removeEventListener('online', on);
    window.removeEventListener('offline', off);
  };
}
