import axios, { type AxiosInstance } from 'axios';
import { getToken, UNAUTHORIZED_EVENT } from '../lib/session.ts';

const OVERRIDE_KEY = 'backendUrl';

/** Адрес сервера, встроенный при сборке (VITE_BACKEND_URL в .env.production). */
export const BUILT_IN_BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');

function readOverride(): string {
  try {
    return (localStorage.getItem(OVERRIDE_KEY) || '').trim().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

/** Текущий адрес сервера: свой из настроек → встроенный → localhost в режиме разработки. */
export function getBackendUrl(): string {
  const override = readOverride();
  if (override) return override;
  if (BUILT_IN_BACKEND_URL) return BUILT_IN_BACKEND_URL;
  if (import.meta.env.DEV) return 'http://localhost:3001';
  return '';
}

export function hasBackendUrl(): boolean {
  return !!getBackendUrl();
}

export function isCustomBackend(): boolean {
  return !!readOverride();
}

/** Сохранить свой адрес сервера. Пустая строка — вернуть встроенный. */
export function setBackendUrl(url: string) {
  const clean = url.trim().replace(/\/+$/, '');
  try {
    if (clean && clean !== BUILT_IN_BACKEND_URL) localStorage.setItem(OVERRIDE_KEY, clean);
    else localStorage.removeItem(OVERRIDE_KEY);
  } catch {
    // хранилище недоступно
  }
  instance = null;
}

/** Проверка, что по адресу отвечает сервер Планера. */
export async function checkServer(url: string, timeoutMs = 60000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/health`, { signal: controller.signal });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return !!data?.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

let instance: AxiosInstance | null = null;
let instanceBase = '';

/** HTTP-клиент API. Создаётся заново, если адрес сервера изменился. */
export function api(): AxiosInstance {
  const base = `${getBackendUrl()}/api`;
  if (instance && instanceBase === base) return instance;

  const created = axios.create({
    baseURL: base,
    // Бесплатный сервер Render после сна просыпается до минуты.
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
  });
  created.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  created.interceptors.response.use(
    (r) => r,
    (error) => {
      const url: string = error?.config?.url || '';
      const isLoginCall = url.startsWith('/auth/login') || url.startsWith('/auth/register') || url.startsWith('/auth/reset-password');
      if (error?.response?.status === 401 && !isLoginCall && getToken()) {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
      return Promise.reject(error);
    },
  );
  instance = created;
  instanceBase = base;
  return created;
}

/** Понятный текст ошибки запроса. */
export function errorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { status?: number; data?: { error?: string } }; code?: string; message?: string };
  if (e?.response?.data?.error) return e.response.data.error;
  if (e?.code === 'ECONNABORTED') return 'Сервер долго не отвечает. Попробуйте ещё раз.';
  if (!e?.response) return 'Нет связи с сервером. Проверьте интернет.';
  return fallback;
}

/** Ошибка сети или временная ошибка сервера — запрос стоит повторить позже. */
export function isRetryableError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (!status) return true;
  return status >= 500 || status === 429 || status === 408 || status === 401;
}
