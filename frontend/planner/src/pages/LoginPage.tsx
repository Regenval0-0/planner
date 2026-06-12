import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api/client.ts';
import { Button } from '../components/ui/Button.tsx';
import { Toast } from '../components/ui/Toast.tsx';

type Mode = 'login' | 'register' | 'forgot-login' | 'reset-password';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [foundUsername, setFoundUsername] = useState('');
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    setPhone('');
    setSecurityQuestion('');
    setSecurityAnswer('');
    setError('');
    setSuccessMsg('');
    setFoundUsername('');
    setShowQuestion(false);
    setCurrentQuestion('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль минимум 6 символов');
      return;
    }
    if (!phone.trim()) {
      setError('Введите номер телефона');
      return;
    }
    if (!securityQuestion.trim() || !securityAnswer.trim()) {
      setError('Придумайте секретный вопрос и ответ');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', {
        username,
        password,
        phone,
        securityQuestion,
        securityAnswer,
      });
      localStorage.setItem('token', res.data.token);
      setSuccessMsg('Аккаунт создан! Вход выполнен.');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleFindUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/find-user', { phone });
      setFoundUsername(res.data.username);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Пользователь не найден');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Новый пароль минимум 6 символов');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/reset-password', {
        username,
        securityAnswer,
        newPassword: password,
      });
      localStorage.setItem('token', res.data.token);
      setSuccessMsg('Пароль изменён! Вход выполнен.');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Неверный ответ или ошибка');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestion = async () => {
    if (!username.trim()) {
      setError('Введите логин');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/auth/question/${encodeURIComponent(username.trim())}`);
      setCurrentQuestion(res.data.securityQuestion);
      setShowQuestion(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось получить секретный вопрос');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {successMsg && <Toast message={successMsg} type="success" onClose={() => setSuccessMsg('')} />}

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur rounded-3xl p-8 shadow-2xl border border-slate-700/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-2xl font-bold">П</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            {mode === 'login' && 'Вход'}
            {mode === 'register' && 'Регистрация'}
            {mode === 'forgot-login' && 'Забыли логин?'}
            {mode === 'reset-password' && 'Сброс пароля'}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {mode === 'login' && 'Войдите в свой аккаунт'}
            {mode === 'register' && 'Создайте новый аккаунт'}
            {mode === 'forgot-login' && 'Введите номер телефона'}
            {mode === 'reset-password' && 'Введите логин и ответ на секретный вопрос'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-slate-300">
              Логин
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                placeholder="Ваш логин" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-slate-300">
              Пароль
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                placeholder="••••••" />
            </label>
            <Button type="submit" disabled={loading} className="w-full py-3 text-lg">{loading ? 'Вход...' : 'Войти'}</Button>

            <div className="flex flex-col gap-2 mt-1">
              <button type="button" onClick={() => { setMode('forgot-login'); resetForm(); }}
                className="text-sm text-slate-400 hover:text-sky-400 transition-colors text-center">Забыли логин?</button>
              <button type="button" onClick={() => { setMode('reset-password'); resetForm(); }}
                className="text-sm text-slate-400 hover:text-sky-400 transition-colors text-center">Забыли пароль?</button>
              <button type="button" onClick={() => { setMode('register'); resetForm(); }}
                className="text-sm text-sky-400 hover:text-sky-300 transition-colors text-center font-medium">Нет аккаунта? Создать</button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              placeholder="Придумайте логин (мин. 3 симв.)" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              placeholder="Придумайте пароль (мин. 6 симв.)" />
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              placeholder="Повторите пароль" />
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              placeholder="Номер телефона (для восстановления)" />
            <div className="text-xs text-slate-500 mt-1 mb-1">Секретный вопрос (придумайте сами, на случай если забудете пароль):</div>
            <input type="text" required value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              placeholder="Например: Кличка первого питомца?" />
            <input type="text" required value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              placeholder="Ответ на секретный вопрос" />

            <Button type="submit" disabled={loading} className="w-full py-3 text-lg mt-2">{loading ? 'Создание...' : 'Создать аккаунт'}</Button>
            <button type="button" onClick={() => { setMode('login'); resetForm(); }}
              className="text-sm text-slate-400 hover:text-sky-400 transition-colors text-center">Уже есть аккаунт? Войти</button>
          </form>
        )}

        {mode === 'forgot-login' && (
          <form onSubmit={handleFindUser} className="flex flex-col gap-4">
            {!foundUsername ? (
              <>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  placeholder="Введите номер телефона" />
                <Button type="submit" disabled={loading} className="w-full py-3 text-lg">{loading ? 'Поиск...' : 'Найти логин'}</Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-400 mb-2">Ваш логин:</p>
                <div className="text-2xl font-bold text-white bg-slate-700/50 rounded-xl py-3 px-4">{foundUsername}</div>
              </div>
            )}
            <button type="button" onClick={() => { setMode('login'); resetForm(); }}
              className="text-sm text-slate-400 hover:text-sky-400 transition-colors text-center">Назад ко входу</button>
          </form>
        )}

        {mode === 'reset-password' && (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            {!showQuestion ? (
              <>
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  placeholder="Введите логин" />
                <button type="button" onClick={loadQuestion}
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium transition-all">Продолжить</button>
              </>
            ) : (
              <>
                <div className="text-sm text-slate-300 text-center font-medium">{currentQuestion || 'Секретный вопрос'}</div>
                <div className="text-xs text-slate-500 text-center">Введите ответ, который указывали при регистрации</div>
                <input type="text" required value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  placeholder="Ответ на секретный вопрос" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  placeholder="Новый пароль (мин. 6 симв.)" />
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  placeholder="Повторите новый пароль" />
                <Button type="submit" disabled={loading} className="w-full py-3 text-lg">{loading ? 'Сохранение...' : 'Сменить пароль'}</Button>
              </>
            )}
            <button type="button" onClick={() => { setMode('login'); resetForm(); }}
              className="text-sm text-slate-400 hover:text-sky-400 transition-colors text-center">Назад ко входу</button>
          </form>
        )}
      </div>
    </div>
  );
}
