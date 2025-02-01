import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Types and Interfaces
interface UserData {
    id: string;
    email: string;
    [key: string]: any; // For additional user properties
  }
  
  interface AccountData {
    id: string;
    [key: string]: any; // For additional account properties
  }
  
  type StorageKeys = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
  
  interface ApiConfig {
    baseURL: string;
    timeout: number;
    withCredentials: boolean;
  }
  

  // Environment configuration
const API_CONFIG: ApiConfig = {
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 50000,
    withCredentials: true,
  };
  
  const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    ACCOUNT_DATA: 'account_data',
    ROLE: 'user_role',
  } as const;
  
  // Storage utilities
  class SecureStorage {
    static get<T>(key: StorageKeys): T | null {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error(`Error retrieving ${key}:`, error);
        return null;
      }
    }
  
    static set(key: StorageKeys, value: unknown): void {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error storing ${key}:`, error);
        throw new Error('Storage operation failed');
      }
    }
  
    static remove(key: StorageKeys): void {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key}:`, error);
      }
    }
  }
  
  // Auth utilities
  export const getToken = (): string | null => 
    localStorage.getItem(STORAGE_KEYS.TOKEN);
  
  export const getUserData = (): UserData | null => 
    SecureStorage.get<UserData>(STORAGE_KEYS.USER_DATA);
  
  export const getAccountData = (): AccountData | null => 
    SecureStorage.get<AccountData>(STORAGE_KEYS.ACCOUNT_DATA);
  
  export const getRole = (): string | null => 
    localStorage.getItem(STORAGE_KEYS.ROLE);
  
  export const storeAuthData = (
    token: string,
    userData: UserData,
    accountData: AccountData,
    role: string
  ): void => {
    if (!token || !userData || !accountData || !role) {
      throw new Error('Invalid authentication data');
    }
  
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    SecureStorage.set(STORAGE_KEYS.USER_DATA, userData);
    SecureStorage.set(STORAGE_KEYS.ACCOUNT_DATA, accountData);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  };
  
  export const clearAuthData = (): void => {
    Object.values(STORAGE_KEYS).forEach(key => SecureStorage.remove(key));
  };
  
  // API client configuration
  const api: AxiosInstance = axios.create(API_CONFIG);
  
  // Request interceptor
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );
  
  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (!error.response) {
        console.error('Network error:', error);
        return Promise.reject(new Error('Network error occurred'));
      }
  
      switch (error.response.status) {
        case 401:
          clearAuthData();
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden access:', error);
          break;
        case 500:
          console.error('Server error:', error);
          break;
      }
  
      return Promise.reject(error);
    }
  );
  
  // Token management for API client
  export const setAuthToken = (token: string | null): void => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  };
  
  export default api;