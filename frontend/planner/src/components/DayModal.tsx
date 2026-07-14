import { useState } from 'react';
import type { EventItem } from '../api/events.ts';
import ConfirmModal from './ConfirmModal.tsx';
import { isSameDay, pad } from '../utils/date.ts';

interface Props {
  isOpen: boolean;
  date: Date | null;
  events: EventItem[];
  onClose: () => void;
  onCreate: () => void;
  onEdit: (event: EventItem) => void;
  onDelete: (event: EventItem) => Promise<void>;
}

const typeLabels: Record<string, string> = {
  event: 'Событие',
  task: 'Задача',
  meeting: 'Встреча',
  payment: 'Платёж',
};

const typeColors: Record<string, string> = {
  event: 'bg-blue-500',
  task: 'bg-green-500',
  meeting: 'bg-purple-500',
  payment: 'bg-orange-300',
};

const recurrenceLabels: Record<string, string> = {
  daily: 'Каждый день',
  weekly: 'Каждую неделю',
  biweekly: 'Раз в 2 недели',
  monthly: 'Каждый месяц',
  yearly: 'Каждый год',
  custom: 'Каждые N дней',
};

export default function DayModal({ isOpen, date, events, onClose, onCreate, onEdit, onDelete }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmEvent, setConfirmEvent] = useState<EventItem | null>(null);

  if (!isOpen || !date) return null;

  const sorted = [...events].sort((a, b) => {
    if (a.type === 'payment' && b.type !== 'payment') return 1;
    if (a.type !== 'payment' && b.type === 'payment') return -1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  const dateStr = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-h-[80vh] flex flex-col border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors">События {dateStr}</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl select-none transition">×</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sorted.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8 transition-colors">Нет планов на этот день</div>
          ) : (
            sorted.map((ev) => {
              const start = new Date(ev.startDate);
              const end = ev.endDate ? new Date(ev.endDate) : null;

              const isStart = isSameDay(start, date);
              const isEnd = end ? isSameDay(end, date) : isStart;

              let rangeText = '';
              if (end && !isSameDay(start, end)) {
                rangeText = `${pad(start.getDate())}.${pad(start.getMonth()+1)} – ${pad(end.getDate())}.${pad(end.getMonth()+1)}`;
              }

              let timeLabel: string;
              if (ev.type === 'task') {
                timeLabel = isStart ? 'старт' : isEnd ? 'дедлайн' : '·';
              } else if (ev.type === 'meeting') {
                const timeStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
                if (end) {
                  const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
                  timeLabel = `${timeStr}–${endStr}`;
                } else {
                  timeLabel = timeStr;
                }
              } else if (ev.type === 'payment') {
                timeLabel = isStart && isEnd ? '' : isStart ? 'с' : isEnd ? 'по' : '·';
              } else {
                const timeStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
                timeLabel = isStart && isEnd ? timeStr : isStart ? `с ${timeStr}` : isEnd ? 'окончание' : '·';
              }

              return (
                <div
                  key={ev.id}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${typeColors[ev.type] || 'bg-gray-500'}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{typeLabels[ev.type] || ev.type}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto transition-colors">{timeLabel}</span>
                  </div>
                  <div className="font-medium text-gray-800 dark:text-gray-100 text-sm transition-colors">{ev.title}</div>
                  {ev.amount && (
                    <div className="text-xs text-orange-600 dark:text-orange-300 mt-1 font-medium transition-colors">{ev.amount.toLocaleString('ru-RU')} ₽</div>
                  )}
                  {ev.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 transition-colors">{ev.description}</div>
                  )}
                  {rangeText && (
                    <div className="text-xs text-[var(--color-primary)] dark:text-[var(--color-primary-light)] mt-1 font-medium transition-colors">{rangeText}</div>
                  )}
                  {(ev.recurrence || ev.isRecurrenceInstance) && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-primary)] dark:text-[var(--color-primary-light)] transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>
                        {ev.isRecurrenceInstance
                          ? 'Повторяющееся событие'
                          : ev.recurrence === 'custom' && ev.recurrenceInterval
                            ? `Повторять: каждые ${ev.recurrenceInterval} дней`
                            : ev.recurrence
                              ? `Повторять: ${recurrenceLabels[ev.recurrence] || ev.recurrence}`
                              : 'Повторяющееся событие'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onEdit(ev)}
                      className="text-xs px-2 py-1 bg-[var(--color-primary-light)] dark:bg-slate-700 text-[var(--color-primary)] dark:text-[var(--color-primary-light)] rounded hover:bg-[var(--color-primary-light)]/80 dark:hover:bg-slate-600 transition"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => {
                        setConfirmEvent(ev);
                        setConfirmOpen(true);
                      }}
                      className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-700 mt-4 transition-colors">
          <button
            onClick={onCreate}
            className="w-full py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition select-none"
          >
            + Добавить
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message={confirmEvent ? `Удалить «${confirmEvent.title}»?` : 'Удалить это событие?'}
        onConfirm={async () => {
          if (confirmEvent) {
            await onDelete(confirmEvent);
          }
          setConfirmOpen(false);
          setConfirmEvent(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmEvent(null);
        }}
      />
    </div>
  );
}
