interface Props {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title = 'Подтверждение', message, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 select-none">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 text-center border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4 transition-colors">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">{message}</p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition select-none transition-colors"
          >
            Нет
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition select-none"
          >
            Да
          </button>
        </div>
      </div>
    </div>
  );
}
