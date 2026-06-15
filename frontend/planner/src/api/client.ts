import axios from 'axios';

const isDev = import.meta.env.DEV;
const envUrl = import.meta.env.VITE_BACKEND_URL;

function getBaseURL(): string {
  // Priority 1: Electron config (loaded into localStorage by app init)
  const storedUrl = localStorage.getItem('backendUrl');
  if (storedUrl && storedUrl.trim()) {
    return `${storedUrl.replace(/\/$/, '')}/api`;
  }

  // Priority 2: Build-time env var (for GitHub Pages / cloud)
  if (envUrl) {
    return `${envUrl}/api`;
  }

  // Priority 3: Dev mode
  if (isDev) {
    return 'http://localhost:3001/api';
  }

  // Priority 4: Fallback
  return 'http://localhost:3001/api';
}

export let api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export function initApi() {
  const baseURL = getBaseURL();
  api = axios.create({
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
}

export function setBackendUrl(url: string) {
  localStorage.setItem('backendUrl', url);
  initApi();
}

export function getBackendUrl(): string {
  const stored = localStorage.getItem('backendUrl');
  if (stored && stored.trim()) return stored.replace(/\/$/, '');
  if (envUrl) return envUrl;
  if (isDev) return 'http://localhost:3001';
  return 'http://localhost:3001';
}

export function hasBackendUrl(): boolean {
  const stored = localStorage.getItem('backendUrl');
  return !!(stored && stored.trim() && stored !== 'http://localhost:3001');
}

initApi();
