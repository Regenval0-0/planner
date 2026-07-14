import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl, setBackendUrl } from '../api/client.ts';
import { useSync } from '../sync/SyncContext.tsx';
import { useTheme, type ThemeMode, type AccentColor } from '../context/ThemeContext.tsx';

const modeLabels: Record<ThemeMode, string> = {
  light: '☀️ Светлая',
  dark: '🌙 Тёмная',
  system: '💻 Системная',
};

const accentMeta: Record<AccentColor, { label: string; bg: string; ring: string }> = {
  indigo:  { label: 'Индиго',  bg: 'bg-indigo-500',  ring: 'ring-indigo-300' },
  blue:    { label: 'Синий',   bg: 'bg-blue-500',    ring: 'ring-blue-300' },
  emerald: { label: 'Изумруд', bg: 'bg-emerald-500', ring: 'ring-emerald-300' },
  rose:    { label: 'Розовый', bg: 'bg-rose-500',    ring: 'ring-rose-300' },
  amber:   { label: 'Янтарь',  bg: 'bg-amber-500',   ring: 'ring-amber-300' },
};

export default function SettingsPage() {
  const navigate = useNavigate();
  useSync();
  const { mode, accent, setMode, setAccent, effectiveMode } = useTheme();
  const [backendUrl, setUrl] = useState(getBackendUrl());
  const [status, setStatus] = useState('');
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(!!(window as unknown as { electronAPI?: unknown }).electronAPI);
  }, []);

  async function handleSave() {
    setStatus('Проверка...');
    try {
      const testUrl = backendUrl.replace(/\/$/, '');
      await fetch(`${testUrl}/health`, { method: 'GET', mode: 'cors' });
      setBackendUrl(testUrl);
      const win = window as unknown as { electronAPI?: { getBackendUrl?: () => Promise<string>; setBackendUrl?: (url: string) => Promise<boolean> } };
      const electronAPI = win.electronAPI;
      if (electronAPI?.setBackendUrl) {
        await electronAPI.setBackendUrl(testUrl);
      }
      setStatus('✅ Сохранено! Перезагрузите приложение.');
      setTimeout(() => setStatus(''), 3000);
    } catch {
      setStatus('⚠️ Сервер не отвечает. URL сохранён, но проверьте подключение.');
      setBackendUrl(backendUrl.replace(/\/$/, ''));
      const win = window as unknown as { electronAPI?: { getBackendUrl?: () => Promise<string>; setBackendUrl?: (url: string) => Promise<boolean> } };
      const electronAPI = win.electronAPI;
      if (electronAPI?.setBackendUrl) {
        await electronAPI.setBackendUrl(backendUrl.replace(/\/$/, ''));
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 w-full max-w-md transition-colors">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            ← Назад
          </button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Настройки</h1>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Тема оформления
            </h2>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                    mode === m
                      ? 'bg-[var(--color-primary-light)] dark:bg-slate-700 border-[var(--color-primary)] text-[var(--color-primary)] dark:text-white'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {modeLabels[m]}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Сейчас: {effectiveMode === 'dark' ? 'Тёмная' : 'Светлая'}
            </p>
          </section>

          {/* Accent color */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Акцентный цвет
            </h2>
            <div className="flex gap-3">
              {(Object.keys(accentMeta) as AccentColor[]).map((c) => {
                const meta = accentMeta[c];
                return (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    title={meta.label}
                    className={`w-10 h-10 rounded-full ${meta.bg} ${
                      accent === c ? `ring-2 ring-offset-2 ${meta.ring} dark:ring-offset-slate-800` : 'opacity-70 hover:opacity-100'
                    } transition`}
                  >
                    {accent === c && (
                      <svg className="w-5 h-5 text-white mx-auto mt-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <hr className="border-gray-200 dark:border-slate-700" />

          {/* Server URL */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Сервер синхронизации
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL сервера
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-backend.onrender.com"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-gray-900 dark:text-gray-100 transition"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isElectron
                  ? 'Адрес облачного сервера для синхронизации данных'
                  : 'Адрес сервера API. Для GitHub Pages указывается при сборке.'}
              </p>
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-3 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition"
            >
              Сохранить
            </button>

            {status && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 text-sm rounded-lg transition">{status}</div>
            )}
          </section>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Как настроить облако:</h3>
            <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal pl-4">
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
