import type { EventItem, EventCreate } from '../api/events.ts';

// Чистые функции очереди офлайн-изменений (без обращения к хранилищу) — их легко тестировать.

export type PendingAction =
  | { op: 'create'; id: string; payload: EventCreate; ts: number }
  | { op: 'update'; id: string; payload: Partial<EventCreate>; ts: number }
  | { op: 'delete'; id: string; ts: number };

/**
 * Добавляет действие в очередь, схлопывая лишнее:
 * - изменение ещё не отправленного события дописывается в его создание;
 * - удаление ещё не отправленного события просто убирает его из очереди;
 * - несколько изменений одного события объединяются.
 */
export function enqueue(queue: PendingAction[], action: PendingAction): PendingAction[] {
  const pendingCreate = queue.find((a) => a.op === 'create' && a.id === action.id) as
    | Extract<PendingAction, { op: 'create' }>
    | undefined;

  if (action.op === 'create') {
    return [...queue.filter((a) => a.id !== action.id), action];
  }

  if (action.op === 'update') {
    if (pendingCreate) {
      return queue.map((a) =>
        a === pendingCreate ? { ...pendingCreate, payload: { ...pendingCreate.payload, ...action.payload }, ts: action.ts } : a,
      );
    }
    const pendingUpdate = queue.find((a) => a.op === 'update' && a.id === action.id) as
      | Extract<PendingAction, { op: 'update' }>
      | undefined;
    if (pendingUpdate) {
      return queue.map((a) =>
        a === pendingUpdate ? { ...pendingUpdate, payload: { ...pendingUpdate.payload, ...action.payload }, ts: action.ts } : a,
      );
    }
    return [...queue, action];
  }

  // delete
  const withoutEvent = queue.filter((a) => a.id !== action.id);
  if (pendingCreate) return withoutEvent;
  return [...withoutEvent, action];
}

export function removeAction(queue: PendingAction[], action: PendingAction): PendingAction[] {
  return queue.filter((a) => !(a.id === action.id && a.op === action.op && a.ts === action.ts));
}

function sortByStart(events: EventItem[]): EventItem[] {
  return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

/** Список событий с учётом ещё не отправленных изменений. */
export function applyQueue(serverEvents: EventItem[], queue: PendingAction[], userId: string): EventItem[] {
  const map = new Map<string, EventItem>();
  for (const e of serverEvents) map.set(e.id, e);
  const now = new Date().toISOString();

  for (const action of queue) {
    if (action.op === 'create') {
      const p = action.payload;
      map.set(action.id, {
        id: action.id,
        userId,
        title: p.title || '',
        description: p.description ?? null,
        startDate: p.startDate,
        endDate: p.endDate ?? null,
        type: p.type,
        recurrence: p.recurrence ?? null,
        recurrenceEnd: p.recurrenceEnd ?? null,
        recurrenceInterval: p.recurrenceInterval ?? null,
        amount: p.amount ?? null,
        reminderMinutes: p.reminderMinutes ?? null,
        createdAt: now,
        updatedAt: now,
      });
    } else if (action.op === 'update') {
      const existing = map.get(action.id);
      if (existing) map.set(action.id, { ...existing, ...action.payload, updatedAt: now });
    } else {
      map.delete(action.id);
    }
  }
  return sortByStart(Array.from(map.values()));
}

/** Обновить снимок серверных данных после успешной отправки действия. */
export function applyServerResult(
  serverEvents: EventItem[],
  action: PendingAction,
  result: EventItem | null,
): EventItem[] {
  if (action.op === 'delete') return serverEvents.filter((e) => e.id !== action.id);
  if (!result) return serverEvents;
  const rest = serverEvents.filter((e) => e.id !== result.id);
  return sortByStart([...rest, result]);
}
