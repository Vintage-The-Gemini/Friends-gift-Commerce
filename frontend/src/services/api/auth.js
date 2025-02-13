// src/services/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await api.post('/auth/refresh-token');
        const { token } = response.data;

        localStorage.setItem('token', token);
        originalRequest.headers['Authorization'] = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        authService.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Registration failed');
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Login failed');
    }
  },

  adminLogin: async (credentials) => {
    try {
      const response = await api.post('/admin/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Admin login failed');
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/signin';
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  handleError: (error, defaultMessage) => {
    if (error.response?.data?.message) {
      return error.response.data;
    }
    
    if (error.response?.status === 401) {
      return { message: 'Your session has expired. Please login again.' };
    }
    
    if (error.response?.status === 403) {
      return { message: 'You are not authorized to perform this action.' };
    }
    
    if (error.response?.status === 404) {
      return { message: 'The requested resource was not found.' };
    }
    
    if (error.response?.status >= 500) {
      return { message: 'Server error. Please try again later.' };
    }
    
    return { message: defaultMessage };
  }
};

export default authService;