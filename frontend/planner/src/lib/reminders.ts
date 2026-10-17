import { LocalNotifications } from '@capacitor/local-notifications';
import type { EventItem } from '../api/events.ts';
import { expandEvents } from '../utils/recurrence.ts';
import { isNative } from './platform.ts';

// Напоминания строятся из списка событий на устройстве, поэтому работают для
// событий, созданных на других устройствах, и для повторяющихся событий.
// Android: системные уведомления (приходят, даже если приложение закрыто).
// ПК: уведомления Windows, пока программа запущена (она живёт в трее).

const HORIZON_DAYS = 30;
const MAX_NATIVE = 60;

const typeNames: Record<string, string> = {
  event: 'Событие',
  task: 'Задача',
  meeting: 'Встреча',
  payment: 'Платёж',
};

interface Reminder {
  id: number;
  at: Date;
  title: string;
  body: string;
}

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return (h & 0x7fffffff) || 1;
}

export function describeLead(minutes: number): string {
  if (minutes <= 0) return 'начинается сейчас';
  if (minutes < 60) return `через ${minutes} мин`;
  if (minutes < 1440) return `через ${Math.round(minutes / 60)} ч`;
  if (minutes === 1440) return 'завтра';
  return `через ${Math.round(minutes / 1440)} дн.`;
}

export function buildReminders(events: EventItem[], now = new Date()): Reminder[] {
  const to = new Date(now.getTime() + HORIZON_DAYS * 86400000);
  const from = new Date(now.getTime() - 86400000);
  const list: Reminder[] = [];
  for (const occ of expandEvents(events.filter((e) => e.reminderMinutes != null), from, to)) {
    const minutes = occ.reminderMinutes ?? 0;
    const start = new Date(occ.startDate);
    const at = new Date(start.getTime() - minutes * 60000);
    if (at.getTime() <= now.getTime()) continue;
    const name = occ.title || typeNames[occ.type] || 'Событие';
    const amount = occ.type === 'payment' && occ.amount ? ` — ${occ.amount.toLocaleString('ru-RU')} ₽` : '';
    list.push({
      id: hashId(`${occ.id}|${minutes}`),
      at,
      title: name,
      body: `${typeNames[occ.type] || 'Событие'} ${describeLead(minutes)}${amount}`,
    });
  }
  return list.sort((a, b) => a.at.getTime() - b.at.getTime());
}

// ---------- Android ----------
let permissionAsked = false;

async function ensureNativePermission(): Promise<boolean> {
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display === 'granted') return true;
    if (permissionAsked) return false;
    permissionAsked = true;
    const res = await LocalNotifications.requestPermissions();
    return res.display === 'granted';
  } catch {
    return false;
  }
}

async function scheduleNative(reminders: Reminder[]) {
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
  }
  if (!reminders.length) return;
  if (!(await ensureNativePermission())) return;
  await LocalNotifications.schedule({
    notifications: reminders.slice(0, MAX_NATIVE).map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      schedule: { at: r.at, allowWhileIdle: true },
    })),
  });
}

// ---------- ПК / браузер ----------
const timers = new Map<number, ReturnType<typeof setTimeout>>();
const MAX_TIMEOUT = 2_000_000_000; // ~23 дня, предел setTimeout

function clearTimers() {
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
}

async function scheduleDesktop(reminders: Reminder[]) {
  clearTimers();
  if (!reminders.length || typeof Notification === 'undefined') return;
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch {
      return;
    }
  }
  if (Notification.permission !== 'granted') return;
  const now = Date.now();
  for (const r of reminders) {
    const delay = r.at.getTime() - now;
    if (delay <= 0 || delay > MAX_TIMEOUT) continue;
    timers.set(
      r.id,
      setTimeout(() => {
        timers.delete(r.id);
        try {
          new Notification(r.title, { body: r.body, tag: String(r.id) });
        } catch {
          // уведомления недоступны
        }
      }, delay),
    );
  }
}

let lastKey = '';

/** Пересчитать все напоминания по актуальному списку событий. */
export async function syncReminders(events: EventItem[]) {
  const reminders = buildReminders(events);
  const key = reminders.map((r) => `${r.id}:${r.at.getTime()}:${r.title}:${r.body}`).join('|');
  if (key === lastKey) return;
  lastKey = key;
  try {
    if (isNative()) await scheduleNative(reminders);
    else await scheduleDesktop(reminders);
  } catch (err) {
    lastKey = '';
    console.warn('Не удалось запланировать напоминания', err);
  }
}

export async function cancelAllReminders() {
  lastKey = '';
  clearTimers();
  if (!isNative()) return;
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    }
  } catch {
    // ignore
  }
}
