import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:8000/api',
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
    // 1. Handle Step-up Challenge (MFA delegation to Entra)
    if (error.response?.status === 403 && error.response.data?.requireStepUp) {
      const authUrl = error.response.data.authUrl;
      
      // Store the current request to resume it after MFA
      localStorage.setItem('pendingRequest', JSON.stringify({
        method: error.config.method,
        url: error.config.url,
        data: error.config.data,
        timestamp: Date.now()
      }));

      // Store the current URL so we can return here after MFA
      localStorage.setItem('redirectAfterMfa', window.location.pathname);
      
      // Notify the user before redirecting
      alert('This sensitive action requires elevated security. You will be redirected to Microsoft to verify your identity, and your action will be completed automatically once you return.');
      
      window.location.href = authUrl;
      return new Promise(() => {}); // Stop the original request promise
    }

    // 2. Handle standard Auth errors
    const isAuthCheck = error.config?.url?.includes('/auth/me');
    if (error.response?.status === 401 && !isAuthCheck) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;