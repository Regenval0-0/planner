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

  const isElectron = !!(window as any).electronAPI;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Добро пожаловать</h1>
          <p className="text-gray-500 text-sm mt-1">Настройте подключение к серверу</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL сервера
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://planner-backend-xxx.onrender.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Вставьте адрес облачного сервера для синхронизации между устройствами
            </p>
          </div>

          <button
            onClick={handleConnect}
            className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm"
          >
            Подключиться к серверу
          </button>

          {isElectron && (
            <button
              onClick={handleOffline}
              className="w-full px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
            >
              Работать offline (без синхронизации)
            </button>
          )}

          {status && (
            <div className={`p-3 text-sm rounded-lg ${status.includes('✅') ? 'bg-green-50 text-green-700' : status.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              {status}
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Как получить сервер:</h3>
            <ol className="text-xs text-gray-500 space-y-1.5 list-decimal pl-4">
              <li>Нажмите кнопку Deploy to Render в README репозитория</li>
              <li>Дождитесь окончания сборки (3-5 минут)</li>
              <li>Скопируйте URL из Dashboard Render (например: https://planner-backend-xxx.onrender.com)</li>
              <li>Вставьте его выше и нажмите «Подключиться»</li>
            </ol>
            <p className="text-xs text-gray-400 mt-2">
              Без сервера приложение работает только на этом устройстве.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
