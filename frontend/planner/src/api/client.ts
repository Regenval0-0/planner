import axios from 'axios';

const isDev = import.meta.env.DEV;
const isGitHubPages = window.location.hostname.includes('github.io');

const baseURL = isDev
  ? 'http://localhost:3001/api'
  : isGitHubPages
    ? 'https://planner-app.onrender.com/api'
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
