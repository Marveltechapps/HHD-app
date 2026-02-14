/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/auth.service';
import { apiService } from '../services/api.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (mobile: string, otp: string) => Promise<void>;
  sendOTP: (mobile: string) => Promise<{ otp?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check if user is already authenticated on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        if (isAuth) {
          const userData = await authService.getMe();
          setUser({
            id: userData.id,
            mobile: userData.mobile,
            name: userData.name,
            role: userData.role,
          });
        }
      } catch (error) {
        // Not authenticated or token expired
        await apiService.removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Send OTP
   */
  const sendOTP = async (mobile: string): Promise<{ otp?: string }> => {
    try {
      const response = await authService.sendOTP(mobile);
      return { otp: response.otp }; // OTP only returned in development
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  };

  /**
   * Login (verify OTP)
   */
  const login = async (mobile: string, otp: string): Promise<void> => {
    try {
      const response = await authService.verifyOTP(mobile, otp);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Invalid OTP');
    }
  };

  /**
   * Logout
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      // Continue even if logout fails
      setUser(null);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await authService.getMe();
      setUser({
        id: userData.id,
        mobile: userData.mobile,
        name: userData.name,
        role: userData.role,
      });
    } catch (error) {
      // If refresh fails, user might be logged out
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    sendOTP,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
