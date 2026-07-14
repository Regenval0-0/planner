import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useSync } from '../sync/SyncContext.tsx';
import type { EventItem, EventCreate, EventType } from '../api/events.ts';
import { hasBackendUrl, getBackendUrl } from '../api/client.ts';
import CalendarGrid from '../components/CalendarGrid.tsx';
import EventModal from '../components/EventModal.tsx';
import DayModal from '../components/DayModal.tsx';
import UpcomingPanel from '../components/UpcomingPanel.tsx';
import PaymentSummary from '../components/PaymentSummary.tsx';
import TypeSelectorModal from '../components/TypeSelectorModal.tsx';
import WeekModal from '../components/WeekModal.tsx';
import { isEventOnDay } from '../utils/date.ts';
import { scheduleNotification, cancelNotification } from '../hooks/useNotifications.ts';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    events,
    loading,
    error,
    isOnline: onlineStatus,
    isSyncing,
    pendingCount,
    createEvent: syncCreate,
    updateEvent: syncUpdate,
    deleteEvent: syncDelete,
    syncNow,
    refresh,
  } = useSync();

  const [currentDate, setCurrentDate] = useState(new Date());

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [dayModalDate, setDayModalDate] = useState<Date | null>(null);

  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [preselectedType, setPreselectedType] = useState<EventType>('event');

  const [weekModalOpen, setWeekModalOpen] = useState(false);
  const [weekModalStart, setWeekModalStart] = useState<Date | null>(null);

  const year = currentDate.getFullYear();

  // Refresh events when month/year changes
  const load = useCallback(async () => {
    await refresh();
  }, [refresh]);

  useEffect(() => {
    queueMicrotask(() => load());
  }, [load]);

  function prevMonth() {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  function openEventModal(date?: Date, event?: EventItem | null) {
    setSelectedDate(date);
    setSelectedEvent(event || null);
    setEventModalOpen(true);
  }

  function handleSelectDate(date: Date) {
    setDayModalDate(date);
    setDayModalOpen(true);
  }

  function handleSelectEvent(event: EventItem) {
    openEventModal(undefined, event);
  }

  function handleSelectWeek(weekStart: Date) {
    setWeekModalStart(weekStart);
    setWeekModalOpen(true);
  }

  async function handleSave(data: EventCreate) {
    if (selectedEvent) {
      const id = selectedEvent.isRecurrenceInstance && selectedEvent.originId
        ? selectedEvent.originId
        : selectedEvent.id;
      await syncUpdate(id, data);
      // Reschedule notification if reminder changed
      if (data.reminderMinutes !== undefined) {
        await cancelNotification(id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));
        if (data.reminderMinutes && data.reminderMinutes > 0) {
          const start = new Date(data.startDate);
          const reminderTime = new Date(start.getTime() - data.reminderMinutes * 60000);
          if (reminderTime > new Date()) {
            await scheduleNotification({
              id: id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0),
              title: data.title || 'Напоминание',
              body: `Событие начинается через ${data.reminderMinutes} мин.`,
              scheduleAt: reminderTime,
            });
          }
        }
      }
    } else {
      await syncCreate(data);
      if (data.reminderMinutes && data.reminderMinutes > 0) {
        // generate deterministic id from temp id or use timestamp
        const notifId = Date.now() % 2147483647;
        const start = new Date(data.startDate);
        const reminderTime = new Date(start.getTime() - data.reminderMinutes * 60000);
        if (reminderTime > new Date()) {
          await scheduleNotification({
            id: notifId,
            title: data.title || 'Напоминание',
            body: `Событие начинается через ${data.reminderMinutes} мин.`,
            scheduleAt: reminderTime,
          });
        }
      }
    }
  }

  async function handleDeleteEvent(event: EventItem) {
    const id = event.isRecurrenceInstance && event.originId ? event.originId : event.id;
    await syncDelete(id);
    // Cancel associated notification
    await cancelNotification(id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));
  }

  const monthNames = [
    'Январь','Февраль','Март','Апрель','Май','Июнь',
    'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
  ];

  const today = new Date();
  const isTodayMonth =
    today.getFullYear() === year && today.getMonth() === currentDate.getMonth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between select-none transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">П</div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 transition-colors">Планер</h1>
        </div>
        <div className="flex items-center gap-3">
          {(() => {
            const isCloud = hasBackendUrl();
            const backend = getBackendUrl();
            return (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${isCloud ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'}`}
                title={isCloud ? `Синхронизация: ${backend}` : 'Работа без синхронизации (offline)'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCloud ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                {isCloud ? 'Синхронизация' : 'Offline'}
              </div>
            );
          })()}
          {/* Online/Offline indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${onlineStatus ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'}`}
            title={onlineStatus ? 'Подключение к интернету есть' : 'Нет подключения к интернету'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${onlineStatus ? 'bg-blue-500' : 'bg-red-500'}`}></span>
            {onlineStatus ? 'Online' : 'Offline'}
          </div>
          {isSyncing && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border bg-[var(--color-primary-light)] dark:bg-slate-700 text-[var(--color-primary)] dark:text-[var(--color-primary-light)] border-[var(--color-primary-light)] dark:border-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
              Синхронизация...
            </div>
          )}
          {pendingCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700" title="Изменения ожидают отправки на сервер">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              {pendingCount} в очереди
            </div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors">{user?.username}</div>
          <button
            onClick={() => navigate('/settings')}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition"
            title="Настройки сервера"
          >
            ⚙️
          </button>
          <button
            onClick={() => syncNow()}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition"
            title="Синхронизировать сейчас"
          >
            🔄
          </button>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition"
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition select-none text-gray-800 dark:text-gray-100"
            >
              ←
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors">
                {monthNames[currentDate.getMonth()]}
              </span>
              <select
                value={year}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                className="text-lg font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer select-none transition-colors"
              >
                {Array.from({ length: 21 }, (_, i) => year - 10 + i).map((y) => (
                  <option key={y} value={y} className="dark:bg-slate-800 dark:text-gray-100">{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition select-none text-gray-800 dark:text-gray-100"
            >
              →
            </button>
            {!isTodayMonth && (
              <button
                onClick={goToday}
                className="px-3 py-2 text-sm bg-[var(--color-primary-light)] dark:bg-slate-700 text-[var(--color-primary)] dark:text-[var(--color-primary-light)] rounded-lg hover:bg-[var(--color-primary-light)]/80 dark:hover:bg-slate-600 transition select-none"
              >
                Сегодня
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setPreselectedType('event');
              setTypeSelectorOpen(true);
            }}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition select-none"
          >
              + Добавить
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800 transition">{error}</div>
        )}

        {!onlineStatus && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm rounded-lg border border-amber-200 dark:border-amber-800 transition">
            Нет подключения к интернету. Изменения сохраняются локально и будут отправлены при восстановлении связи.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div>
            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 transition">Загрузка...</div>
            ) : (
              <CalendarGrid
                year={currentDate.getFullYear()}
                month={currentDate.getMonth()}
                events={events}
                onSelectDate={handleSelectDate}
                onSelectEvent={handleSelectEvent}
                onSelectWeek={handleSelectWeek}
              />
            )}
          </div>

          <div className="space-y-4">
            <UpcomingPanel events={events} onSelectEvent={handleSelectEvent} />

            <PaymentSummary events={events} month={currentDate.getMonth()} year={currentDate.getFullYear()} />
          </div>
        </div>
      </main>

      <DayModal
        isOpen={dayModalOpen}
        date={dayModalDate}
        events={dayModalDate ? events.filter((e) => isEventOnDay(e, dayModalDate)) : []}
        onClose={() => setDayModalOpen(false)}
        onCreate={() => {
          setDayModalOpen(false);
          setSelectedDate(dayModalDate || undefined);
          setPreselectedType('event');
          setTypeSelectorOpen(true);
        }}
        onEdit={(ev) => {
          setDayModalOpen(false);
          openEventModal(undefined, ev);
        }}
        onDelete={handleDeleteEvent}
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
        onDelete={selectedEvent ? () => handleDeleteEvent(selectedEvent) : undefined}
        initialDate={selectedDate}
        event={selectedEvent}
        initialType={preselectedType}
      />

      <WeekModal
        isOpen={weekModalOpen}
        weekStart={weekModalStart}
        events={events}
        onClose={() => setWeekModalOpen(false)}
        onSelectEvent={(ev) => {
          setWeekModalOpen(false);
          handleSelectEvent(ev);
        }}
        onCreate={(date) => {
          setWeekModalOpen(false);
          setSelectedDate(date);
          setPreselectedType('event');
          setTypeSelectorOpen(true);
        }}
      />
    </div>
  );
}
