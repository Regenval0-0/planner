import { useState } from 'react';
import { CalendarItem, CalendarItemType, Priority, Status } from '@planner/shared';

interface ItemFormProps {
  onSubmit: (data: {
    type: CalendarItemType;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    priority: Priority;
    status: Status;
    location: string | null;
  }) => void | Promise<void>;
  onCancel: () => void;
  initialData?: CalendarItem;
}

export function ItemForm({ onSubmit, onCancel, initialData }: ItemFormProps) {
  const [type, setType] = useState<CalendarItemType>(initialData?.type || 'task');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  function toDateTimeLocal(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const [startDate, setStartDate] = useState(() => {
    const d = initialData ? new Date(initialData.start_date) : new Date();
    return toDateTimeLocal(d);
  });
  const [endDate, setEndDate] = useState(() => {
    if (!initialData?.end_date) return '';
    return toDateTimeLocal(new Date(initialData.end_date));
  });
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium');
  const [status, setStatus] = useState<Status>(initialData?.status || 'pending');
  const [location, setLocation] = useState(initialData?.location || '');
  const [formError, setFormError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    const startIso = new Date(startDate).toISOString();
    let endIso: string | null = null;
    if (endDate) {
      endIso = new Date(endDate).toISOString();
      if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
        setFormError('Дата окончания должна быть позже даты начала');
        return;
      }
    }

    onSubmit({
      type,
      title,
      description: description || null,
      start_date: startIso,
      end_date: endIso,
      priority,
      status,
      location: location || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {initialData ? 'Редактировать' : 'Новая запись'}
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CalendarItemType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planner-500"
          >
            <option value="task">Задача</option>
            <option value="event">Событие</option>
            <option value="meeting">Встреча</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planner-500"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planner-500"
          placeholder="Например, Подготовка к экзамену"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planner-500"
          placeholder="Дополнительные детали..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Начало</label>
          <input
            type="datetime-local"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planner-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Окончание (опц.)</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planner-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Место / Ссылка</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planner-500"
          placeholder="Кабинет 305 или Zoom-ссылка"
        />
      </div>

      {initialData && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planner-500"
          >
            <option value="pending">В процессе</option>
            <option value="completed">Выполнено</option>
            <option value="cancelled">Отменено</option>
          </select>
        </div>
      )}

      {formError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formError}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-planner-500 text-white rounded-lg text-sm font-medium hover:bg-planner-600 transition"
        >
          {initialData ? 'Сохранить' : 'Создать'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
