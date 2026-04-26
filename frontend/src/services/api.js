import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthCheck = error.config.url === '/auth/me';
      if (!isAuthCheck) {
        localStorage.removeItem('token');
        sessionStorage.setItem('returnUrl', window.location.pathname);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
