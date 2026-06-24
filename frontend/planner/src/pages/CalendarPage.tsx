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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">П</div>
          <h1 className="text-xl font-semibold text-gray-800">Планер</h1>
        </div>
        <div className="flex items-center gap-3">
          {(() => {
            const isCloud = hasBackendUrl();
            const backend = getBackendUrl();
            return (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${isCloud ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                title={isCloud ? `Синхронизация: ${backend}` : 'Работа без синхронизации (offline)'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCloud ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                {isCloud ? 'Синхронизация' : 'Offline'}
              </div>
            );
          })()}
          {/* Online/Offline indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${onlineStatus ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}
            title={onlineStatus ? 'Подключение к интернету есть' : 'Нет подключения к интернету'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${onlineStatus ? 'bg-blue-500' : 'bg-red-500'}`}></span>
            {onlineStatus ? 'Online' : 'Offline'}
          </div>
          {isSyncing && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border bg-indigo-50 text-indigo-700 border-indigo-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Синхронизация...
            </div>
          )}
          {pendingCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border bg-orange-50 text-orange-700 border-orange-200" title="Изменения ожидают отправки на сервер">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              {pendingCount} в очереди
            </div>
          )}
          <div className="text-sm text-gray-500">{user?.username}</div>
          <button
            onClick={() => navigate('/settings')}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
            title="Настройки сервера"
          >
            ⚙️
          </button>
          <button
            onClick={() => syncNow()}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
            title="Синхронизировать сейчас"
          >
            🔄
          </button>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
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
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition select-none"
            >
              ←
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-800">
                {monthNames[currentDate.getMonth()]}
              </span>
              <select
                value={year}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                className="text-lg font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer select-none"
              >
                {Array.from({ length: 21 }, (_, i) => year - 10 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition select-none"
            >
              →
            </button>
            {!isTodayMonth && (
              <button
                onClick={goToday}
                className="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition select-none"
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition select-none"
          >
              + Добавить
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>
        )}

        {!onlineStatus && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-700 text-sm rounded-lg border border-amber-200">
            Нет подключения к интернету. Изменения сохраняются локально и будут отправлены при восстановлении связи.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Загрузка...</div>
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
