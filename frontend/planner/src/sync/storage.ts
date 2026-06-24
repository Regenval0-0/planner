export const STORAGE_KEYS = {
  EVENTS: 'planner_events',
  QUEUE: 'planner_queue',
  LAST_SYNC: 'planner_last_sync',
  USER: 'planner_user',
  TOKEN: 'token',
} as const;

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
    // storage full
  }
}

export function removeStored(key: string): void {
  localStorage.removeItem(key);
}

export function isOnline(): boolean {
  return navigator.onLine;
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
