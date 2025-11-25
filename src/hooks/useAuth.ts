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

      // Try to verify token with backend, but don't block if backend is unavailable
      // Use a timeout to prevent long waits
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      try {
        const userData = await Promise.race([
          apiClient.getCurrentUser(),
          timeoutPromise
        ]) as any;
        
        if (userData) {
          setUser(userData as User);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Backend not available or timeout - this is OK, app works without backend
        // Only clear tokens if we're sure backend exists but rejected us
        // For now, keep tokens in case backend comes back online
        // App will work fine with localStorage-only features
        setUser(null);
        setIsAuthenticated(false);
        // Don't clear tokens - user might have valid session, just backend is down
      }
    } catch (error) {
      // Any other error - app still works without backend
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

