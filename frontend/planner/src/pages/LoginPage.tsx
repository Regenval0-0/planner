import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api, errorMessage } from '../api/client.ts';
import { Button } from '../components/ui/Button.tsx';

type Mode = 'login' | 'register' | 'reset-password';

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all';

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-slate-300">
      {label}
      {children}
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pr-12`}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={64}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-slate-400 hover:text-slate-200 text-xs"
        aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
      >
        {visible ? 'скрыть' : 'показать'}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const { login, register, applySession, notice, clearNotice } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');

  // Бесплатный сервер может «просыпаться» до минуты — предупреждаем, чтобы не казалось, что всё зависло.
  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, [loading]);

  function switchMode(next: Mode) {
    setMode(next);
    setPassword('');
    setConfirmPassword('');
    setSecurityAnswer('');
    setError('');
    setCurrentQuestion('');
    clearNotice();
  }

  async function run(action: () => Promise<void>, fallback: string) {
    setLoading(true);
    setError('');
    clearNotice();
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err, fallback));
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    run(() => login(username, password), 'Не удалось войти');
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setError('Пароль — минимум 6 символов');
    if (password !== confirmPassword) return setError('Пароли не совпадают');
    if (!securityQuestion.trim() || !securityAnswer.trim()) return setError('Придумайте секретный вопрос и ответ');
    if (!acceptPrivacy) return setError('Нужно согласие с политикой конфиденциальности');
    run(
      () =>
        register({
          username: username.trim(),
          password,
          securityQuestion: securityQuestion.trim(),
          securityAnswer: securityAnswer.trim(),
          acceptPrivacy,
        }),
      'Ошибка регистрации',
    );
  };

  const loadQuestion = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) return setError('Введите логин');
    run(async () => {
      const res = await api().get(`/auth/question/${encodeURIComponent(username.trim())}`);
      setCurrentQuestion(res.data.securityQuestion);
    }, 'Не удалось получить секретный вопрос');
  };

  const handleReset = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setError('Новый пароль — минимум 6 символов');
    if (password !== confirmPassword) return setError('Пароли не совпадают');
    run(async () => {
      const res = await api().post('/auth/reset-password', {
        username: username.trim(),
        securityAnswer,
        newPassword: password,
      });
      applySession(res.data.token, res.data.user);
    }, 'Не удалось сменить пароль');
  };

  const titles: Record<Mode, [string, string]> = {
    login: ['Вход', 'Войдите, чтобы планер был на всех ваших устройствах'],
    register: ['Регистрация', 'Создайте аккаунт'],
    'reset-password': ['Сброс пароля', 'Ответьте на секретный вопрос'],
  };

  const linkClass = 'text-sm text-slate-400 hover:text-sky-400 transition-colors text-center py-1';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white safe-area safe-top">
      <div className="w-[calc(100%-2rem)] max-w-md my-8 bg-slate-800/80 backdrop-blur rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/50">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-2xl font-bold">
            П
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            {titles[mode][0]}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">{titles[mode][1]}</p>
        </div>

        {notice && (
          <div className="mb-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-sm">{notice}</div>
        )}
        {error && (
          <div role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}
        {loading && slow && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
            Подключение к серверу может занять до минуты, подождите...
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Field label="Логин">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="Ваш логин"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                maxLength={30}
              />
            </Field>
            <Field label="Пароль">
              <PasswordInput value={password} onChange={setPassword} placeholder="Ваш пароль" autoComplete="current-password" />
            </Field>
            <Button type="submit" disabled={loading} className="w-full py-3 text-lg">
              {loading ? 'Вход...' : 'Войти'}
            </Button>
            <div className="flex flex-col gap-1 mt-1">
              <button type="button" onClick={() => switchMode('register')} className="text-sm text-sky-400 hover:text-sky-300 font-medium text-center py-1">
                Нет аккаунта? Создать
              </button>
              <button type="button" onClick={() => switchMode('reset-password')} className={linkClass}>
                Забыли пароль?
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <Field label="Логин" hint="3–30 символов: буквы, цифры, точка, дефис, подчёркивание. Большие и маленькие буквы не различаются">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                minLength={3}
                maxLength={30}
              />
            </Field>
            <Field label="Пароль" hint="Не короче 6 символов">
              <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
            </Field>
            <Field label="Повторите пароль">
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
            </Field>
            <Field label="Секретный вопрос" hint="Единственный способ восстановить пароль — запомните ответ">
              <input
                type="text"
                required
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className={inputClass}
                placeholder="Например: кличка первого питомца?"
                maxLength={200}
              />
            </Field>
            <Field label="Ответ" hint="Регистр букв не важен">
              <input
                type="text"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className={inputClass}
                autoComplete="off"
                maxLength={200}
              />
            </Field>
            <label className="flex items-start gap-3 text-sm text-slate-300 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-sky-500 flex-shrink-0"
              />
              <span>
                Я согласен(на) на обработку моих данных в соответствии с{' '}
                <Link to="/privacy" className="text-sky-400 underline">
                  политикой конфиденциальности
                </Link>
              </span>
            </label>
            <Button type="submit" disabled={loading} className="w-full py-3 text-lg mt-2">
              {loading ? 'Создание...' : 'Создать аккаунт'}
            </Button>
            <button type="button" onClick={() => switchMode('login')} className={linkClass}>
              Уже есть аккаунт? Войти
            </button>
          </form>
        )}

        {mode === 'reset-password' && (
          <form onSubmit={currentQuestion ? handleReset : loadQuestion} className="flex flex-col gap-4">
            {!currentQuestion ? (
              <>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="Ваш логин"
                  autoComplete="username"
                  autoCapitalize="none"
                />
                <Button type="submit" disabled={loading} className="w-full py-3 text-lg">
                  {loading ? 'Загрузка...' : 'Продолжить'}
                </Button>
              </>
            ) : (
              <>
                <div className="text-sm text-slate-200 text-center font-medium bg-slate-700/40 rounded-xl p-3">
                  {currentQuestion}
                </div>
                <input
                  type="text"
                  required
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className={inputClass}
                  placeholder="Ответ на секретный вопрос"
                  autoComplete="off"
                />
                <PasswordInput value={password} onChange={setPassword} placeholder="Новый пароль (от 6 символов)" autoComplete="new-password" />
                <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Повторите новый пароль" autoComplete="new-password" />
                <Button type="submit" disabled={loading} className="w-full py-3 text-lg">
                  {loading ? 'Сохранение...' : 'Сменить пароль и войти'}
                </Button>
              </>
            )}
            <button type="button" onClick={() => switchMode('login')} className={linkClass}>
              Назад ко входу
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/privacy" className="text-xs text-slate-500 hover:text-slate-300">
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </div>
  );
}
