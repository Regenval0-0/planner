import type { EventItem } from '../api/events.ts';

export function isEventOnDay(e: EventItem, day: Date): boolean {
  const start = new Date(e.startDate);
  start.setHours(0, 0, 0, 0);
  const end = e.endDate ? new Date(e.endDate) : new Date(start);
  end.setHours(23, 59, 59, 999);
  const d = new Date(day);
  d.setHours(12, 0, 0, 0);
  return d >= start && d <= end;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export function toTimeInput(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
