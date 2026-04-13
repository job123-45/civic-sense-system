import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://civic-backend.onrender.com';

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally (auto-logout on expired token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ---- Auth APIs ----
export const loginUser = (email, password) =>
  API.post('/auth/login', { email, password });

export const signupUser = (name, email, password, role) =>
  API.post('/auth/signup', { name, email, password, role });

export const getMe = () => API.get('/auth/me');

// ---- Issue APIs ----
export const createIssue = (formData) =>
  API.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getIssues = (params) => API.get('/issues', { params });

export const getIssueStats = () => API.get('/issues/stats');

export const getIssueById = (id) => API.get(`/issues/${id}`);

export const updateIssueStatus = (id, status) =>
  API.put(`/issues/${id}/status`, { status });

export const deleteIssue = (id) => API.delete(`/issues/${id}`);

export default API;
