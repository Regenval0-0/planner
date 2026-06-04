import { CalendarItem, CalendarItemInsert, CalendarItemUpdate } from './types.js';

// Safe localStorage wrapper
const storage = {
  getItem(key: string): string | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch {
      console.warn('[storage] getItem failed for key:', key);
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, value);
    } catch {
      console.warn('[storage] setItem failed for key:', key);
    }
  },
  removeItem(key: string) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch {
      console.warn('[storage] removeItem failed for key:', key);
    }
  },
};

// UUID generator
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

// LocalStorage keys
const ITEMS_KEY = 'planner_items';
const USERS_KEY = 'planner_users';
const SESSION_KEY = 'planner_session';

function getItems(): CalendarItem[] {
  const raw = storage.getItem(ITEMS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CalendarItem[];
  } catch {
    return [];
  }
}

function setItems(items: CalendarItem[]) {
  storage.setItem(ITEMS_KEY, JSON.stringify(items));
  broadcastChange();
}

function broadcastChange() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('planner-items-changed'));
  } catch (e) {
    console.warn('[broadcast] CustomEvent failed:', e);
  }
  if ('BroadcastChannel' in window) {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('planner-items-changed');
      bc.postMessage('changed');
    } catch (e) {
      console.warn('[broadcast] BroadcastChannel post failed:', e);
    } finally {
      try {
        bc?.close();
      } catch {
        // ignore
      }
    }
  }
}

function getUsers(): Array<{ id: string; email: string; password: string }> {
  const raw = storage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Array<{ id: string; email: string; password: string }>;
  } catch {
    return [];
  }
}

function setUsers(users: Array<{ id: string; email: string; password: string }>) {
  storage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): { user: { id: string; email: string } } | null {
  const raw = storage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { user: { id: string; email: string } };
  } catch {
    return null;
  }
}

function writeSession(session: { user: { id: string; email: string } } | null) {
  if (session) {
    storage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    storage.removeItem(SESSION_KEY);
  }
}

// Backwards compat stubs
export function initSupabase(_url: string, _key: string) {
  // No-op for local storage mode
}

export function getSupabase(): any {
  return null;
}

// Calendar Items API (local)
export async function fetchCalendarItems(userId: string): Promise<CalendarItem[]> {
  const items = getItems().filter((i) => i.user_id === userId);
  items.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  return items;
}

export async function createCalendarItem(item: CalendarItemInsert): Promise<CalendarItem> {
  const newItem: CalendarItem = {
    ...item,
    id: generateId(),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  const items = getItems();
  items.push(newItem);
  setItems(items);
  return newItem;
}

export async function updateCalendarItem(id: string, changes: CalendarItemUpdate): Promise<CalendarItem> {
  const items = getItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('Item not found');
  items[idx] = { ...items[idx], ...changes, updated_at: nowIso() };
  setItems(items);
  return items[idx];
}

export async function deleteCalendarItem(id: string): Promise<void> {
  const items = getItems().filter((i) => i.id !== id);
  setItems(items);
}

export function subscribeToCalendarItems(userId: string, callback: (items: CalendarItem[]) => void) {
  const handler = () => {
    fetchCalendarItems(userId).then(callback);
  };
  window.addEventListener('planner-items-changed', handler);

  let bc: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    bc = new BroadcastChannel('planner-items-changed');
    bc.onmessage = handler;
  }

  // Initial fetch
  fetchCalendarItems(userId).then(callback);
  return {
    unsubscribe: () => {
      window.removeEventListener('planner-items-changed', handler);
      bc?.close();
    },
  };
}

// Auth helpers (local)
export async function signUp(email: string, password: string): Promise<{ user: { id: string; email: string }; session: { user: { id: string; email: string } } }> {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error('Пользователь с таким email уже существует');
  }
  const user = { id: generateId(), email, password };
  users.push(user);
  setUsers(users);
  const session = { user: { id: user.id, email: user.email } };
  writeSession(session);
  return { user: session.user, session };
}

export async function signIn(email: string, password: string): Promise<{ user: { id: string; email: string }; session: { user: { id: string; email: string } } }> {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Неверный email или пароль');
  }
  const session = { user: { id: user.id, email: user.email } };
  writeSession(session);
  return { user: session.user, session };
}

export async function signOut(): Promise<void> {
  writeSession(null);
}

export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  const session = readSession();
  return session?.user ?? null;
}

export async function getSession(): Promise<{ user: { id: string; email: string } } | null> {
  return readSession();
}

export const supabase = null;
export type { CalendarItem, CalendarItemInsert, CalendarItemUpdate };
