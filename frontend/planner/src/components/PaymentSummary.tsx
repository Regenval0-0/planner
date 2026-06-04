import type { EventItem } from '../api/events.ts';

interface Props {
  events: EventItem[];
}

export default function PaymentSummary({ events }: Props) {
  const payments = events.filter((e) => e.type === 'payment');
  if (payments.length === 0) return null;

  const monthTotal = payments.reduce((sum, e) => sum + (e.amount || 0), 0);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 select-none">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Финансы</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">На этой неделе</span>
          <span className="text-sm font-semibold text-orange-600">{fmt(weekTotal)}</span>
        </div>
        <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">За месяц</span>
          <span className="text-base font-bold text-orange-700">{fmt(monthTotal)}</span>
        </div>
      </div>
    </div>
  );
}
