import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Add Auth Interceptor
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Add Response Interceptor
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

// Helper to handle form data conversion if needed
// Although simple objects can be sent as form data by iterating
export const toFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

export const updateUserStoryStatus = (id, newStatus) => {
  return api.post(`/user-story/${id}/status`, { new_status: newStatus });
};

export default api;
