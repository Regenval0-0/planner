import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { SyncProvider } from './sync/SyncContext.tsx';
import LoginPage from './pages/LoginPage.tsx';
import CalendarPage from './pages/CalendarPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import SetupPage from './pages/SetupPage.tsx';
import { hasBackendUrl } from './api/client.ts';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireSetup({ children }: { children: React.ReactNode }) {
  const isElectron = !!(window as unknown as { electronAPI?: unknown }).electronAPI;
  const isDev = import.meta.env.DEV;
  // Dev + Electron already have backend available; web/cloud needs setup
  if (isDev || isElectron) {
    return <>{children}</>;
  }
  if (!hasBackendUrl()) {
    return <Navigate to="/setup" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          <Routes>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/login" element={
              <RequireSetup>
                <LoginPage />
              </RequireSetup>
            } />
            <Route path="/settings" element={
              <RequireSetup>
                <SettingsPage />
              </RequireSetup>
            } />
            <Route
              path="/"
              element={
                <RequireSetup>
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                </RequireSetup>
              }
            />
          </Routes>
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
