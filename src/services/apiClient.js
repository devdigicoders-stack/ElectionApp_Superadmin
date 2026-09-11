import axios from 'axios';

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'https://election.digicoders.in').replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token to every request if available
apiClient.interceptors.request.use(
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

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token
      localStorage.removeItem('token');
      // Only redirect if we are not already on the login page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
