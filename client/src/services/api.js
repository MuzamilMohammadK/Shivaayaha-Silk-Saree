import axios from 'axios';

// In local dev: Vite proxies '/api' → 'http://localhost:5000/api'
// In production (GitHub Pages): VITE_API_URL must be set to your deployed backend URL
//   e.g. https://your-app.railway.app/api
//   Set it as a GitHub Actions secret: VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Warn clearly if the app is running in production without a backend URL configured
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn(
    '[Shivaayaha] VITE_API_URL is not set.\n' +
    'API calls will fail on GitHub Pages (static host).\n' +
    'Deploy the Express backend and set VITE_API_URL in your GitHub Actions secrets.'
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
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

// Intercept error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 405 Method Not Allowed = hitting GitHub Pages with API calls (no backend configured)
    if (error.response && error.response.status === 405) {
      console.error(
        '[Shivaayaha] 405 Method Not Allowed — the backend server is not configured.\n' +
        'Set the VITE_API_URL GitHub secret to your deployed backend URL.'
      );
    }

    // 401 Unauthorized = expired/invalid token → clear storage and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('shivaayaha_token');
      sessionStorage.removeItem('shivaayaha_token');
      localStorage.removeItem('shivaayaha_user');
      // Use base-path-aware redirect (works for both local dev and GitHub Pages)
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        const base = import.meta.env.BASE_URL || '/';
        window.location.href = base.replace(/\/$/, '') + '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
