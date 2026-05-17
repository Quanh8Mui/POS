import axios from 'axios';

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!['get', 'head', 'options', 'trace'].includes(method)) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers = config.headers || {};
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
});

export default api;
