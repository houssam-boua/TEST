import {
  api,
  clearAuthData,
  setAuthToken,
  storeAuthData,
} from './apiConnection';

// Login Function
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login/', { username:email, password });
    const userData = response.data.data;
    const token = userData.token;
    const role = response.data.role;

    storeAuthData(token, userData, role);
    setAuthToken(token);
    return userData;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed.');
  }
};

// Logout Function
export const logout = async () => {
  try {
    await api.post('/users/logout');
    clearAuthData();
    setAuthToken(null);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Logout failed.');
  }
};
