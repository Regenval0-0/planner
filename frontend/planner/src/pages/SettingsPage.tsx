import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useSync } from '../sync/SyncContext.tsx';
import { useTheme, type ThemeMode, type AccentColor } from '../context/ThemeContext.tsx';
import {
  getBackendUrl,
  setBackendUrl,
  checkServer,
  errorMessage,
  isCustomBackend,
  BUILT_IN_BACKEND_URL,
} from '../api/client.ts';
import type { EventCreate, EventItem } from '../api/events.ts';
import { APP_VERSION } from '../config/app.ts';
import { isNative } from '../lib/platform.ts';
import ConfirmModal from '../components/ConfirmModal.tsx';

const modeLabels: Record<ThemeMode, string> = {
  light: '☀️ Светлая',
  dark: '🌙 Тёмная',
  system: '⚙️ Как в системе',
};

const accentMeta: Record<AccentColor, { label: string; bg: string; ring: string }> = {
  indigo: { label: 'Индиго', bg: 'bg-indigo-500', ring: 'ring-indigo-300' },
  blue: { label: 'Синий', bg: 'bg-blue-500', ring: 'ring-blue-300' },
  emerald: { label: 'Изумруд', bg: 'bg-emerald-500', ring: 'ring-emerald-300' },
  rose: { label: 'Розовый', bg: 'bg-rose-500', ring: 'ring-rose-300' },
  amber: { label: 'Янтарь', bg: 'bg-amber-500', ring: 'ring-amber-300' },
};

const inputClass =
  'w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-gray-900 dark:text-gray-100';
const secondaryBtn =
  'px-3 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition text-sm disabled:opacity-50';
const primaryBtn =
  'px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition text-sm disabled:opacity-50';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Message({ kind, text }: { kind: 'ok' | 'error' | 'info'; text: string }) {
  const colors = {
    ok: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    info: 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300',
  };
  return <div className={`mt-3 p-3 text-sm rounded-lg ${colors[kind]}`}>{text}</div>;
}

type Msg = { kind: 'ok' | 'error' | 'info'; text: string } | null;

