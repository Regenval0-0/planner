import { useState, useEffect } from 'react';
import type { EventItem, EventCreate, RecurrenceType } from '../api/events.ts';
import ConfirmModal from './ConfirmModal.tsx';

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

function preventSelect(e: React.MouseEvent<HTMLInputElement>) {
  e.preventDefault();
}

const recurrenceLabels: Record<RecurrenceType, string> = {
  daily: 'Каждый день',
  weekly: 'Каждую неделю',
  biweekly: 'Раз в 2 недели',
  monthly: 'Каждый месяц',
  yearly: 'Каждый год',
  custom: 'Каждые N дней',
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

      setAmount(event.amount ? String(event.amount) : '');

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
      setAmount('');
      const base = initialDate || new Date();
      base.setMinutes(0);
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
    if (!title && !isPayment) return;
    setLoading(true);
    try {
      let startDate: string;
      let endDate: string | undefined;

      if (isTask) {
        if (!startValue) {
          setFormError('Укажите дату начала');
          setLoading(false);
          return;
        }
        const d = new Date(startValue);
        d.setHours(0, 0, 0, 0);
        startDate = d.toISOString();
        if (!endValue) {
          setFormError('Укажите дедлайн');
          setLoading(false);
          return;
        }
        const ed = new Date(endValue);
        ed.setHours(23, 59, 59, 999);
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
        startDate = new Date(`${startDateValue}T00:00`).toISOString();
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
      }

      const payload: EventCreate = {
        title,
        description: description || undefined,
        startDate,
        endDate,
        type,
      };

      if (amount) payload.amount = parseFloat(amount);
      if (recurrence) {
        payload.recurrence = recurrence;
        if (recurrenceEnd) payload.recurrenceEnd = new Date(recurrenceEnd).toISOString();
        if (recurrence === 'custom' && recurrenceInterval) {
          payload.recurrenceInterval = parseInt(recurrenceInterval, 10);
        }
      }

      await onSave(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="select-none text-lg font-semibold text-gray-800 mb-4">
          {event ? 'Редактировать' : 'Новое'} {typeLabels[type] || 'событие'}
        </h3>

        {formError && (
          <div className="select-none mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 select-none">
          <div>
            <label className="select-none block text-sm font-medium text-gray-700 mb-1">Название{isPayment && ' (необязательно)'}</label>
            <input
              type="text"
              required={!isPayment}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="select-none block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isPayment && (
              <div>
                <label className="select-none block text-sm font-medium text-gray-700 mb-1">
                  Сумма (₽)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            <div className={isPayment ? '' : 'col-span-2'}>
              <label className="select-none block text-sm font-medium text-gray-700 mb-1">Тип</label>
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
                className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="event">{typeLabels.event}</option>
                <option value="task">{typeLabels.task}</option>
                <option value="meeting">{typeLabels.meeting}</option>
                <option value="payment">Платёж</option>
              </select>
            </div>
          </div>

          {isEvent ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <label className="select-none block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                  <input
                    type="date"
                    required
                    value={startDateValue}
                    onClick={openPicker} onMouseDown={preventSelect}
                    onChange={(e) => setStartDateValue(e.target.value)}
                    className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="select-none block text-xs text-gray-500 mb-1">Время начала (необязательно)</label>
                  <input
                    type="time"
                    value={startTimeValue}
                    onClick={openPicker} onMouseDown={preventSelect}
                    onChange={(e) => setStartTimeValue(e.target.value)}
                    className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="select-none block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
                  <input
                    type="date"
                    required
                    value={endDateValue}
                    onClick={openPicker} onMouseDown={preventSelect}
                    onChange={(e) => setEndDateValue(e.target.value)}
                    className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="select-none block text-xs text-gray-500 mb-1">Время окончания (необязательно)</label>
                  <input
                    type="time"
                    value={endTimeValue}
                    onClick={openPicker} onMouseDown={preventSelect}
                    onChange={(e) => setEndTimeValue(e.target.value)}
                    className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : isPayment ? (
            <div>
              <label className="select-none block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input
                type="date"
                required
                value={startDateValue}
                onClick={openPicker} onMouseDown={preventSelect}
                onChange={(e) => setStartDateValue(e.target.value)}
                className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="select-none block text-sm font-medium text-gray-700 mb-1">
                  {isTask ? 'Дата начала' : 'Дата и время'}
                </label>
                <input
                  type={isTask ? 'date' : 'datetime-local'}
                  required
                  value={startValue}
                  onClick={openPicker} onMouseDown={preventSelect}
                  onChange={(e) => setStartValue(e.target.value)}
                  className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="select-none block text-sm font-medium text-gray-700 mb-1">
                  {isTask ? 'Дедлайн' : 'Время окончания (необязательно)'}
                </label>
                <input
                  type={isTask ? 'date' : 'time'}
                  required={isTask}
                  value={endValue}
                  onClick={openPicker} onMouseDown={preventSelect}
                  onChange={(e) => setEndValue(e.target.value)}
                  className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="select-none text-sm font-medium text-gray-700">Повторение</span>
            </div>

            <div>
              <label className="select-none block text-xs text-gray-500 mb-1">Повторять</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType | '')}
                className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">Не повторяется</option>
                <option value="daily">{recurrenceLabels.daily}</option>
                <option value="weekly">{recurrenceLabels.weekly}</option>
                <option value="biweekly">{recurrenceLabels.biweekly}</option>
                <option value="monthly">{recurrenceLabels.monthly}</option>
                <option value="yearly">{recurrenceLabels.yearly}</option>
                <option value="custom">{recurrenceLabels.custom}</option>
              </select>
            </div>

            {recurrence === 'custom' && (
              <div>
                <label className="select-none block text-xs text-gray-500 mb-1">Каждые сколько дней?</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(e.target.value)}
                  placeholder="28"
                  className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            )}

            {recurrence && (
              <div>
                <label className="select-none block text-xs text-gray-500 mb-1">Повторять до (необязательно)</label>
                <input
                  type="date"
                  value={recurrenceEnd}
                  onClick={openPicker} onMouseDown={preventSelect}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                  className="select-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="select-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 select-none"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="select-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition select-none"
            >
              Отмена
            </button>
            {event && onDelete && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="select-none px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition ml-auto select-none"
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
