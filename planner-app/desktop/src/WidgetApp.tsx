import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCalendarItems } from './hooks/useCalendarItems';
import { CalendarItemType } from '@planner/shared';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isTomorrow(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

function getRelativeLabel(iso: string) {
  if (isToday(iso)) return 'Сегодня';
  if (isTomorrow(iso)) return 'Завтра';
  return formatDate(iso);
}

function typeLabel(type: CalendarItemType) {
  switch (type) {
    case 'task': return 'Задача';
    case 'event': return 'Событие';
    case 'meeting': return 'Встреча';
  }
}

function typeColor(type: CalendarItemType) {
  switch (type) {
    case 'task': return 'bg-amber-400';
    case 'event': return 'bg-sky-400';
    case 'meeting': return 'bg-emerald-400';
  }
}

export default function WidgetApp() {
  const { user } = useAuth();
  const { items } = useCalendarItems(user?.id || null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Upcoming items sorted by start_date
  const upcoming = [...items]
    .filter((i) => i.status !== 'cancelled')
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 8);

  // Send upcoming to main for notifications
  useEffect(() => {
    if (!window.electronAPI || !user) return;
    const pending = upcoming
      .filter((i) => i.status === 'pending')
      .map((i) => ({ id: i.id, title: i.title, start_date: i.start_date, type: i.type }));
    window.electronAPI.setUpcomingItems(pending);
  }, [upcoming, user]);

  return (
    <div className="widget-glass rounded-xl shadow-lg overflow-hidden select-none">
      <div className="px-4 py-3 bg-planner-500 text-white">
        <div className="flex items-center justify-between">
          <div className="text-xs opacity-80">{now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <div className="text-xs opacity-90">{upcoming.length} дел</div>
        </div>
        <div className="text-2xl font-bold tabular-nums">{now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      <div className="max-h-[380px] overflow-y-auto px-3 py-2 space-y-2">
        {upcoming.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-4">Нет ближайших дел</div>
        )}

        {upcoming.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg px-3 py-2 border-l-4 bg-white/60 ${
              item.status === 'completed' ? 'opacity-50 border-gray-300' : 'border-planner-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${typeColor(item.type)}`}></div>
              <span className="text-[10px] uppercase tracking-wide text-gray-500">{typeLabel(item.type)}</span>
              <span className="text-[10px] text-gray-400 ml-auto">{getRelativeLabel(item.start_date)}</span>
            </div>
            <div className="text-sm font-medium text-gray-800 mt-0.5 truncate">{item.title}</div>
            {item.end_date && (
              <div className="text-[10px] text-gray-400">
                {formatTime(item.start_date)} — {formatTime(item.end_date)}
              </div>
            )}
            {!item.end_date && (
              <div className="text-[10px] text-gray-400">{formatTime(item.start_date)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
