import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useSync } from '../sync/SyncContext.tsx';
import type { EventItem, EventCreate, EventType } from '../api/events.ts';
import CalendarGrid from '../components/CalendarGrid.tsx';
import EventModal from '../components/EventModal.tsx';
import DayModal from '../components/DayModal.tsx';
import UpcomingPanel from '../components/UpcomingPanel.tsx';
import PaymentSummary from '../components/PaymentSummary.tsx';
import TypeSelectorModal from '../components/TypeSelectorModal.tsx';
import WeekModal from '../components/WeekModal.tsx';
import { isEventOnDay } from '../utils/date.ts';
import { expandEvents, monthGridRange, originIdOf } from '../utils/recurrence.ts';

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function SyncBadge() {
  const { isOnline, isSyncing, pendingCount, error, syncNow } = useSync();
  let color = 'bg-green-500';
  let text = 'Сохранено';
  if (!isOnline) {
    color = 'bg-amber-500';
    text = pendingCount > 0 ? `Нет сети · ${pendingCount} не отправлено` : 'Нет сети';
  } else if (isSyncing) {
    color = 'bg-[var(--color-primary)] animate-pulse';
    text = 'Синхронизация...';
  } else if (pendingCount > 0) {
    color = 'bg-orange-500';
    text = `${pendingCount} не отправлено`;
  } else if (error) {
    color = 'bg-red-500';
    text = 'Ошибка синхронизации';
  }
  return (
    <button
      onClick={() => syncNow()}
      title={error ? `${text}: ${error}. Нажмите, чтобы повторить` : `${text}. Нажмите, чтобы синхронизировать`}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
    >
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="hidden sm:inline">{text}</span>
    </button>
  );
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, initialLoading, error, isOnline, createEvent, updateEvent, deleteEvent } = useSync();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [dayModalDate, setDayModalDate] = useState<Date | null>(null);
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [preselectedType, setPreselectedType] = useState<EventType>('event');
  const [weekModalStart, setWeekModalStart] = useState<Date | null>(null);
  const [seriesToDelete, setSeriesToDelete] = useState<EventItem | null>(null);

  // Повторы раскрываются для видимой сетки месяца.
  const visibleEvents = useMemo(() => {
    const { from, to } = monthGridRange(year, month);
    return expandEvents(events, from, to);
  }, [events, year, month]);

  const dayEvents = useMemo(() => {
    if (!dayModalDate) return [];
    const from = new Date(dayModalDate.getFullYear(), dayModalDate.getMonth(), dayModalDate.getDate());
    const to = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 23, 59, 59, 999);
    return expandEvents(events, from, to).filter((e) => isEventOnDay(e, dayModalDate));
  }, [events, dayModalDate]);

  function shiftMonth(delta: number) {
    setCurrentDate(new Date(year, month + delta, 1));
  }

  function openCreate(date?: Date) {
    setSelectedDate(date || new Date());
    setSelectedEvent(null);
    setPreselectedType('event');
    setTypeSelectorOpen(true);
  }

  function openEdit(ev: EventItem) {
    setSelectedDate(undefined);
    setSelectedEvent(ev);
    setEventModalOpen(true);
  }

  async function handleSave(data: EventCreate) {
    if (!selectedEvent) {
      await createEvent(data);
      return;
    }
    const originId = originIdOf(selectedEvent);
    const base = events.find((e) => e.id === originId);
    if (selectedEvent.isRecurrenceInstance && base) {
      // Редактировали один из повторов: сдвиг даты переносим на всю серию,
      // чтобы серия не начиналась заново с даты этого повтора.
      const delta = new Date(data.startDate).getTime() - new Date(selectedEvent.startDate).getTime();
      const newStart = new Date(new Date(base.startDate).getTime() + delta);
      const duration = data.endDate ? new Date(data.endDate).getTime() - new Date(data.startDate).getTime() : null;
      await updateEvent(originId, {
        ...data,
        startDate: newStart.toISOString(),
        endDate: duration !== null ? new Date(newStart.getTime() + duration).toISOString() : null,
      });
      return;
    }
    await updateEvent(originId, data);
  }

  async function handleDelete(ev: EventItem) {
    if (ev.recurrence) {
      setSeriesToDelete(ev);
      return;
    }
    await deleteEvent(originIdOf(ev));
  }

  async function deleteSeries(mode: 'all' | 'future') {
    const ev = seriesToDelete;
    setSeriesToDelete(null);
    setEventModalOpen(false);
    if (!ev) return;
    const originId = originIdOf(ev);
    if (mode === 'all' || !ev.isRecurrenceInstance) {
      await deleteEvent(originId);
      return;
    }
    // Оставить повторы до этого дня: серия заканчивается накануне.
    const occ = new Date(ev.startDate);
    const end = new Date(occ.getFullYear(), occ.getMonth(), occ.getDate() - 1, 23, 59, 59, 999);
    await updateEvent(originId, { recurrenceEnd: end.toISOString() });
  }

  const today = new Date();
  const isTodayMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 safe-area">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-b border-gray-200 dark:border-slate-700 select-none safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold flex-shrink-0">П</div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">Планер</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <SyncBadge />
            <span className="hidden md:inline text-sm text-gray-500 dark:text-gray-400 px-1 truncate max-w-[160px]">{user?.username}</span>
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 flex items-center justify-center text-lg rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
              title="Настройки"
              aria-label="Настройки"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 pb-24 sm:pb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-6 gap-2 select-none px-1">
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => shiftMonth(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-100"
              aria-label="Предыдущий месяц"
            >
              ←
            </button>
            <div className="flex items-center gap-1 sm:gap-2 min-w-[150px] sm:min-w-[200px] justify-center">
              <span className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">{monthNames[month]}</span>
              <select
                value={year}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value, 10), month, 1))}
                className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 bg-transparent border-0 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                aria-label="Год"
              >
                {Array.from({ length: 21 }, (_, i) => year - 10 + i).map((y) => (
                  <option key={y} value={y} className="dark:bg-slate-800">
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => shiftMonth(1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-100"
              aria-label="Следующий месяц"
            >
              →
            </button>
            {!isTodayMonth && (
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-[var(--color-primary-light)] dark:bg-slate-700 text-[var(--color-primary)] dark:text-[var(--color-primary-light)] rounded-lg"
              >
                Сегодня
              </button>
            )}
          </div>
          <button
            onClick={() => openCreate(new Date())}
            className="hidden sm:inline-flex px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)]"
          >
            + Добавить
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        {!isOnline && (
          <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm rounded-lg border border-amber-200 dark:border-amber-800">
            Нет интернета. Изменения сохраняются на устройстве и отправятся, когда связь появится.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 lg:gap-6">
          <div>
            {initialLoading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">Загрузка событий...</div>
            ) : (
              <CalendarGrid
                year={year}
                month={month}
                events={visibleEvents}
                onSelectDate={(d) => setDayModalDate(d)}
                onSelectEvent={openEdit}
                onSelectWeek={(ws) => setWeekModalStart(ws)}
              />
            )}
          </div>
          <div className="space-y-4">
            <UpcomingPanel events={events} onSelectEvent={openEdit} />
            <PaymentSummary events={visibleEvents} month={month} year={year} />
          </div>
        </div>
      </main>

      {/* Кнопка добавления на телефоне */}
      <button
        onClick={() => openCreate(new Date())}
        className="sm:hidden fixed right-4 bottom-[calc(1.25rem+max(env(safe-area-inset-bottom,0px),var(--safe-area-inset-bottom,0px)))] z-30 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white text-3xl leading-none shadow-lg active:scale-95 transition"
        aria-label="Добавить"
      >
        +
      </button>

      <DayModal
        isOpen={!!dayModalDate}
        date={dayModalDate}
        events={dayEvents}
        onClose={() => setDayModalDate(null)}
        onCreate={() => {
          const d = dayModalDate || undefined;
          setDayModalDate(null);
          openCreate(d);
        }}
        onEdit={(ev) => {
          setDayModalDate(null);
          openEdit(ev);
        }}
        onDelete={handleDelete}
      />

      <TypeSelectorModal
        isOpen={typeSelectorOpen}
        onClose={() => setTypeSelectorOpen(false)}
        onSelect={(type) => {
          setPreselectedType(type);
          setTypeSelectorOpen(false);
          setSelectedEvent(null);
          setEventModalOpen(true);
        }}
      />

      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleSave}
        onDelete={selectedEvent ? () => handleDelete(selectedEvent) : undefined}
        initialDate={selectedDate}
        event={selectedEvent}
        initialType={preselectedType}
      />

      <WeekModal
        isOpen={!!weekModalStart}
        weekStart={weekModalStart}
        events={events}
        onClose={() => setWeekModalStart(null)}
        onSelectEvent={(ev) => {
          setWeekModalStart(null);
          openEdit(ev);
        }}
        onCreate={(date) => {
          setWeekModalStart(null);
          openCreate(date);
        }}
      />

      {seriesToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setSeriesToDelete(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Удалить повторяющееся событие</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">«{seriesToDelete.title || 'Без названия'}»</p>
            <div className="space-y-2">
              {seriesToDelete.isRecurrenceInstance && (
                <button
                  onClick={() => deleteSeries('future')}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-500/30"
                >
                  Этот и все следующие повторы
                </button>
              )}
              <button
                onClick={() => deleteSeries('all')}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-500"
              >
                Всю серию
              </button>
              <button
                onClick={() => setSeriesToDelete(null)}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
