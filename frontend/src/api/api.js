import axios from 'axios';

// Create axios instance with base URL for all API calls
const api = axios.create({
  baseURL: '/api',
});

// Request interceptor: Automatically attach JWT token to all outgoing requests for authentication
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor: Handle 401 unauthorized errors by redirecting to login page
api.interceptors.response.use(response => {
  return response;
}, error => {
  // Don't redirect if 401 comes from login endpoint (we want to show error message)
  if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/login')) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

// Convert JavaScript object to FormData for multipart/form-data requests (file uploads, etc.)
export const toFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

// Update issue status via API (used in drag-and-drop board)
export const updateUserStoryStatus = (id, newStatus) => {
  return api.post(`/user-story/${id}/status`, { new_status: newStatus });
};

export default api;
