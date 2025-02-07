import axios, { AxiosError, AxiosResponse, AxiosInstance } from 'axios';
import { API_CONFIG } from './config';
import { SecureStorage } from './storage';

// Create axios instance with default config
const api: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = SecureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      SecureStorage.clearAuthData();
      // Optionally redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API request wrapper with error handling
async function apiRequest<T,>( // Added closing generic type parameter
  method: string,
  url: string,
  data?: any,
  config = {}
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await api.request({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}

// API methods
export const apiService = {
  get: <T,>(url: string, config = {}) => apiRequest<T>('GET', url, undefined, config),
  post: <T,>(url: string, data: any, config = {}) => apiRequest<T>('POST', url, data, config),
  put: <T,>(url: string, data: any, config = {}) => apiRequest<T>('PUT', url, data, config),
  delete: <T,>(url: string, config = {}) => apiRequest<T>('DELETE', url, undefined, config),
};

export default apiService;
