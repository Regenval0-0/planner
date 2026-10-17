import type { EventItem, RecurrenceType } from '../api/events.ts';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_OCCURRENCES = 2000;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Дата n-го повтора (n = 0 — исходная дата), в местном времени.
 * Ежемесячные и ежегодные повторы привязаны к исходному числу: 31 января →
 * 28/29 февраля → 31 марта (дата не «сползает»).
 */
export function nthOccurrence(start: Date, recurrence: RecurrenceType, n: number, interval?: number | null): Date {
  const d = new Date(start);
  switch (recurrence) {
    case 'daily':
      d.setDate(d.getDate() + n);
      return d;
    case 'weekly':
      d.setDate(d.getDate() + 7 * n);
      return d;
    case 'biweekly':
      d.setDate(d.getDate() + 14 * n);
      return d;
    case 'custom':
      d.setDate(d.getDate() + Math.max(1, interval || 1) * n);
      return d;
    case 'monthly': {
      const total = start.getMonth() + n;
      const year = start.getFullYear() + Math.floor(total / 12);
      const month = ((total % 12) + 12) % 12;
      d.setFullYear(year, month, Math.min(start.getDate(), daysInMonth(year, month)));
      return d;
    }
    case 'yearly': {
      const year = start.getFullYear() + n;
      d.setFullYear(year, start.getMonth(), Math.min(start.getDate(), daysInMonth(year, start.getMonth())));
      return d;
    }
  }
}

/** Примерный шаг повтора в днях — чтобы быстро перескочить к нужному периоду. */
function approxStepDays(recurrence: RecurrenceType, interval?: number | null): number {
  switch (recurrence) {
    case 'daily': return 1;
    case 'weekly': return 7;
    case 'biweekly': return 14;
    case 'custom': return Math.max(1, interval || 1);
    case 'monthly': return 28;
    case 'yearly': return 365;
  }
}

/** Ключ дня повтора (местная дата) — входит в id повтора. */
export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Раскрывает повторяющиеся события в конкретные повторы, которые пересекаются
 * с периодом [from, to]. Обычные события, пересекающиеся с периодом, возвращаются как есть.
 */
export function expandEvents(events: EventItem[], from: Date, to: Date): EventItem[] {
  const result: EventItem[] = [];
  const fromMs = from.getTime();
  const toMs = to.getTime();

  for (const ev of events) {
    const start = new Date(ev.startDate);
    const end = ev.endDate ? new Date(ev.endDate) : null;
    const duration = end ? Math.max(0, end.getTime() - start.getTime()) : 0;

    if (!ev.recurrence) {
      const s = start.getTime();
      const e = s + duration;
      if (e >= fromMs && s <= toMs) result.push(ev);
      continue;
    }

    const until = ev.recurrenceEnd ? new Date(ev.recurrenceEnd).getTime() : Infinity;
    const step = approxStepDays(ev.recurrence, ev.recurrenceInterval);
    // Начинаем чуть раньше нужного периода, чтобы не перебирать повторы с самого начала.
    let n = Math.max(0, Math.floor((fromMs - duration - start.getTime()) / (step * DAY_MS)) - 2);
    let count = 0;
    while (count < MAX_OCCURRENCES) {
      const occStart = nthOccurrence(start, ev.recurrence, n, ev.recurrenceInterval);
      const s = occStart.getTime();
      if (s > toMs || s > until) break;
      if (s + duration >= fromMs) {
        result.push({
          ...ev,
          id: n === 0 ? ev.id : `${ev.id}@${dayKey(occStart)}`,
          startDate: occStart.toISOString(),
          endDate: end ? new Date(s + duration).toISOString() : null,
          isRecurrenceInstance: n !== 0,
          originId: ev.id,
        });
      }
      n++;
      count++;
    }
  }

  return result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

/** id исходного события для повтора (или само событие). */
export function originIdOf(ev: EventItem): string {
  return ev.originId || ev.id;
}

/** Границы видимой сетки месяца (с понедельника первой недели по воскресенье последней). */
export function monthGridRange(year: number, month: number): { from: Date; to: Date } {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const from = new Date(year, month, 1 - offset, 0, 0, 0, 0);
  const last = new Date(year, month + 1, 0);
  const tail = 6 - ((last.getDay() + 6) % 7);
  const to = new Date(year, month + 1, tail, 23, 59, 59, 999);
  return { from, to };
}
