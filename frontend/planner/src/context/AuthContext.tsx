import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, initApi, setBackendUrl } from '../api/client.ts';
import { getStored, setStored, removeStored, STORAGE_KEYS } from '../sync/storage.ts';

interface User {
  id: string;
  username: string;
  phone: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStored<User | null>(STORAGE_KEYS.USER, null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Load backend URL from Electron config if available
      const win = window as unknown as { electronAPI?: { getBackendUrl?: () => Promise<string>; setBackendUrl?: (url: string) => Promise<boolean> } };
      const electronAPI = win.electronAPI;
      if (electronAPI?.getBackendUrl) {
        try {
          const savedUrl = await electronAPI.getBackendUrl();
          if (savedUrl) {
            setBackendUrl(savedUrl);
          }
        } catch {
          // ignore
        }
      }
      initApi();

      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data);
          setStored(STORAGE_KEYS.USER, res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          removeStored(STORAGE_KEYS.USER);
        })
        .finally(() => setLoading(false));
    }
    init();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setStored(STORAGE_KEYS.USER, res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    removeStored(STORAGE_KEYS.USER);
    removeStored(STORAGE_KEYS.EVENTS);
    removeStored(STORAGE_KEYS.QUEUE);
    removeStored(STORAGE_KEYS.LAST_SYNC);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
