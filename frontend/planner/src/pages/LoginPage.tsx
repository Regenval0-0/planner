import { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api/client.ts';
import { Button } from '../components/ui/Button.tsx';

type Mode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    setCode('');
    setError('');
    setPreviewUrl(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { email, password });
      setPreviewUrl(res.data.previewUrl || null);
      setMode('verify');
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify', { email, code });
      localStorage.setItem('token', res.data.token);
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setPreviewUrl(res.data.previewUrl || null);
      setMode('reset');
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/reset-password', { email, code, newPassword: password });
      localStorage.setItem('token', res.data.token);
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white p-6">
      <div className="w-full max-w-sm bg-neutral-800 rounded-2xl p-6 shadow-2xl border border-neutral-700">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {mode === 'login' && 'Sign In'}
          {mode === 'register' && 'Create Account'}
          {mode === 'verify' && 'Verify Email'}
          {mode === 'forgot' && 'Reset Password'}
          {mode === 'reset' && 'Enter Code'}
        </h1>

        {previewUrl && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-sm">
            <p className="font-medium mb-1">Код отправлен (тестовый режим)</p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline break-all"
            >
              Посмотреть письмо
            </a>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
            {error}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:border-sky-500 outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:border-sky-500 outline-none"
              />
            </label>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Sign In'}
            </Button>
            <div className="flex justify-between text-sm text-neutral-400">
              <button type="button" onClick={() => { setMode('register'); resetForm(); }} className="hover:text-white underline">
                Create account
              </button>
              <button type="button" onClick={() => { setMode('forgot'); resetForm(); }} className="hover:text-white underline">
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:border-sky-500 outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:border-sky-500 outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Confirm Password
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:border-sky-500 outline-none"
              />
            </label>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Register'}
            </Button>
            <button type="button" onClick={() => { setMode('login'); resetForm(); }} className="text-sm text-neutral-400 hover:text-white underline text-center">
              Already have an account? Sign in
            </button>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <p className="text-sm text-neutral-400 text-center">
              Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span>
            </p>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Verification Code
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:border-sky-500 outline-none text-center text-lg tracking-widest"
              />
            </label>
            <Button type="submit" disabled={loading || code.length !== 6} className="w-full">
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            <button type="button" onClick={() => { setMode('login'); resetForm(); }} className="text-sm text-neutral-400 hover:text-white underline text-center">
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="flex flex-col gap-4">
            <p className="text-sm text-neutral-400 text-center">
              Enter your email to receive a reset code
            </p>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:border-sky-500 outline-none"
              />
            </label>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Code'}
            </Button>
            <button type="button" onClick={() => { setMode('login'); resetForm(); }} className="text-sm text-neutral-400 hover:text-white underline text-center">
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <p className="text-sm text-neutral-400 text-center">
              Enter the 6-digit code and new password for <span className="text-white font-medium">{email}</span>
            </p>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Reset Code
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:border-sky-500 outline-none text-center text-lg tracking-widest"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              New Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:border-sky-500 outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Confirm New Password
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 focus:border-sky-500 outline-none"
              />
            </label>
            <Button type="submit" disabled={loading || code.length !== 6} className="w-full">
              {loading ? 'Saving...' : 'Save Password'}
            </Button>
            <button type="button" onClick={() => { setMode('login'); resetForm(); }} className="text-sm text-neutral-400 hover:text-white underline text-center">
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
