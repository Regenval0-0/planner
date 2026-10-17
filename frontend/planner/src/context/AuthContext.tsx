import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client.ts';
import { getToken, setToken, UNAUTHORIZED_EVENT } from '../lib/session.ts';
import { getStored, setStored, clearUserData, STORAGE_KEYS } from '../sync/storage.ts';
import { cancelAllReminders } from '../lib/reminders.ts';

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface RegisterData {
  username: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
  acceptPrivacy: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  /** Идёт первичная проверка сохранённого входа. */
  loading: boolean;
  /** Сообщение после принудительного выхода (сессия истекла и т. п.). */
  notice: string;
  clearNotice: () => void;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  applySession: (token: string, user: User) => void;
  logout: (notice?: string) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(() => (getToken() ? getStored<User | null>(STORAGE_KEYS.USER, null) : null));
  const [loading, setLoading] = useState<boolean>(() => !!getToken() && !getStored<User | null>(STORAGE_KEYS.USER, null));
  const [notice, setNotice] = useState('');

  const applySession = useCallback((newToken: string, newUser: User) => {
    const previous = getStored<User | null>(STORAGE_KEYS.USER, null);
    // Вошёл другой пользователь — данные прошлого не должны смешаться с новыми.
    if (previous && previous.id !== newUser.id) {
      clearUserData();
      cancelAllReminders();
    }
    setToken(newToken);
    setStored(STORAGE_KEYS.USER, newUser);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback((message?: string) => {
    setToken(null);
    clearUserData();
    cancelAllReminders();
    setTokenState(null);
    setUser(null);
    setNotice(message || '');
  }, []);

  // Проверка сохранённого входа при запуске. Без интернета остаёмся в аккаунте
  // и работаем с сохранёнными данными; выходим только если сервер отклонил токен.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    api()
      .get('/auth/me')
      .then((res) => {
        if (cancelled) return;
        applySession(res.data.token, res.data.user);
      })
      .catch(() => {
        // 401 обрабатывается событием UNAUTHORIZED_EVENT ниже.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applySession]);

  useEffect(() => {
    const onUnauthorized = () => logout('Сессия завершена. Войдите снова.');
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await api().post('/auth/login', { username: username.trim(), password });
      applySession(res.data.token, res.data.user);
      setNotice('');
    },
    [applySession],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const res = await api().post('/auth/register', data);
      applySession(res.data.token, res.data.user);
      setNotice('');
    },
    [applySession],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const res = await api().post('/auth/change-password', { currentPassword, newPassword });
      if (user) applySession(res.data.token, user);
    },
    [applySession, user],
  );

  const deleteAccount = useCallback(
    async (password: string) => {
      await api().delete('/auth/account', { data: { password } });
      logout('Аккаунт и все данные удалены.');
    },
    [logout],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        notice,
        clearNotice: () => setNotice(''),
        login,
        register,
        applySession,
        logout,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
