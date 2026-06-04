import { CalendarItem, CalendarItemType, Status } from '@planner/shared';

interface ItemListProps {
  items: CalendarItem[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, status: Status) => Promise<unknown>;
}

function typeLabel(type: CalendarItemType) {
  switch (type) {
    case 'task': return 'Задача';
    case 'event': return 'Событие';
    case 'meeting': return 'Встреча';
  }
}

function typeBadge(type: CalendarItemType) {
  switch (type) {
    case 'task': return 'bg-amber-100 text-amber-700';
    case 'event': return 'bg-sky-100 text-sky-700';
    case 'meeting': return 'bg-emerald-100 text-emerald-700';
  }
}

function priorityDot(priority: string) {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-300';
  }
}

function formatDateRange(start: string, end: string | null) {
  const s = new Date(start);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
  if (end) {
    const e = new Date(end);
    return `${s.toLocaleString('ru-RU', opts)} — ${e.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return s.toLocaleString('ru-RU', opts);
}

export function ItemList({ items, loading, onEdit, onDelete, onToggleStatus }: ItemListProps) {
  if (loading) {
    return <div className="text-center py-10 text-gray-400">Загрузка...</div>;
  }

  if (items.length === 0) {
    return <div className="text-center py-10 text-gray-400">Нет записей. Добавьте первую!</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm transition hover:shadow-md ${
            item.status === 'completed' ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${priorityDot(item.priority)}`}></div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge(item.type)}`}>
                {typeLabel(item.type)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleStatus(item.id, item.status === 'completed' ? 'pending' : 'completed')}
                className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition"
                title={item.status === 'completed' ? 'Отметить невыполненным' : 'Отметить выполненным'}
              >
                {item.status === 'completed' ? '↩' : '✓'}
              </button>
              <button
                onClick={() => onEdit(item.id)}
                className="text-xs px-2 py-1 rounded-md bg-planner-50 text-planner-700 hover:bg-planner-100 transition"
              >
                Изменить
              </button>
              <button
                onClick={() => {
                  if (confirm('Удалить эту запись?')) {
                    onDelete(item.id);
                  }
                }}
                className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                Удалить
              </button>
            </div>
          </div>

          <div className="mt-2">
            <div className={`font-medium text-gray-800 ${item.status === 'completed' ? 'line-through' : ''}`}>
              {item.title}
            </div>
            {item.description && (
              <div className="text-sm text-gray-500 mt-1">{item.description}</div>
            )}
            <div className="text-xs text-gray-400 mt-2">{formatDateRange(item.start_date, item.end_date)}</div>
            {item.location && (
              <div className="text-xs text-gray-400 mt-0.5">📍 {item.location}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
