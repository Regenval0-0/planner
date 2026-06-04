import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut, getSession } from '@planner/shared';

export interface LocalUser {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        if (typeof window === 'undefined') return;
        const session = await getSession();
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
        } else {
          const current = await getCurrentUser();
          if (mounted) setUser(current);
        }
      } catch (err) {
        console.error('[useAuth] init error:', err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { user: u } = await apiSignIn(email, password);
      setUser(u);
      return u;
    } catch (err: any) {
      console.error('[useAuth] signIn error:', err);
      setError(err?.message || 'Ошибка входа');
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { user: u, session } = await apiSignUp(email, password);
      if (session?.user) {
        setUser(session.user);
        return session.user;
      }
      setUser(u);
      return u;
    } catch (err: any) {
      console.error('[useAuth] signUp error:', err);
      setError(err?.message || 'Ошибка регистрации');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiSignOut();
    } catch (err) {
      console.error('[useAuth] logout error:', err);
    } finally {
      setUser(null);
    }
  }, []);

  return { user, loading, error, signIn, signUp, logout };
}
