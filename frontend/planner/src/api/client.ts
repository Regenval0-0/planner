import axios from 'axios';

const isDev = import.meta.env.DEV;
const envUrl = import.meta.env.VITE_BACKEND_URL;

// Priority:
// 1. Explicit VITE_BACKEND_URL env var (for GitHub Pages / cloud)
// 2. Dev mode → localhost:3001
// 3. Production with same-origin (Electron bundled mode) → /api
// 4. Fallback to localhost for safety
const baseURL = envUrl
  ? `${envUrl}/api`
  : isDev
    ? 'http://localhost:3001/api'
    : window.location.origin.includes('localhost')
      ? 'http://localhost:3001/api'
      : '/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);
