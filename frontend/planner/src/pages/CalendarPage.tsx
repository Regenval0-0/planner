import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { fetchEvents, createEvent, updateEvent, deleteEvent, type EventItem, type EventCreate, type EventType } from '../api/events.ts';
import CalendarGrid from '../components/CalendarGrid.tsx';
import EventModal from '../components/EventModal.tsx';
import DayModal from '../components/DayModal.tsx';
import UpcomingPanel from '../components/UpcomingPanel.tsx';
import PaymentSummary from '../components/PaymentSummary.tsx';
import TypeSelectorModal from '../components/TypeSelectorModal.tsx';
import WeekModal from '../components/WeekModal.tsx';
import { isEventOnDay } from '../utils/date.ts';
import { useSocket } from '../hooks/useSocket.ts';

export default function CalendarPage() {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  const month = currentDate.getMonth() + 1;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchEvents(month, year);
      setEvents(data);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setError(msg || 'Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  const token = localStorage.getItem('token');

  useSocket(token, (type, data) => {
    setEvents((prev) => {
      if (type === 'created') {
        return [...prev, data];
      }
      if (type === 'updated') {
        return prev.map((e) => (e.id === data.id ? data : e));
      }
      if (type === 'deleted') {
        return prev.filter((e) => e.id !== data.id);
      }
      return prev;
    });
  });

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
      await updateEvent(id, data);
    } else {
      await createEvent(data);
    }
    await load();
  }

  async function handleDeleteEvent(event: EventItem) {
    const id = event.isRecurrenceInstance && event.originId ? event.originId : event.id;
    await deleteEvent(id);
    await load();
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
          <div className="text-sm text-gray-500">{user?.username}</div>
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
