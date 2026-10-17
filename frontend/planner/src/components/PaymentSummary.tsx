import type { EventItem } from '../api/events.ts';

interface Props {
  /** Повторы уже раскрыты для видимой сетки месяца. */
  events: EventItem[];
  month: number; // 0-11
  year: number;
}

const fmt = (n: number) => n.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 });

export default function PaymentSummary({ events, month, year }: Props) {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const payments = events.filter((e) => {
    if (e.type !== 'payment') return false;
    const d = new Date(e.startDate);
    return d >= monthStart && d <= monthEnd;
  });
  if (payments.length === 0) return null;

  const monthTotal = payments.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Текущая неделя (пн–вс), если смотрим текущий месяц, иначе первая неделя месяца.
  const today = new Date();
  const anchor = today >= monthStart && today <= monthEnd ? today : monthStart;
  const weekStart = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - ((anchor.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6, 23, 59, 59, 999);
  const weekTotal = events
    .filter((e) => e.type === 'payment')
    .filter((e) => {
      const d = new Date(e.startDate);
      return d >= weekStart && d <= weekEnd;
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const remaining = payments
    .filter((e) => new Date(e.startDate) >= now)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const upcoming = [...payments].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 select-none">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">💰 Платежи</h3>
      <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto pr-1">
        {upcoming.map((e) => {
          const d = new Date(e.startDate);
          const past = d < now;
          return (
            <div key={e.id} className={`flex items-center justify-between text-sm ${past ? 'opacity-50' : ''}`}>
              <span className="text-gray-700 dark:text-gray-300 truncate mr-2">
                {String(d.getDate()).padStart(2, '0')}.{String(d.getMonth() + 1).padStart(2, '0')} · {e.title || 'Платёж'}
              </span>
              <span className="font-medium text-orange-700 dark:text-orange-400 whitespace-nowrap">{fmt(e.amount || 0)}</span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-100 dark:border-slate-700 pt-2 space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">{anchor === today ? 'На этой неделе' : 'Первая неделя'}</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{fmt(weekTotal)}</span>
        </div>
        {remaining !== monthTotal && remaining > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Осталось в месяце</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{fmt(remaining)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">За месяц</span>
          <span className="text-base font-bold text-orange-700 dark:text-orange-400">{fmt(monthTotal)}</span>
        </div>
      </div>
    </div>
  );
}
