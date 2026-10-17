import { api } from './client.ts';

export type EventType = 'event' | 'task' | 'meeting' | 'payment';
export type RecurrenceType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom';

/** Событие в том виде, как оно хранится (повторяющееся — одной записью). */
export interface EventItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  type: EventType;
  recurrence: RecurrenceType | null;
  recurrenceEnd: string | null;
  recurrenceInterval: number | null;
  amount: number | null;
  reminderMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  /** Заполнено у конкретного повтора повторяющегося события (см. utils/recurrence.ts). */
  isRecurrenceInstance?: boolean;
  /** id исходного (повторяющегося) события. */
  originId?: string | null;
}

/** Данные формы события. null — очистить поле. */
export interface EventCreate {
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  type: EventType;
  recurrence: RecurrenceType | null;
  recurrenceEnd: string | null;
  recurrenceInterval: number | null;
  amount: number | null;
  reminderMinutes: number | null;
}

export async function fetchAllEvents(): Promise<EventItem[]> {
  const res = await api().get<EventItem[]>('/events');
  return res.data;
}

export async function createEventApi(id: string, data: EventCreate): Promise<EventItem> {
  const res = await api().post<EventItem>('/events', { id, ...data });
  return res.data;
}

export async function updateEventApi(id: string, data: Partial<EventCreate>): Promise<EventItem> {
  const res = await api().put<EventItem>(`/events/${id}`, data);
  return res.data;
}

export async function deleteEventApi(id: string): Promise<void> {
  await api().delete(`/events/${id}`);
}
