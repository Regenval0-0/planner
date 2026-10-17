// Токен входа хранится строкой как есть (не JSON).
const TOKEN_KEY = 'token';

export function getToken(): string | null {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    return t && t.trim() ? t : null;
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // хранилище недоступно
  }
}

/** Событие, которое отправляет API-клиент при ответе 401 (сессия недействительна). */
export const UNAUTHORIZED_EVENT = 'planner:unauthorized';
