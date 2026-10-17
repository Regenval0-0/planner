import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { SyncProvider } from './sync/SyncContext.tsx';
import LoginPage from './pages/LoginPage.tsx';
import CalendarPage from './pages/CalendarPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import SetupPage from './pages/SetupPage.tsx';
import PrivacyPage from './pages/PrivacyPage.tsx';
import { hasBackendUrl } from './api/client.ts';

function Splash() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3 text-gray-500 dark:text-gray-400">
      <div className="w-10 h-10 rounded-full border-4 border-gray-200 dark:border-slate-700 border-t-[var(--color-primary)] animate-spin" />
      <span className="text-sm">Загрузка...</span>
    </div>
  );
}

/** Сборка без встроенного адреса сервера — сначала нужно его указать. */
function RequireServer({ children }: { children: ReactNode }) {
  if (!hasBackendUrl()) return <Navigate to="/setup" replace />;
  return <>{children}</>;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, token, loading } = useAuth();
  if (token && !user && loading) return <Splash />;
  if (!token || !user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  if (token && user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          <Routes>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route
              path="/login"
              element={
                <RequireServer>
                  <GuestOnly>
                    <LoginPage />
                  </GuestOnly>
                </RequireServer>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireServer>
                  <RequireAuth>
                    <SettingsPage />
                  </RequireAuth>
                </RequireServer>
              }
            />
            <Route
              path="/"
              element={
                <RequireServer>
                  <RequireAuth>
                    <CalendarPage />
                  </RequireAuth>
                </RequireServer>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
