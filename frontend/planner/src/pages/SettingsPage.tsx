import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl, setBackendUrl } from '../api/client.ts';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [backendUrl, setUrl] = useState(getBackendUrl());
  const [status, setStatus] = useState('');
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(!!(window as any).electronAPI);
  }, []);

  async function handleSave() {
    setStatus('Проверка...');
    try {
      // Test the URL
      const testUrl = backendUrl.replace(/\/$/, '');
      await fetch(`${testUrl}/health`, { method: 'GET', mode: 'cors' });

      setBackendUrl(testUrl);

      // Save to Electron config if available
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.setBackendUrl) {
        await electronAPI.setBackendUrl(testUrl);
      }

      setStatus('✅ Сохранено! Перезагрузите приложение.');
      setTimeout(() => setStatus(''), 3000);
    } catch {
      setStatus('⚠️ Сервер не отвечает. URL сохранён, но проверьте подключение.');
      setBackendUrl(backendUrl.replace(/\/$/, ''));
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.setBackendUrl) {
        await electronAPI.setBackendUrl(backendUrl.replace(/\/$/, ''));
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            ← Назад
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Настройки</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL сервера
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-backend.onrender.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isElectron
                ? 'Адрес облачного сервера для синхронизации данных'
                : 'Адрес сервера API. Для GitHub Pages указывается при сборке.'}
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Сохранить
          </button>

          {status && (
            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">{status}</div>
          )}

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Как настроить облако:</h3>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal pl-4">
              <li>Задеплойте backend на Render.com (бесплатно)</li>
              <li>Скопируйте URL (например: https://planner-backend-xxx.onrender.com)</li>
              <li>Вставьте его выше и нажмите "Сохранить"</li>
              <li>Перезапустите приложение</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
