import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          Cookies.set('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register/', userData),
  login: async (credentials) => {
    const response = await api.post('/api/auth/login/', credentials);
    const { access, refresh } = response.data;
    
    // Store tokens in cookies
    Cookies.set('access_token', access);
    Cookies.set('refresh_token', refresh);
    
    return response;
  },
  logout: async () => {
    const refreshToken = Cookies.get('refresh_token');
    if (refreshToken) {
      await api.post('/api/auth/logout/', { refresh: refreshToken });
    }
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  },
  refresh: (refreshToken) => api.post('/api/auth/refresh/', { refresh: refreshToken }),
};

// Sessions API
export const sessionsAPI = {
  list: () => api.get('/api/sessions/'),
  create: (sessionData) => api.post('/api/sessions/', sessionData),
  get: (id) => api.get(`/api/sessions/${id}/`),
  update: (id, sessionData) => api.put(`/api/sessions/${id}/`, sessionData),
  delete: (id) => api.delete(`/api/sessions/${id}/`),
};

// Messages API
export const messagesAPI = {
  list: (sessionId) => api.get(`/api/messages/?session=${sessionId}`),
  create: (messageData) => api.post('/api/messages/', messageData),
  get: (id) => api.get(`/api/messages/${id}/`),
  update: (id, messageData) => api.put(`/api/messages/${id}/`, messageData),
  delete: (id) => api.delete(`/api/messages/${id}/`),
};

// AI Agent API
export const aiAPI = {
  healthCheck: () => api.get('/api/ai/health/'),
  generate: (data) => api.post('/api/ai/generate/', data),
  refine: (data) => api.post('/api/ai/refine/', data),
  extractDetails: (data) => api.post('/api/ai/extract-details/', data),
};

// Documents API
export const documentsAPI = {
  list: () => api.get('/api/documents/'),
  create: (documentData) => api.post('/api/documents/', documentData),
  get: (id) => api.get(`/api/documents/${id}/`),
  update: (id, documentData) => api.put(`/api/documents/${id}/`, documentData),
  delete: (id) => api.delete(`/api/documents/${id}/`),
  generate: (id) => api.post(`/api/documents/${id}/generate/`),
  download: (id, format = 'docx') => {
    return api.get(`/api/documents/${id}/download/?format=${format}`, {
      responseType: 'blob',
    });
  },
};

// Document Details API
export const documentDetailsAPI = {
  list: () => api.get('/api/document-details/'),
  create: (detailsData) => api.post('/api/document-details/', detailsData),
  get: (id) => api.get(`/api/document-details/${id}/`),
  update: (id, detailsData) => api.put(`/api/document-details/${id}/`, detailsData),
  delete: (id) => api.delete(`/api/document-details/${id}/`),
};

// Utility functions
export const isAuthenticated = () => {
  return !!Cookies.get('access_token');
};

export const getAuthToken = () => {
  return Cookies.get('access_token');
};

export default api;
