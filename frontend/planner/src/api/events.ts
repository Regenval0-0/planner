import { api } from './client.ts';

export type EventType = 'event' | 'task' | 'meeting' | 'payment';
export type RecurrenceType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom';

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
  isRecurrenceInstance?: boolean;
  originId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  type: EventType;
  recurrence?: RecurrenceType;
  recurrenceEnd?: string;
  recurrenceInterval?: number;
  amount?: number;
  reminderMinutes?: number;
}

export async function fetchEvents(month: number, year: number): Promise<EventItem[]> {
  const res = await api.get('/events', { params: { month, year } });
  return res.data;
}

export async function createEvent(data: EventCreate): Promise<EventItem> {
  const res = await api.post('/events', data);
  return res.data;
}

export async function updateEvent(id: string, data: Partial<EventCreate>): Promise<EventItem> {
  const res = await api.put(`/events/${id}`, data);
  return res.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`);
}
