import { useMemo } from 'react';
import type { EventItem } from '../api/events.ts';
import { isSameDay, isEventOnDay, pad } from '../utils/date.ts';

interface Props {
  year: number;
  month: number; // 0-11
  /** Повторы уже раскрыты для видимого периода. */
  events: EventItem[];
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: EventItem) => void;
  onSelectWeek?: (weekStart: Date) => void;
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MAX_VISIBLE = 3;

const typeColors: Record<string, string> = {
  event: 'bg-blue-500',
  task: 'bg-green-500',
  meeting: 'bg-purple-500',
  payment: 'bg-orange-400',
};

function getISOWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function eventLabel(ev: EventItem, day: Date): string {
  const start = new Date(ev.startDate);
  const end = ev.endDate ? new Date(ev.endDate) : null;
  const isStart = isSameDay(start, day);
  const isEnd = end ? isSameDay(end, day) : isStart;
  const time = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const title = ev.title || (ev.type === 'payment' ? 'Платёж' : 'Без названия');

  if (ev.type === 'payment') {
    return ev.amount ? `${title} · ${ev.amount.toLocaleString('ru-RU')} ₽` : title;
  }
  if (ev.type === 'task') {
    if (isStart && isEnd) return title;
    if (isStart) return `→ ${title}`;
    if (isEnd) return `⊣ ${title}`;
    return `· ${title}`;
  }
  if (ev.type === 'meeting') {
    return end ? `${time(start)}–${time(end)} ${title}` : `${time(start)} ${title}`;
  }
  const allDayStart = start.getHours() === 0 && start.getMinutes() === 0;
  if (isStart && isEnd) return allDayStart ? title : `${time(start)} ${title}`;
  if (isStart) return allDayStart ? `→ ${title}` : `→ ${time(start)} ${title}`;
  if (isEnd) return `⊣ ${title}`;
  return `· ${title}`;
}

export default function CalendarGrid({ year, month, events, onSelectDate, onSelectEvent, onSelectWeek }: Props) {
  // Полные недели с понедельника, включая дни соседних месяцев.
  const weeks = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
    const result: Date[][] = [];
    for (let i = 0; i < totalCells; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      if (i % 7 === 0) result.push([]);
      result[result.length - 1].push(d);
    }
    return result;
  }, [year, month]);

  const today = new Date();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden select-none">
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        <div className="w-7 sm:w-12 flex-shrink-0 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-slate-700" />
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((d, idx) => (
            <div
              key={d}
              className={`py-2 text-center text-xs sm:text-sm font-medium bg-gray-50 dark:bg-slate-700 ${
                idx >= 5 ? 'text-[var(--color-primary)]' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {weeks.map((week) => {
        const monday = week[0];
        return (
          <div key={monday.toISOString()} className="flex">
            <button
              onClick={() => onSelectWeek?.(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()))}
              className="w-7 sm:w-12 flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-700 border-r border-b border-gray-200 dark:border-slate-700 text-[9px] sm:text-[10px] text-gray-400 hover:bg-[var(--color-primary-light)] dark:hover:bg-slate-600 hover:text-[var(--color-primary)] transition"
              title="Показать неделю"
              aria-label={`Неделя ${getISOWeek(monday)}`}
            >
              <span className="hidden sm:block opacity-70">нед</span>
              <span className="font-bold text-[10px] sm:text-xs">{getISOWeek(monday)}</span>
            </button>

            <div className="flex-1 grid grid-cols-7">
              {week.map((day, idx) => {
                const inMonth = day.getMonth() === month;
                const isToday = isSameDay(day, today);
                const isWeekend = idx >= 5;
                const dayEvents = events
                  .filter((e) => isEventOnDay(e, day))
                  .sort((a, b) => {
                    if (a.type === 'payment' && b.type !== 'payment') return 1;
                    if (a.type !== 'payment' && b.type === 'payment') return -1;
                    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                  });
                const visible = dayEvents.slice(0, MAX_VISIBLE);
                const hidden = dayEvents.length - visible.length;

                return (
                  <div
                    key={idx}
                    onClick={() => onSelectDate(day)}
                    className={`min-h-[64px] sm:min-h-[110px] p-1 sm:p-2 border-r border-b border-gray-100 dark:border-slate-700 cursor-pointer transition-colors overflow-hidden ${
                      isToday
                        ? 'bg-[var(--color-primary-light)]/40 dark:bg-[var(--color-primary)]/10'
                        : !inMonth
                          ? 'bg-gray-50/60 dark:bg-slate-900/40'
                          : isWeekend
                            ? 'bg-gray-50/30 dark:bg-slate-700/20 hover:bg-[var(--color-primary-light)]/30'
                            : 'hover:bg-[var(--color-primary-light)]/30 dark:hover:bg-slate-700/40'
                    }`}
                  >
                    <div
                      className={`text-xs sm:text-sm font-medium mb-1 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-[var(--color-primary)] text-white'
                          : !inMonth
                            ? 'text-gray-300 dark:text-slate-600'
                            : isWeekend
                              ? 'text-[var(--color-primary)]'
                              : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {day.getDate()}
                    </div>

                    {/* Телефон: цветные полоски */}
                    <div className="flex flex-col gap-0.5 sm:hidden">
                      {visible.map((ev) => (
                        <span key={ev.id} className={`block h-1.5 rounded-full ${typeColors[ev.type] || 'bg-gray-400'} ${inMonth ? '' : 'opacity-40'}`} />
                      ))}
                      {hidden > 0 && <span className="text-[9px] leading-none text-gray-400">+{hidden}</span>}
                    </div>

                    {/* ПК и планшет: подписи */}
                    <div className="hidden sm:block space-y-1">
                      {visible.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(ev);
                          }}
                          className={`block w-full text-left text-xs px-2 py-0.5 rounded truncate hover:opacity-90 text-white ${
                            typeColors[ev.type] || 'bg-gray-500'
                          } ${inMonth ? '' : 'opacity-50'}`}
                          title={eventLabel(ev, day)}
                        >
                          {eventLabel(ev, day)}
                          {ev.recurrence ? ' ↻' : ''}
                        </button>
                      ))}
                      {hidden > 0 && <div className="text-[11px] text-gray-500 dark:text-gray-400 px-1">ещё {hidden}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
