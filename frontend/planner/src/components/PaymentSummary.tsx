import type { EventItem } from '../api/events.ts';

interface Props {
  events: EventItem[];
  month: number; // 0-11
  year: number;
}

export default function PaymentSummary({ events, month, year }: Props) {
  const payments = events.filter((e) => e.type === 'payment');
  if (payments.length === 0) return null;

  const monthTotal = payments.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Неделя, содержащая 1-е число отображаемого месяца (пн-вс)
  const firstDayOfMonth = new Date(year, month, 1);
  const weekStart = new Date(firstDayOfMonth);
  weekStart.setDate(firstDayOfMonth.getDate() - ((firstDayOfMonth.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekTotal = payments
    .filter((e) => {
      const d = new Date(e.startDate);
      return d >= weekStart && d <= weekEnd;
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const fmt = (n: number) => n.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 select-none transition-colors">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide transition-colors">Финансы</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">На этой неделе</span>
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-300 transition-colors">{fmt(weekTotal)}</span>
        </div>
        <div className="border-t border-gray-100 dark:border-slate-700 pt-2 flex items-center justify-between transition-colors">
          <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">За месяц</span>
          <span className="text-base font-bold text-orange-700 dark:text-orange-400 transition-colors">{fmt(monthTotal)}</span>
        </div>
      </div>
    </div>
  );
}
