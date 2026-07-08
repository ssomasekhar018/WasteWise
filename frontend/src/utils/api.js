import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}:`, response.status);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    console.error('Error request URL:', error.config?.url);
    console.error('Error request data:', error.config?.data);
    
    // Check for network errors
    if (!error.response) {
      console.error('Network error or server not responding');
    }
    
    return Promise.reject(error);
  }
);

export default api;