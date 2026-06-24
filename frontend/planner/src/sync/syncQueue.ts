import { setStored, getStored, STORAGE_KEYS } from './storage.ts';
import type { EventItem, EventCreate } from '../api/events.ts';

export type PendingAction =
  | { op: 'create'; id: string; payload: EventCreate; ts: number }
  | { op: 'update'; id: string; payload: Partial<EventCreate>; ts: number }
  | { op: 'delete'; id: string; ts: number };

export function getQueue(): PendingAction[] {
  return getStored<PendingAction[]>(STORAGE_KEYS.QUEUE, []);
}

export function addToQueue(action: PendingAction): void {
  const q = getQueue();
  // Deduplicate: если уже есть update/create для того же id — заменяем
  const filtered = q.filter((a) => a.id !== action.id || a.op !== action.op);
  filtered.push(action);
  setStored(STORAGE_KEYS.QUEUE, filtered);
}

export function removeFromQueue(actionId: string, op: PendingAction['op']): void {
  const q = getQueue();
  setStored(
    STORAGE_KEYS.QUEUE,
    q.filter((a) => !(a.id === actionId && a.op === op))
  );
}

export function clearQueue(): void {
  setStored(STORAGE_KEYS.QUEUE, []);
}

export function getLocalEvents(): EventItem[] {
  return getStored<EventItem[]>(STORAGE_KEYS.EVENTS, []);
}

export function setLocalEvents(events: EventItem[]): void {
  setStored(STORAGE_KEYS.EVENTS, events);
}

export function upsertLocalEvent(event: EventItem): void {
  const events = getLocalEvents();
  const idx = events.findIndex((e) => e.id === event.id);
  if (idx >= 0) {
    events[idx] = event;
  } else {
    events.push(event);
  }
  // Sort by startDate
  events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  setLocalEvents(events);
}

export function deleteLocalEvent(id: string): void {
  const events = getLocalEvents().filter((e) => e.id !== id);
  setLocalEvents(events);
}

export function applyPendingToLocal(): void {
  const q = getQueue();
  const events = getLocalEvents();
  for (const action of q) {
    if (action.op === 'create') {
      // optimistic create with temp id
      const exists = events.find((e) => e.id === action.id);
      if (!exists) {
        events.push({
          id: action.id,
          userId: getStored<{ id: string }>(STORAGE_KEYS.USER, { id: '' }).id,
          title: action.payload.title || '',
          description: action.payload.description || null,
          startDate: action.payload.startDate,
          endDate: action.payload.endDate || null,
          type: action.payload.type,
          recurrence: action.payload.recurrence || null,
          recurrenceEnd: action.payload.recurrenceEnd || null,
          recurrenceInterval: action.payload.recurrenceInterval || null,
          amount: action.payload.amount ?? null,
          reminderMinutes: action.payload.reminderMinutes ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } else if (action.op === 'update') {
      const idx = events.findIndex((e) => e.id === action.id);
      if (idx >= 0) {
        events[idx] = { ...events[idx], ...action.payload, updatedAt: new Date().toISOString() };
      }
    } else if (action.op === 'delete') {
      const idx = events.findIndex((e) => e.id === action.id);
      if (idx >= 0) events.splice(idx, 1);
    }
  }
  events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  setLocalEvents(events);
}
