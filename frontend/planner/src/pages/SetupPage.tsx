import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setBackendUrl, getBackendUrl, checkServer } from '../api/client.ts';

/**
 * Показывается только в сборке без встроенного адреса сервера
 * (обычные сборки для RuStore и ПК получают адрес из VITE_BACKEND_URL).
 */
export default function SetupPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState(getBackendUrl());
  const [status, setStatus] = useState<{ kind: 'info' | 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleConnect() {
    let trimmed = url.trim().replace(/\/+$/, '');
    if (!trimmed) {
      setStatus({ kind: 'error', text: 'Введите адрес сервера' });
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) trimmed = `https://${trimmed}`;
    setBusy(true);
    setStatus({ kind: 'info', text: 'Проверка подключения (до минуты)...' });
    const ok = await checkServer(trimmed);
    setBusy(false);
    if (!ok) {
      setStatus({ kind: 'error', text: 'Сервер не отвечает. Проверьте адрес и интернет.' });
      return;
    }
    setBackendUrl(trimmed);
    setStatus({ kind: 'ok', text: 'Подключено' });
    navigate('/login', { replace: true });
  }

  const colors = {
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    ok: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center safe-area safe-top">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 sm:p-8 w-[calc(100%-2rem)] max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">Подключение к серверу</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 text-center">
          Укажите адрес сервера «Планера», например https://api.example.ru
        </p>
        <input
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          autoCapitalize="none"
          autoCorrect="off"
          className="mt-5 w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleConnect}
          disabled={busy}
          className="mt-3 w-full px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {busy ? 'Проверка...' : 'Подключиться'}
        </button>
        {status && <div className={`mt-3 p-3 text-sm rounded-lg ${colors[status.kind]}`}>{status.text}</div>}
      </div>
    </div>
  );
}
