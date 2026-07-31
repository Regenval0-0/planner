import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
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
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [localIpUrl, setLocalIpUrl] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const electron = !!(window as unknown as { electronAPI?: unknown }).electronAPI;
    setIsElectron(electron);
    if (electron) {
      const win = window as unknown as { electronAPI?: { getLocalIp?: () => Promise<string> } };
      win.electronAPI?.getLocalIp?.().then((ip) => {
        const url = `http://${ip}:3001`;
        setLocalIpUrl(url);
        QRCode.toDataURL(url, { width: 200, margin: 2 }).then(setQrDataUrl);
      });
    }
  }, []);

  function exportData() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      events: JSON.parse(localStorage.getItem('planner_events') || '[]'),
      queue: JSON.parse(localStorage.getItem('planner_queue') || '[]'),
      user: JSON.parse(localStorage.getItem('planner_user') || 'null'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(file: File) {
    setImportStatus('');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data.events)) throw new Error('Нет поля events');
        const existing = JSON.parse(localStorage.getItem('planner_events') || '[]');
        const map = new Map<string, any>();
        for (const e of existing) map.set(e.id, e);
        for (const e of data.events) {
          const cur = map.get(e.id);
          if (!cur || new Date(e.updatedAt) >= new Date(cur.updatedAt)) {
            map.set(e.id, e);
          }
        }
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        localStorage.setItem('planner_events', JSON.stringify(merged));
        if (Array.isArray(data.queue)) {
          localStorage.setItem('planner_queue', JSON.stringify(data.queue));
        }
        setImportStatus(`✅ Импортировано ${data.events.length} событий. Перезагрузите страницу.`);
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        setImportStatus('❌ Ошибка импорта: ' + (e instanceof Error ? e.message : String(e)));
      }
    };
    reader.readAsText(file);
  }

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

          {isElectron && qrDataUrl && (
            <section className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                📱 Подключение телефона
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Отсканируйте QR-код на Android для подключения к этому серверу
              </p>
              <div className="flex flex-col items-center gap-2">
                <img src={qrDataUrl} alt="QR-код сервера" className="rounded-lg border border-gray-200 dark:border-slate-600" />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{localIpUrl}</p>
              </div>
            </section>
          )}

          <section className="border-t border-gray-200 dark:border-slate-700 pt-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              💾 Резервная копия
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Экспортируйте данные в JSON и перенесите на другое устройство без сервера
            </p>
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition text-sm"
              >
                📤 Экспорт
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition text-sm"
              >
                📥 Импорт
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                if (e.target) e.target.value = '';
              }}
            />
            {importStatus && (
              <div className="mt-3 p-3 text-sm rounded-lg transition-colors bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">{importStatus}</div>
            )}
          </section>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Правовая информация</h3>
            <a
              href="https://github.com/Regenval0-0/planner/blob/main/frontend/planner/rustore-assets/PRIVACY_POLICY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              Политика конфиденциальности
            </a>
          </div>

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
