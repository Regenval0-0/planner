import { useState, useEffect } from 'react';
import type { EventItem, EventCreate, RecurrenceType } from '../api/events.ts';
import ConfirmModal from './ConfirmModal.tsx';
import { fromDateInput } from '../utils/date.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventCreate) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialDate?: Date;
  event?: EventItem | null;
  initialType?: EventCreate['type'];
}

function toDateInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openPicker(e: React.MouseEvent<HTMLInputElement>) {
  e.currentTarget.showPicker?.();
}


const recurrenceLabels: Record<RecurrenceType, string> = {
  daily: 'Каждый день',
  weekly: 'Каждую неделю',
  biweekly: 'Раз в 2 недели',
  monthly: 'Каждый месяц',
  yearly: 'Каждый год',
  custom: 'Каждые N дней',
};

const newTitles: Record<EventCreate['type'], string> = {
  event: 'Новое событие',
  task: 'Новая задача',
  meeting: 'Новая встреча',
  payment: 'Новый платёж',
};

const typeLabels: Record<EventCreate['type'], string> = {
  event: 'Событие',
  task: 'Задача',
  meeting: 'Встреча',
  payment: 'Платёж',
};

export default function EventModal({ isOpen, onClose, onSave, onDelete, initialDate, event, initialType }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventCreate['type']>('event');

  // Unified fields for task/meeting
  const [startValue, setStartValue] = useState('');
  const [endValue, setEndValue] = useState('');

  // Split fields for event
  const [startDateValue, setStartDateValue] = useState('');
  const [startTimeValue, setStartTimeValue] = useState('');
  const [endDateValue, setEndDateValue] = useState('');
  const [endTimeValue, setEndTimeValue] = useState('');

  const [recurrence, setRecurrence] = useState<RecurrenceType | ''>('');
  const [recurrenceEnd, setRecurrenceEnd] = useState('');
  const [recurrenceInterval, setRecurrenceInterval] = useState('');
  const [amount, setAmount] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | ''>('');
  const isRecurringEvent = !!event?.recurrence;
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isTask = type === 'task';
  const isMeeting = type === 'meeting';
  const isEvent = type === 'event';
  const isPayment = type === 'payment';

  useEffect(() => {
    if (!isOpen) return;
    setFormError('');
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setType(event.type as EventCreate['type']);
      setRecurrence(event.recurrence || '');
      setRecurrenceEnd(event.recurrenceEnd ? toDateInput(event.recurrenceEnd) : '');
      setRecurrenceInterval(event.recurrenceInterval ? String(event.recurrenceInterval) : '');
      setReminderMinutes(event.reminderMinutes ?? '');

      setAmount(event.amount != null ? String(event.amount) : '');

      if (event.type === 'task') {
        setStartValue(toDateInput(event.startDate));
        setEndValue(event.endDate ? toDateInput(event.endDate) : '');
        setStartDateValue('');
        setStartTimeValue('');
        setEndDateValue('');
        setEndTimeValue('');
      } else if (event.type === 'meeting') {
        setStartValue(toDatetimeLocal(event.startDate));
        setEndValue(event.endDate ? toTimeInput(event.endDate) : '');
        setStartDateValue('');
        setStartTimeValue('');
        setEndDateValue('');
        setEndTimeValue('');
      } else {
        setStartValue('');
        setEndValue('');
        setStartDateValue(toDateInput(event.startDate));
        setStartTimeValue(toTimeInput(event.startDate));
        setEndDateValue(event.endDate ? toDateInput(event.endDate) : '');
        setEndTimeValue(event.endDate ? toTimeInput(event.endDate) : '');
      }
    } else {
      setTitle('');
      setDescription('');
      setType(initialType || 'event');
      setRecurrence('');
      setRecurrenceEnd('');
      setRecurrenceInterval('');
      setReminderMinutes('');
      setAmount('');
      // Копия: нельзя менять дату, переданную снаружи.
      const base = initialDate ? new Date(initialDate) : new Date();
      base.setMinutes(0, 0, 0);
      if (initialType === 'task') {
        setStartValue(toDateInput(base.toISOString()));
        setEndValue(toDateInput(base.toISOString()));
        setStartDateValue('');
        setStartTimeValue('');
        setEndDateValue('');
        setEndTimeValue('');
      } else if (initialType === 'meeting') {
        setStartValue(toDatetimeLocal(base.toISOString()));
        setEndValue('');
        setStartDateValue('');
        setStartTimeValue('');
        setEndDateValue('');
        setEndTimeValue('');
      } else {
        setStartValue('');
        setEndValue('');
        setStartDateValue(toDateInput(base.toISOString()));
        setStartTimeValue('');
        setEndDateValue(toDateInput(base.toISOString()));
        setEndTimeValue('');
      }
    }
  }, [isOpen, event, initialDate, initialType]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!title.trim() && !isPayment) {
      setFormError('Введите название');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let startDate: string;
      let endDate: string | null = null;

      if (isTask) {
        if (!startValue) {
          setFormError('Укажите дату начала');
          setLoading(false);
          return;
        }
        startDate = fromDateInput(startValue).toISOString();
        if (!endValue) {
          setFormError('Укажите дедлайн');
          setLoading(false);
          return;
        }
        const ed = fromDateInput(endValue, true);
        if (ed.getTime() < new Date(startDate).getTime()) {
          setFormError('Дедлайн не может быть раньше даты начала');
          setLoading(false);
          return;
        }
        endDate = ed.toISOString();
      } else if (isMeeting) {
        if (!startValue) {
          setFormError('Укажите дату и время');
          setLoading(false);
          return;
        }
        const startDt = new Date(startValue);
        startDate = startDt.toISOString();
        if (endValue) {
          const datePart = toDateInput(startValue);
          const endDt = new Date(`${datePart}T${endValue}`);
          if (endDt <= startDt) {
            setFormError('Время окончания должно быть позже начала');
            setLoading(false);
            return;
          }
          endDate = endDt.toISOString();
        }
      } else if (isPayment) {
        if (!startDateValue) {
          setFormError('Укажите дату');
          setLoading(false);
          return;
        }
        // Платёж — в 09:00, чтобы напоминание «за 1 день» приходило утром, а не в полночь.
        const d = fromDateInput(startDateValue);
        d.setHours(9, 0, 0, 0);
        startDate = d.toISOString();
      } else {
        // event
        if (!startDateValue) {
          setFormError('Укажите дату начала');
          setLoading(false);
          return;
        }
        const timePart = startTimeValue || '00:00';
        startDate = new Date(`${startDateValue}T${timePart}`).toISOString();
        if (!endDateValue) {
          setFormError('Укажите дату окончания');
          setLoading(false);
          return;
        }
        const endTimePart = endTimeValue || '23:59';
        endDate = new Date(`${endDateValue}T${endTimePart}`).toISOString();
        if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
          setFormError('Окончание не может быть раньше начала');
          setLoading(false);
          return;
        }
      }

      const parsedAmount = amount.trim() ? parseFloat(amount.replace(',', '.').replace(/\s/g, '')) : null;
      if (parsedAmount !== null && (Number.isNaN(parsedAmount) || parsedAmount < 0)) {
        setFormError('Проверьте сумму');
        setLoading(false);
        return;
      }
      const interval = recurrence === 'custom' ? parseInt(recurrenceInterval, 10) : null;
      if (recurrence === 'custom' && (!interval || interval < 1)) {
        setFormError('Укажите, через сколько дней повторять');
        setLoading(false);
        return;
      }

      // Все поля передаются явно: null очищает значение при редактировании.
      const payload: EventCreate = {
        title: title.trim(),
        description: description.trim() || null,
        startDate,
        endDate,
        type,
        amount: isPayment ? parsedAmount : null,
        reminderMinutes: reminderMinutes === '' ? null : Number(reminderMinutes),
        recurrence: recurrence || null,
        recurrenceEnd: recurrence && recurrenceEnd ? fromDateInput(recurrenceEnd, true).toISOString() : null,
        recurrenceInterval: interval,
      };

      await onSave(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto border border-gray-200 dark:border-slate-700 transition-colors">
        <h3 className="select-none text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors">
          {event ? `Редактировать: ${(typeLabels[type] || 'событие').toLowerCase()}` : newTitles[type]}
        </h3>

        {formError && (
          <div className="select-none mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg transition-colors">{formError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="select-none block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Название{isPayment && ' (необязательно)'}</label>
            <input
              type="text"
              required={!isPayment}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
            />
          </div>

          <div>
            <label className="select-none block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isPayment && (
              <div>
                <label className="select-none block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Сумма (₽)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
            )}
            <div className={isPayment ? '' : 'col-span-2'}>
              <label className="select-none block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Тип</label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as EventCreate['type'];
                  setType(newType);
                  setFormError('');
                  if (newType === 'task') {
                    setStartValue(startDateValue || startValue ? toDateInput(new Date(startDateValue || startValue).toISOString()) : '');
                    setEndValue(endDateValue || endValue ? toDateInput(new Date(endDateValue || endValue).toISOString()) : '');
                    setStartDateValue('');
                    setStartTimeValue('');
                    setEndDateValue('');
                    setEndTimeValue('');
                  } else if (newType === 'meeting') {
                    setStartValue(startDateValue || startValue ? toDatetimeLocal(new Date(`${startDateValue || toDateInput(new Date().toISOString())}T${startTimeValue || '00:00'}`).toISOString()) : '');
                    setEndValue(endTimeValue || endValue ? (endTimeValue || toTimeInput(new Date().toISOString())) : '');
                    setStartDateValue('');
                    setStartTimeValue('');
                    setEndDateValue('');
                    setEndTimeValue('');
                  } else {
                    setStartDateValue(startValue ? toDateInput(new Date(startValue).toISOString()) : '');
                    setStartTimeValue(startValue ? toTimeInput(new Date(startValue).toISOString()) : '');
                    setEndDateValue(endValue ? toDateInput(new Date(endValue).toISOString()) : '');
                    setEndTimeValue(endValue ? toTimeInput(new Date(endValue).toISOString()) : '');
                    setStartValue('');
                    setEndValue('');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="event" className="dark:bg-slate-900">{typeLabels.event}</option>
                <option value="task" className="dark:bg-slate-900">{typeLabels.task}</option>
                <option value="meeting" className="dark:bg-slate-900">{typeLabels.meeting}</option>
                <option value="payment" className="dark:bg-slate-900">Платёж</option>
              </select>
            </div>
          </div>

          {isEvent ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <label className="select-none block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Дата начала</label>
                  <input
                    type="date"
                    required
                    value={startDateValue}
                    onClick={openPicker}
                    onChange={(e) => setStartDateValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
                  />
                </div>
                <div>
                  <label className="select-none block text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">Время начала (необязательно)</label>
                  <input
                    type="time"
                    value={startTimeValue}
                    onClick={openPicker}
                    onChange={(e) => setStartTimeValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="select-none block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Дата окончания</label>
                  <input
                    type="date"
                    required
                    value={endDateValue}
                    onClick={openPicker}
                    onChange={(e) => setEndDateValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
                  />
                </div>
                <div>
                  <label className="select-none block text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">Время окончания (необязательно)</label>
                  <input
                    type="time"
                    value={endTimeValue}
                    onClick={openPicker}
                    onChange={(e) => setEndTimeValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
                  />
                </div>
              </div>
            </div>
          ) : isPayment ? (
            <div>
              <label className="select-none block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Дата</label>
              <input
                type="date"
                required
                value={startDateValue}
                onClick={openPicker}
                onChange={(e) => setStartDateValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="select-none block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  {isTask ? 'Дата начала' : 'Дата и время'}
                </label>
                <input
                  type={isTask ? 'date' : 'datetime-local'}
                  required
                  value={startValue}
                  onClick={openPicker}
                  onChange={(e) => setStartValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
              <div>
                <label className="select-none block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  {isTask ? 'Дедлайн' : 'Время окончания (необязательно)'}
                </label>
                <input
                  type={isTask ? 'date' : 'time'}
                  required={isTask}
                  value={endValue}
                  onClick={openPicker}
                  onChange={(e) => setEndValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 space-y-3 bg-gray-50/50 dark:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="select-none text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Повторение</span>
            </div>

            <div>
              <label className="select-none block text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">Повторять</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType | '')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="" className="dark:bg-slate-900">Не повторяется</option>
                <option value="daily" className="dark:bg-slate-900">{recurrenceLabels.daily}</option>
                <option value="weekly" className="dark:bg-slate-900">{recurrenceLabels.weekly}</option>
                <option value="biweekly" className="dark:bg-slate-900">{recurrenceLabels.biweekly}</option>
                <option value="monthly" className="dark:bg-slate-900">{recurrenceLabels.monthly}</option>
                <option value="yearly" className="dark:bg-slate-900">{recurrenceLabels.yearly}</option>
                <option value="custom" className="dark:bg-slate-900">{recurrenceLabels.custom}</option>
              </select>
            </div>

            {recurrence === 'custom' && (
              <div>
                <label className="select-none block text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">Каждые сколько дней?</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(e.target.value)}
                  placeholder="28"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
            )}

            {recurrence && (
              <div>
                <label className="select-none block text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">Повторять до (необязательно)</label>
                <input
                  type="date"
                  value={recurrenceEnd}
                  onClick={openPicker}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
            )}
          </div>

          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 space-y-3 bg-gray-50/50 dark:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="select-none text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Напоминание</span>
            </div>
            <div>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="" className="dark:bg-slate-900">Без напоминания</option>
                <option value={0} className="dark:bg-slate-900">В момент начала</option>
                <option value={5} className="dark:bg-slate-900">За 5 минут</option>
                <option value={15} className="dark:bg-slate-900">За 15 минут</option>
                <option value={30} className="dark:bg-slate-900">За 30 минут</option>
                <option value={60} className="dark:bg-slate-900">За 1 час</option>
                <option value={120} className="dark:bg-slate-900">За 2 часа</option>
                <option value={1440} className="dark:bg-slate-900">За 1 день</option>
                <option value={4320} className="dark:bg-slate-900">За 3 дня</option>
              </select>
            </div>
          </div>

          {isRecurringEvent && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Это повторяющееся событие: изменения применятся ко всем повторам.
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="select-none px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50 select-none"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="select-none px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition select-none"
            >
              Отмена
            </button>
            {event && onDelete && (
              <button
                type="button"
                onClick={() => {
                  // Для повторяющегося события выбор «всю серию / этот и следующие» показывает страница.
                  if (isRecurringEvent) onDelete();
                  else setConfirmOpen(true);
                }}
                className="select-none px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition ml-auto select-none"
              >
                Удалить
              </button>
            )}
          </div>
        </form>

        <ConfirmModal
          isOpen={confirmOpen}
          message={`Удалить «${title || 'это событие'}»?`}
          onConfirm={async () => {
            setConfirmOpen(false);
            setLoading(true);
            try {
              await onDelete!();
              onClose();
            } finally {
              setLoading(false);
            }
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </div>
  );
}
