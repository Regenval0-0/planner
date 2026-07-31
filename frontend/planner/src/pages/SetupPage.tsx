import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setBackendUrl, getBackendUrl } from '../api/client.ts';

export default function SetupPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState(getBackendUrl() === 'http://localhost:3001' ? '' : getBackendUrl());
  const [status, setStatus] = useState('');

  async function handleConnect() {
    const trimmed = url.trim().replace(/\/$/, '');
    if (!trimmed) {
      setStatus('Введите URL сервера');
      return;
    }

    setStatus('Проверка подключения...');
    try {
      const res = await fetch(`${trimmed}/health`, { method: 'GET', mode: 'cors' });
      if (!res.ok) throw new Error('not ok');
      setBackendUrl(trimmed);
      setStatus('✅ Подключено! Перенаправляю...');
      setTimeout(() => navigate('/login'), 800);
    } catch {
      setStatus('❌ Сервер не отвечает. Проверьте URL и попробуйте снова.');
    }
  }

  function handleOffline() {
    // For desktop app only - localhost is already running
    setBackendUrl('http://localhost:3001');
    navigate('/login');
  }

  async function scanLocalNetwork() {
    setStatus('🔍 Поиск сервера в локальной сети...');
    const prefixes = ['192.168.0', '192.168.1', '192.168.31', '10.0.0'];
    for (const prefix of prefixes) {
      for (let i = 1; i <= 20; i++) {
        const testUrl = `http://${prefix}.${i}:3001`;
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 600);
          const res = await fetch(`${testUrl}/health`, {
            method: 'GET',
            signal: controller.signal,
          });
          clearTimeout(id);
          if (res.ok) {
            setBackendUrl(testUrl);
            setStatus('✅ Сервер найден! Перенаправляю...');
            setTimeout(() => navigate('/login'), 800);
            return;
          }
        } catch {
          // ignore — host unreachable
        }
      }
    }
    setStatus('❌ Сервер не найден в сети. Попробуйте ввести URL вручную.');
  }

  const isElectron = !!(window as unknown as { electronAPI?: unknown }).electronAPI;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-8 w-full max-w-md transition-colors">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[var(--color-primary-light)] dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
            <svg className="w-7 h-7 text-[var(--color-primary)] dark:text-[var(--color-primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors">Добро пожаловать</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors">Настройте подключение к серверу</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              URL сервера
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://planner-backend-xxx.onrender.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 transition-colors">
              Вставьте адрес облачного сервера для синхронизации между устройствами
            </p>
          </div>

          <button
            onClick={handleConnect}
            className="w-full px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition text-sm"
          >
            Подключиться к серверу
          </button>

          {!isElectron && (
            <button
              onClick={scanLocalNetwork}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition text-sm transition-colors"
            >
              🔍 Найти сервер в сети
            </button>
          )}

          {isElectron && (
            <button
              onClick={handleOffline}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition text-sm transition-colors"
            >
              Работать offline (без синхронизации)
            </button>
          )}

          {status && (
            <div className={`p-3 text-sm rounded-lg transition-colors ${status.includes('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : status.includes('❌') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'}`}>
              {status}
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mt-2 transition-colors">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 transition-colors">Как получить сервер:</h3>
            <ol className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 list-decimal pl-4 transition-colors">
              <li>Нажмите кнопку Deploy to Render в README репозитория</li>
              <li>Дождитесь окончания сборки (3-5 минут)</li>
              <li>Скопируйте URL из Dashboard Render (например: https://planner-backend-xxx.onrender.com)</li>
              <li>Вставьте его выше и нажмите «Подключиться»</li>
            </ol>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 transition-colors">
              Без сервера приложение работает только на этом устройстве.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