function formatTime(ts: number | null): string {
  if (!ts) return 'ещё не было';
  return new Date(ts).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, changePassword, deleteAccount } = useAuth();
  const { events, pendingCount, isSyncing, isOnline, lastSync, syncNow, createEvent } = useSync();
  const { mode, accent, setMode, setAccent } = useTheme();

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<Msg>(null);
  const [passBusy, setPassBusy] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePass, setDeletePass] = useState('');
  const [deleteMsg, setDeleteMsg] = useState<Msg>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const [serverUrl, setServerUrl] = useState(getBackendUrl());
  const [serverMsg, setServerMsg] = useState<Msg>(null);
  const [importMsg, setImportMsg] = useState<Msg>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (newPass.length < 6) {
      setPassMsg({ kind: 'error', text: 'Новый пароль — минимум 6 символов' });
      return;
    }
    setPassBusy(true);
    setPassMsg(null);
    try {
      await changePassword(oldPass, newPass);
      setOldPass('');
      setNewPass('');
      setPassMsg({ kind: 'ok', text: 'Пароль изменён. На других устройствах нужно войти заново.' });
    } catch (err) {
      setPassMsg({ kind: 'error', text: errorMessage(err, 'Не удалось сменить пароль') });
    } finally {
      setPassBusy(false);
    }
  }

  async function handleDeleteAccount() {
    setConfirmDelete(false);
    setDeleteBusy(true);
    setDeleteMsg(null);
    try {
      await deleteAccount(deletePass);
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteMsg({ kind: 'error', text: errorMessage(err, 'Не удалось удалить аккаунт') });
    } finally {
      setDeleteBusy(false);
    }
  }

  function handleLogout() {
    if (pendingCount > 0 && !confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    logout();
    navigate('/login', { replace: true });
  }

  async function handleSaveServer() {
    let url = serverUrl.trim().replace(/\/+$/, '');
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
    const target = url || BUILT_IN_BACKEND_URL;
    if (!target) {
      setServerMsg({ kind: 'error', text: 'Укажите адрес сервера' });
      return;
    }
    setServerMsg({ kind: 'info', text: 'Проверка сервера...' });
    if (!(await checkServer(target))) {
      setServerMsg({ kind: 'error', text: 'Сервер не отвечает. Адрес не сохранён.' });
      return;
    }
    setBackendUrl(target);
    setServerUrl(getBackendUrl());
    // Аккаунт на другом сервере — другой, поэтому выходим.
    logout('Сервер изменён. Войдите в аккаунт на этом сервере.');
    navigate('/login', { replace: true });
  }

  function exportData() {
    const data = { app: 'planner', version: 2, exportedAt: new Date().toISOString(), events };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planner-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleImportFile(file: File) {
    setImportMsg(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result));
        const list: EventItem[] = Array.isArray(data) ? data : data.events;
        if (!Array.isArray(list)) throw new Error('В файле нет списка событий');
        const key = (e: { title: string; startDate: string; type: string }) =>
          `${e.type}|${e.title}|${new Date(e.startDate).getTime()}`;
        const existing = new Set(events.map(key));
        let added = 0;
        for (const e of list) {
          if (!e || typeof e.startDate !== 'string' || Number.isNaN(new Date(e.startDate).getTime())) continue;
          if (existing.has(key(e))) continue;
          const payload: EventCreate = {
            title: String(e.title || '').slice(0, 200),
            description: e.description ? String(e.description).slice(0, 2000) : null,
            startDate: new Date(e.startDate).toISOString(),
            endDate: e.endDate ? new Date(e.endDate).toISOString() : null,
            type: (['event', 'task', 'meeting', 'payment'] as const).includes(e.type) ? e.type : 'event',
            recurrence: e.recurrence ?? null,
            recurrenceEnd: e.recurrenceEnd ? new Date(e.recurrenceEnd).toISOString() : null,
            recurrenceInterval: e.recurrenceInterval ?? null,
            amount: typeof e.amount === 'number' ? e.amount : null,
            reminderMinutes: typeof e.reminderMinutes === 'number' ? e.reminderMinutes : null,
          };
          await createEvent(payload);
          existing.add(key(e));
          added++;
        }
        setImportMsg({ kind: 'ok', text: added ? `Добавлено событий: ${added}` : 'Новых событий в файле нет' });
      } catch (err) {
        setImportMsg({ kind: 'error', text: 'Ошибка импорта: ' + (err instanceof Error ? err.message : String(err)) });
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 safe-area">
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur border-b border-gray-200 dark:border-slate-700 safe-top">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="-ml-2 px-2 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            aria-label="Назад"
          >
            ← Назад
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Настройки</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4 pb-10">
        <Section title="Аккаунт">
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div>
              Логин: <span className="font-medium text-gray-900 dark:text-gray-100">{user?.username}</span>
            </div>
          </div>
          <button onClick={handleLogout} className={`${secondaryBtn} mt-3 w-full`}>
            Выйти из аккаунта
          </button>
          {confirmLogout && (
            <Message
              kind="error"
              text={`Есть неотправленные изменения (${pendingCount}). Подключитесь к интернету и дождитесь синхронизации, иначе они пропадут. Нажмите «Выйти» ещё раз, чтобы выйти всё равно.`}
            />
          )}
        </Section>

        <Section title="Синхронизация">
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <div>
              Состояние:{' '}
              {!isOnline ? 'нет интернета' : isSyncing ? 'синхронизация...' : pendingCount > 0 ? 'есть неотправленные изменения' : 'всё сохранено'}
            </div>
            <div>Последняя синхронизация: {formatTime(lastSync)}</div>
            {pendingCount > 0 && <div>Ожидают отправки: {pendingCount}</div>}
          </div>
          <button onClick={() => syncNow()} disabled={isSyncing || !isOnline} className={`${secondaryBtn} mt-3 w-full`}>
            Синхронизировать сейчас
          </button>
        </Section>

        <Section title="Оформление">
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2 py-2 rounded-lg text-sm font-medium border transition ${
                  mode === m
                    ? 'bg-[var(--color-primary-light)] dark:bg-slate-700 border-[var(--color-primary)] text-[var(--color-primary)] dark:text-white'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                {modeLabels[m]}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            {(Object.keys(accentMeta) as AccentColor[]).map((c) => {
              const meta = accentMeta[c];
              return (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  title={meta.label}
                  aria-label={meta.label}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.bg} ${
                    accent === c ? `ring-2 ring-offset-2 ${meta.ring} dark:ring-offset-slate-800` : 'opacity-70 hover:opacity-100'
                  } transition`}
                >
                  {accent === c && (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Напоминания">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isNative()
              ? 'Напоминания приходят как уведомления телефона, даже когда приложение закрыто. Если они не приходят — разрешите уведомления для «Планера» в настройках Android.'
              : 'Напоминания приходят как уведомления Windows, пока программа запущена (при закрытии окна она остаётся в трее рядом с часами).'}
          </p>
        </Section>

        <Section title="Смена пароля">
          <form onSubmit={handleChangePassword} className="space-y-2">
            <input
              type="password"
              required
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              placeholder="Текущий пароль"
              autoComplete="current-password"
              className={inputClass}
            />
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Новый пароль (от 6 символов)"
              autoComplete="new-password"
              className={inputClass}
            />
            <button type="submit" disabled={passBusy || !isOnline} className={`${primaryBtn} w-full`}>
              {passBusy ? 'Сохранение...' : 'Сменить пароль'}
            </button>
          </form>
          {passMsg && <Message {...passMsg} />}
        </Section>

        <Section title="Резервная копия">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            События хранятся на сервере и доступны на всех устройствах после входа. Файл копии можно сохранить
            {isNative() ? ' в программе для ПК' : ''} и загрузить обратно.
          </p>
          <div className="flex gap-2">
            {!isNative() && (
              <button onClick={exportData} className={`${secondaryBtn} flex-1`}>
                📤 Сохранить в файл
              </button>
            )}
            <button onClick={() => fileInputRef.current?.click()} className={`${secondaryBtn} flex-1`}>
              📥 Загрузить из файла
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = '';
            }}
          />
          {importMsg && <Message {...importMsg} />}
        </Section>

        <Section title="О приложении">
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <div>Версия {APP_VERSION}</div>
            <Link to="/privacy" className="text-[var(--color-primary)] hover:underline">
              Политика конфиденциальности
            </Link>
          </div>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-gray-500 dark:text-gray-400">Сервер (для опытных)</summary>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Сейчас: {getBackendUrl() || 'не задан'}
                {isCustomBackend() ? ' (свой адрес)' : ''}
              </p>
              <input
                type="url"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder={BUILT_IN_BACKEND_URL || 'https://...'}
                autoCapitalize="none"
                className={inputClass}
              />
              <div className="flex gap-2">
                <button onClick={handleSaveServer} className={`${secondaryBtn} flex-1`}>
                  Сохранить
                </button>
                {isCustomBackend() && BUILT_IN_BACKEND_URL && (
                  <button
                    onClick={() => {
                      setServerUrl('');
                      setBackendUrl('');
                      logout('Восстановлен стандартный сервер. Войдите снова.');
                      navigate('/login', { replace: true });
                    }}
                    className={`${secondaryBtn} flex-1`}
                  >
                    По умолчанию
                  </button>
                )}
              </div>
              {serverMsg && <Message {...serverMsg} />}
            </div>
          </details>
        </Section>

        <Section title="Удаление аккаунта">
          {!deleteOpen ? (
            <button
              onClick={() => setDeleteOpen(true)}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Удалить аккаунт
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Аккаунт и все события будут удалены с сервера безвозвратно. Введите пароль для подтверждения.
              </p>
              <input
                type="password"
                value={deletePass}
                onChange={(e) => setDeletePass(e.target.value)}
                placeholder="Пароль"
                autoComplete="current-password"
                className={inputClass}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={!deletePass || deleteBusy || !isOnline}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {deleteBusy ? 'Удаление...' : 'Удалить навсегда'}
                </button>
                <button
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeletePass('');
                    setDeleteMsg(null);
                  }}
                  className={`${secondaryBtn} flex-1`}
                >
                  Отмена
                </button>
              </div>
              {deleteMsg && <Message {...deleteMsg} />}
            </div>
          )}
        </Section>
      </main>

      <ConfirmModal
        isOpen={confirmDelete}
        title="Удалить аккаунт?"
        message="Все события будут удалены безвозвратно на всех устройствах."
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
