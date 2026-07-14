import { useState, useMemo } from 'react';
import type { EventItem } from '../api/events.ts';
import { isSameDay, isEventOnDay, pad } from '../utils/date.ts';

interface Props {
  isOpen: boolean;
  weekStart: Date | null;
  events: EventItem[];
  onClose: () => void;
  onSelectEvent: (event: EventItem) => void;
  onCreate: (date: Date) => void;
}

const weekDaysShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthNames = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

export default function WeekModal({ isOpen, weekStart, events, onClose, onSelectEvent, onCreate }: Props) {
  const [offset, setOffset] = useState(0);

  const baseWeek = useMemo(() => {
    if (!weekStart) return null;
    const d = new Date(weekStart);
    d.setDate(d.getDate() + offset * 7);
    return d;
  }, [weekStart, offset]);

  const weekDaysList = useMemo(() => {
    if (!baseWeek) return [];
    const list: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseWeek);
      d.setDate(baseWeek.getDate() + i);
      list.push(d);
    }
    return list;
  }, [baseWeek]);

  const weekEnd = useMemo(() => {
    if (!weekDaysList.length) return null;
    const d = new Date(weekDaysList[weekDaysList.length - 1]);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [weekDaysList]);

  const weekEvents = useMemo(() => {
    if (!baseWeek || !weekEnd) return [];
    return events.filter((e) => {
      const start = new Date(e.startDate);
      start.setHours(0, 0, 0, 0);
      const end = e.endDate ? new Date(e.endDate) : start;
      end.setHours(23, 59, 59, 999);
      return end >= baseWeek && start <= weekEnd;
    });
  }, [events, baseWeek, weekEnd]);

  const paymentsTotal = useMemo(() => {
    return weekEvents
      .filter((e) => e.type === 'payment')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [weekEvents]);

  if (!isOpen || !baseWeek || !weekDaysList.length) return null;

  const fmt = (n: number) => n.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
  const today = new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6 select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700 transition-colors">
        {/* Заголовок + навигация */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors">
            {weekDaysList[0].getDate()}–{weekDaysList[6].getDate()} {monthNames[weekDaysList[6].getMonth()]} {weekDaysList[6].getFullYear()}
          </h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none select-none px-2 transition-colors">×</button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setOffset((o) => o - 1)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg transition select-none transition-colors"
          >
            ← Назад
          </button>
          <button
            onClick={() => setOffset(0)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-[var(--color-primary-light)] dark:bg-slate-700 text-[var(--color-primary)] dark:text-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]/80 dark:hover:bg-slate-600 rounded-lg transition select-none"
          >
            Текущая
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg transition select-none transition-colors"
          >
            Вперёд →
          </button>
        </div>

        {/* Все события недели сразу */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
          {weekDaysList.map((day, idx) => {
            const dayEvents = weekEvents
              .filter((e) => isEventOnDay(e, day))
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            const isToday = isSameDay(day, today);
            const payments = dayEvents.filter((e) => e.type === 'payment');
            const others = dayEvents.filter((e) => e.type !== 'payment');

            return (
              <div key={day.toISOString()} className={`border rounded-lg transition-colors ${isToday ? 'border-[var(--color-primary-light)] dark:border-slate-600 bg-[var(--color-primary-light)]/10 dark:bg-slate-700/20' : 'border-gray-200 dark:border-slate-700'}`}>
                {/* Шапка дня */}
                <div className={`flex items-center justify-between px-3 py-2 border-b transition-colors ${isToday ? 'border-[var(--color-primary-light)] dark:border-slate-600 bg-[var(--color-primary-light)]/20 dark:bg-slate-700/30' : 'border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/20'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold transition-colors ${isToday ? 'text-[var(--color-primary)] dark:text-[var(--color-primary-light)]' : 'text-gray-700 dark:text-gray-200'}`}>
                      {weekDaysShort[idx]}, {day.getDate()} {monthNames[day.getMonth()]}
                    </span>
                    {isToday && <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-primary-light)] dark:bg-slate-600 text-[var(--color-primary)] dark:text-[var(--color-primary-light)] rounded-full font-medium transition-colors">Сегодня</span>}
                  </div>
                  <button
                    onClick={() => onCreate(day)}
                    className="text-xs px-2 py-1 bg-white dark:bg-slate-700 text-[var(--color-primary)] dark:text-[var(--color-primary-light)] rounded border border-gray-200 dark:border-slate-600 hover:bg-[var(--color-primary-light)]/40 dark:hover:bg-slate-600 transition select-none transition-colors"
                  >
                    + Добавить
                  </button>
                </div>

                {/* События */}
                <div className="p-2 space-y-1.5">
                  {dayEvents.length === 0 && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 py-2 text-center transition-colors">Нет планов</div>
                  )}

                  {others.map((ev) => {
                    const colorMap: Record<string, string> = {
                      event: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
                      task: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
                      meeting: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200',
                    };
                    const start = new Date(ev.startDate);
                    const end = ev.endDate ? new Date(ev.endDate) : null;

                    let timeLabel = '';
                    if (ev.type === 'meeting') {
                      timeLabel = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
                      if (end) timeLabel += `–${pad(end.getHours())}:${pad(end.getMinutes())}`;
                    } else if (ev.type === 'event') {
                      timeLabel = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
                    }

                    return (
                      <button
                        key={ev.id}
                        onClick={() => onSelectEvent(ev)}
                        className={`w-full text-left p-2 rounded-lg border transition hover:brightness-95 select-none transition-colors ${colorMap[ev.type] || 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-100'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{ev.title}</span>
                          {timeLabel && <span className="text-xs opacity-60">{timeLabel}</span>}
                        </div>
                        {(ev.recurrence || ev.isRecurrenceInstance) && (
                          <div className="text-[10px] opacity-50 mt-0.5">↻ повторяющееся</div>
                        )}
                      </button>
                    );
                  })}

                  {payments.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-orange-100 dark:border-orange-900/30 transition-colors">
                      <div className="text-[10px] text-orange-600 dark:text-orange-300 font-medium mb-1 transition-colors">💰 {payments.length} платёж{payments.length > 1 ? 'а' : ''}</div>
                      {payments.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => onSelectEvent(ev)}
                          className="w-full text-left p-1.5 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition select-none mb-1 transition-colors"
                          title={ev.title || 'Платёж'}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs truncate">{ev.title || 'Платёж'}</span>
                            {ev.amount && <span className="text-xs font-bold">{ev.amount.toLocaleString('ru-RU')} ₽</span>}
                          </div>
                          {(ev.recurrence || ev.isRecurrenceInstance) && (
                            <div className="text-[9px] opacity-60 mt-0.5">↻ повторяющийся</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Финансы */}
        {paymentsTotal > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0 transition-colors">
            <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">💰 Платежи за неделю</span>
            <span className="text-lg font-bold text-orange-700 dark:text-orange-400 transition-colors">{fmt(paymentsTotal)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
