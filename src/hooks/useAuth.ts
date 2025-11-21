import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  profile?: {
    ecoPoints: number;
    ecoCoins: number;
    level: number;
    referralCode: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await apiClient.getCurrentUser();
        if (userData) {
          setUser(userData as User);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // If API call fails (backend not available), clear tokens
        console.warn('Auth check failed (backend may not be available):', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email?: string; phone?: string; password?: string; otp?: string }) => {
    try {
      const response = await apiClient.login(credentials);
      if (response.user) {
        setUser(response.user as User);
        setIsAuthenticated(true);
        return { success: true, requiresOtp: response.requiresOtp };
      }
      return { success: false, requiresOtp: response.requiresOtp };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const register = async (data: {
    email?: string;
    phone?: string;
    password?: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await apiClient.register(data);
      if (response.user) {
        setUser(response.user as User);
        setIsAuthenticated(true);
        return { success: true, requiresOtp: response.requiresOtp };
      }
      return { success: false, requiresOtp: response.requiresOtp };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Navigation will be handled by the component using this hook
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };
}

