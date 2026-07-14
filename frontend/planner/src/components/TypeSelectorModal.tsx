import type { EventType } from '../api/events.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: EventType) => void;
}

const options: { type: EventType; label: string; color: string; desc: string }[] = [
  { type: 'event', label: 'Событие', color: 'bg-blue-500', desc: 'Один или несколько дней' },
  { type: 'task', label: 'Задача', color: 'bg-green-500', desc: 'С дедлайном' },
  { type: 'meeting', label: 'Встреча', color: 'bg-purple-500', desc: 'Конкретное время' },
  { type: 'payment', label: 'Платёж', color: 'bg-orange-500', desc: 'С суммой и повторением' },
];

export default function TypeSelectorModal({ isOpen, onClose, onSelect }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 select-none">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors">Что добавить?</h3>
          <div className="group relative">
            <span className="text-gray-400 dark:text-gray-500 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary-light)] cursor-help text-lg select-none transition-colors">ⓘ</span>
            <div className="absolute bottom-full right-0 mb-2 w-60 bg-gray-800 dark:bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl pointer-events-none">
              <div className="space-y-1.5 leading-relaxed">
                <p><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1 align-middle" /><strong className="text-blue-200">Событие</strong> — один или несколько дней с временем начала/окончания.</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1 align-middle" /><strong className="text-purple-200">Встреча</strong> — конкретный день, время начала и окончания.</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 align-middle" /><strong className="text-green-200">Задача</strong> — период выполнения от даты старта до дедлайна.</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1 align-middle" /><strong className="text-orange-200">Платёж</strong> — оплата с суммой, датой и периодичностью.</p>
              </div>
              <div className="absolute top-full right-2 -mt-1 w-2 h-2 bg-gray-800 dark:bg-slate-900 rotate-45" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-[var(--color-primary-light)] dark:hover:border-slate-600 hover:bg-[var(--color-primary-light)]/40 dark:hover:bg-slate-700 transition text-left transition-colors"
            >
              <span className={`w-3 h-3 rounded-full ${opt.color} flex-shrink-0`} />
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-100 transition-colors">{opt.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition select-none transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
