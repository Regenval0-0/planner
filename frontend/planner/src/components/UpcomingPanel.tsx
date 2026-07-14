import { useState } from 'react';
import type { EventItem } from '../api/events.ts';
import { isSameDay, pad, toDateInput } from '../utils/date.ts';

interface Props {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

const typeColors: Record<string, string> = {
  event: 'border-l-blue-500',
  task: 'border-l-green-500',
  meeting: 'border-l-purple-500',
};

const recurrenceLabels: Record<string, string> = {
  daily: 'Каждый день',
  weekly: 'Каждую неделю',
  biweekly: 'Раз в 2 недели',
  monthly: 'Каждый месяц',
  yearly: 'Каждый год',
  custom: 'Каждые N дней',
};

function openPicker(e: React.MouseEvent<HTMLInputElement>) {
  e.currentTarget.showPicker?.();
}

function preventSelect(e: React.MouseEvent<HTMLInputElement>) {
  e.preventDefault();
}

export default function UpcomingPanel({ events, onSelectEvent }: Props) {
  const now = new Date();
  const in7days = new Date();
  in7days.setDate(now.getDate() + 7);

  const todayStr = toDateInput(now.toISOString());

  const [toDate, setToDate] = useState(toDateInput(in7days.toISOString()));

  const upcoming = events
    .filter((e) => e.type !== 'payment')
    .filter((e) => {
      const start = new Date(e.startDate);
      const end = e.endDate ? new Date(e.endDate) : start;
      const rangeEnd = toDate ? new Date(toDate) : in7days;
      rangeEnd.setHours(23, 59, 59, 999);
      return end >= now && start <= rangeEnd;
    })
    .sort((a, b) => {
      const aKey = a.type === 'task' && a.endDate ? new Date(a.endDate).getTime() : new Date(a.startDate).getTime();
      const bKey = b.type === 'task' && b.endDate ? new Date(b.endDate).getTime() : new Date(b.startDate).getTime();
      return aKey - bKey;
    });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 select-none transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide transition-colors">Ближайшие события</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500 transition-colors">{upcoming.length}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 transition-colors">С (сегодня)</label>
          <input
            type="date"
            value={todayStr}
            readOnly
            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-default select-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 transition-colors">По</label>
          <input
            type="date"
            value={toDate}
            min={todayStr}
            onClick={openPicker}
            onMouseDown={preventSelect}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
          />
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-4 transition-colors">Нет событий в выбранном диапазоне</div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {upcoming.map((ev) => {
            const isTask = ev.type === 'task';
            const displayDate = isTask && ev.endDate ? new Date(ev.endDate) : new Date(ev.startDate);
            const isToday = isSameDay(displayDate, now);
            const dateLabel = isToday
              ? 'Сегодня'
              : `${pad(displayDate.getDate())}.${pad(displayDate.getMonth() + 1)}`;

            const start = new Date(ev.startDate);
            const end = ev.endDate ? new Date(ev.endDate) : null;

            let timeLabel = '';
            if (ev.type === 'meeting') {
              const timeStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
              if (end) {
                const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
                timeLabel = `, ${timeStr}–${endStr}`;
              } else {
                timeLabel = `, ${timeStr}`;
              }
            } else if (ev.type === 'event') {
              timeLabel = `, ${pad(start.getHours())}:${pad(start.getMinutes())}`;
            }

            return (
              <button
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`w-full text-left border-l-4 ${typeColors[ev.type] || 'border-l-gray-500'} bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-r-lg p-2 transition select-none transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate transition-colors">{ev.title}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2 transition-colors">
                    {isTask && end ? (
                      <>{dateLabel} (дедлайн){timeLabel}</>
                    ) : (
                      <>{dateLabel}{timeLabel}</>
                    )}
                  </span>
                </div>
                {(ev.recurrence || ev.isRecurrenceInstance) && (
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[var(--color-primary)] dark:text-[var(--color-primary-light)] transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>
                      {ev.isRecurrenceInstance
                        ? 'Повторяющееся'
                        : ev.recurrence === 'custom' && ev.recurrenceInterval
                          ? `Каждые ${ev.recurrenceInterval} дней`
                          : ev.recurrence
                            ? recurrenceLabels[ev.recurrence] || ev.recurrence
                            : 'Повторяющееся'}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
