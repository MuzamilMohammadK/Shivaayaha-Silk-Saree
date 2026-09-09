import axios from 'axios';

// When running in Capacitor on an Android device or emulator, requests go to localhost:5000 or the local machine IP
// In web development, Vite proxies '/api' to 'http://localhost:5000/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shivaayaha_token') || sessionStorage.getItem('shivaayaha_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized responses to clear token and prompt login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('shivaayaha_token');
      sessionStorage.removeItem('shivaayaha_token');
      localStorage.removeItem('shivaayaha_user');
      // Only redirect if not already on login or register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
