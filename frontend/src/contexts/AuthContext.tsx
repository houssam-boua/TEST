import React, { createContext, useContext, useCallback, useState, ReactNode, useEffect } from 'react';
import apiService from '../services/api';
import { SecureStorage, UserData } from '../services/storage';

export type UserRole = 'admin' | 'manager' | 'user';

interface User extends UserData {
  role: UserRole;
  name: string;
}

interface AuthResponse {
  token: string;
  user: User;
  accountData: {
    id: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(SecureStorage.getToken());

  const checkAuth = useCallback(async () => {
    try {
      const storedToken = SecureStorage.getToken();
      if (!storedToken) {
        throw new Error('No token found');
      }

      const userData = await apiService.get<User>('/auth/me');
      setUser(userData);
    } catch (error) {
      SecureStorage.clearAuthData();
      setUser(null);
      setToken(null);
      throw error;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const { token: newToken, user: userData, accountData } = response;

      // Store all auth data using SecureStorage
      SecureStorage.storeAuthData(
        newToken,
        userData,
        accountData,
        userData.role
      );

      setToken(newToken);
      setUser(userData);
    } catch (error) {
      SecureStorage.clearAuthData();
      setUser(null);
      setToken(null);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    SecureStorage.clearAuthData();
    setUser(null);
    setToken(null);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        // Silent fail on initial load
        console.error('Auth initialization failed:', error);
      }
    };

    if (token) {
      initializeAuth();
    }
  }, [checkAuth, token]);

  const value = {
    user,
    token,
    userRole: user?.role ?? null,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};