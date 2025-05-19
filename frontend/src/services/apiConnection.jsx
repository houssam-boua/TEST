import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem('token');
export const getUserData = () => JSON.parse(localStorage.getItem('userData'));

export const getRole = () => localStorage.getItem('role');

export const storeAuthData = (token, userData, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('role', role);
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  localStorage.removeItem('role');
};

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 50000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
