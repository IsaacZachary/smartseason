import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (email, password) => api.post('auth/login/', { email, password }),
  me: () => api.get('auth/me/'),
  register: (data) => api.post('auth/register/', data),
};

export const fieldAPI = {
  list: () => api.get('fields/'),
  retrieve: (id) => api.get(`fields/${id}/`),
  create: (data) => api.post('fields/', data),
  update: (id, data) => api.patch(`fields/${id}/`, data),
  addUpdate: (id, data) => api.post(`fields/${id}/add_update/`, data),
  stats: () => api.get('fields/stats/'),
};

export const userAPI = {
  list: () => api.get('auth/list/'),
};

export default api;
