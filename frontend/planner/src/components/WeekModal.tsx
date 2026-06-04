import { useState, useMemo } from 'react';
import type { EventItem } from '../api/events.ts';

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

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isEventOnDay(e: EventItem, day: Date) {
  const start = new Date(e.startDate);
  start.setHours(0, 0, 0, 0);
  const end = e.endDate ? new Date(e.endDate) : new Date(start);
  end.setHours(23, 59, 59, 999);
  const d = new Date(day);
  d.setHours(12, 0, 0, 0);
  return d >= start && d <= end;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

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
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-h-[90vh] flex flex-col">
        {/* Заголовок + навигация */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            {weekDaysList[0].getDate()}–{weekDaysList[6].getDate()} {monthNames[weekDaysList[6].getMonth()]} {weekDaysList[6].getFullYear()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none select-none px-2">×</button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setOffset((o) => o - 1)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition select-none"
          >
            ← Назад
          </button>
          <button
            onClick={() => setOffset(0)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition select-none"
          >
            Текущая
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition select-none"
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
              <div key={day.toISOString()} className={`border rounded-lg ${isToday ? 'border-indigo-200 bg-indigo-50/20' : 'border-gray-200'}`}>
                {/* Шапка дня */}
                <div className={`flex items-center justify-between px-3 py-2 border-b ${isToday ? 'border-indigo-200 bg-indigo-50/40' : 'border-gray-100 bg-gray-50/50'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isToday ? 'text-indigo-700' : 'text-gray-700'}`}>
                      {weekDaysShort[idx]}, {day.getDate()} {monthNames[day.getMonth()]}
                    </span>
                    {isToday && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">Сегодня</span>}
                  </div>
                  <button
                    onClick={() => onCreate(day)}
                    className="text-xs px-2 py-1 bg-white text-indigo-600 rounded border border-gray-200 hover:bg-indigo-50 transition select-none"
                  >
                    + Добавить
                  </button>
                </div>

                {/* События */}
                <div className="p-2 space-y-1.5">
                  {dayEvents.length === 0 && (
                    <div className="text-xs text-gray-400 py-2 text-center">Нет планов</div>
                  )}

                  {others.map((ev) => {
                    const colorMap: Record<string, string> = {
                      event: 'bg-blue-50 border-blue-200 text-blue-800',
                      task: 'bg-green-50 border-green-200 text-green-800',
                      meeting: 'bg-purple-50 border-purple-200 text-purple-800',
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
                        className={`w-full text-left p-2 rounded-lg border transition hover:brightness-95 select-none ${colorMap[ev.type] || 'bg-gray-50 border-gray-200 text-gray-800'}`}
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
                    <div className="mt-1 pt-1 border-t border-orange-100">
                      <div className="text-[10px] text-orange-600 font-medium mb-1">💰 {payments.length} платёж{payments.length > 1 ? 'а' : ''}</div>
                      {payments.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => onSelectEvent(ev)}
                          className="w-full text-left p-1.5 rounded bg-orange-50 text-orange-700 hover:bg-orange-100 transition select-none mb-1"
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
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
            <span className="text-sm text-gray-600">💰 Платежи за неделю</span>
            <span className="text-lg font-bold text-orange-700">{fmt(paymentsTotal)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
