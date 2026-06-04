import { useMemo } from 'react';
import type { EventItem } from '../api/events.ts';

interface Props {
  year: number;
  month: number; // 0-11
  events: EventItem[];
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: EventItem) => void;
  onSelectWeek?: (weekStart: Date) => void;
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const typeColors: Record<string, string> = {
  event: 'bg-blue-500',
  task: 'bg-green-500',
  meeting: 'bg-purple-500',
  payment: 'bg-orange-300',
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
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

function getISOWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function RecurrenceIcon() {
  return (
    <svg className="inline w-3 h-3 ml-0.5 -mt-0.5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export default function CalendarGrid({ year, month, events, onSelectDate, onSelectEvent, onSelectWeek }: Props) {
  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Monday start
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const today = new Date();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden select-none">
      {/* Заголовок дней недели */}
      <div className="flex border-b border-gray-200">
        <div className="w-10 sm:w-12 flex-shrink-0 bg-gray-50 border-r border-gray-200" />
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((d, idx) => (
            <div
              key={d}
              className={`py-2 text-center text-sm font-medium bg-gray-50 ${idx >= 5 ? 'text-indigo-500' : 'text-gray-500'}`}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        {weeks.map((week, weekIdx) => {
          const firstDay = week.find(Boolean);
          const weekNum = firstDay ? getISOWeek(firstDay) : '-';
          const handleWeekClick = () => {
            if (firstDay && onSelectWeek) {
              const ws = new Date(firstDay);
              ws.setHours(0, 0, 0, 0);
              onSelectWeek(ws);
            }
          };
          return (
            <div key={weekIdx} className="flex group">
              {/* Левая полоска недели */}
              <button
                onClick={handleWeekClick}
                className="w-10 sm:w-12 flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 border-r border-b border-gray-200 text-[9px] sm:text-[10px] text-gray-400 hover:bg-indigo-100 hover:text-indigo-700 active:bg-indigo-200 transition cursor-pointer select-none"
                title="Посмотреть неделю"
              >
                <span className="opacity-70">нед</span>
                <span className="font-bold text-[10px] sm:text-xs">{weekNum}</span>
              </button>

              {/* 7 дней */}
              <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                {week.map((day, idx) => {
                  if (!day) {
                    return <div key={idx} className="min-h-[110px] bg-gray-50/50 border-r border-b border-gray-100 select-none" />;
                  }

                  const isToday = isSameDay(day, today);
                  const isWeekend = idx % 7 >= 5;
                  const dayEvents = events.filter((e) => isEventOnDay(e, day));
                  const pad = (n: number) => n.toString().padStart(2, '0');

                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectDate(day)}
                      className={`min-h-[110px] p-2 border-r border-b border-gray-100 cursor-pointer transition select-none ${
                        isToday ? 'bg-indigo-50/40' : isWeekend ? 'bg-gray-50/30' : 'hover:bg-indigo-50/30'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : isWeekend ? 'text-indigo-500' : 'text-gray-700'}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents
                          .filter((ev) => ev.type !== 'payment')
                          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                          .map((ev) => {
                            const evStart = new Date(ev.startDate);
                            const evEnd = ev.endDate ? new Date(ev.endDate) : null;
                            const isStart = isSameDay(evStart, day);
                            const isEnd = evEnd ? isSameDay(evEnd, day) : isStart;
                            const isMiddle = !isStart && !isEnd;

                            let label = ev.title;
                            if (ev.type === 'task') {
                              if (isStart && isEnd) label = ev.title;
                              else if (isStart) label = `→ ${ev.title}`;
                              else if (isEnd) label = `⊣ ${ev.title}`;
                              else label = `· ${ev.title}`;
                            } else if (ev.type === 'meeting') {
                              const timeStr = `${pad(evStart.getHours())}:${pad(evStart.getMinutes())}`;
                              const endTimeStr = evEnd ? `${pad(evEnd.getHours())}:${pad(evEnd.getMinutes())}` : '';
                              if (endTimeStr) {
                                label = `${timeStr}–${endTimeStr} ${ev.title}`;
                              } else {
                                label = `${timeStr} ${ev.title}`;
                              }
                            } else {
                              const timeStr = `${pad(evStart.getHours())}:${pad(evStart.getMinutes())}`;
                              const endTimeStr = evEnd ? `${pad(evEnd.getHours())}:${pad(evEnd.getMinutes())}` : '';
                              if (isStart && isEnd) label = `${timeStr} ${ev.title}`;
                              else if (isStart) label = `→ ${timeStr} ${ev.title}`;
                              else if (isEnd) label = `⊣ ${endTimeStr} ${ev.title}`;
                              else label = `· ${ev.title}`;
                            }

                            return (
                              <button
                                key={ev.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectEvent(ev);
                                }}
                                className={`block w-full text-left text-xs px-2 py-0.5 rounded truncate hover:opacity-90 transition select-none ${
                                  isMiddle ? 'opacity-80' : ''
                                } text-white ${typeColors[ev.type] || 'bg-gray-500'}`}
                                title={ev.title}
                              >
                                {label}
                                {(ev.recurrence || ev.isRecurrenceInstance) && <RecurrenceIcon />}
                              </button>
                            );
                          })}
                      </div>
                      {(() => {
                        const payments = dayEvents
                          .filter((ev) => ev.type === 'payment')
                          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                        if (payments.length === 0) return null;
                        return (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {payments.map((ev) => (
                              <button
                                key={ev.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectEvent(ev);
                                }}
                                className="w-2 h-2 rounded-sm bg-orange-300 hover:bg-orange-400 transition select-none"
                                title={`${ev.title || 'Платёж'}${ev.amount ? ` — ${ev.amount.toLocaleString('ru-RU')} ₽` : ''}`}
                              />
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
