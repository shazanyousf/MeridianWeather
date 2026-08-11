// Auth Context - provides authentication state & actions
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { setUser, logout as logoutAction, setLoading } from '@/redux/slices/authSlice';
import { authService } from '@/services/authService';
import { tokenStorage } from '@/services/api';
import { User } from '@/types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // Load user on mount if token exists
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (token && !isAuthenticated) {
      authService
        .getMe()
        .then((user) => {
          dispatch(setUser(user));
        })
        .catch((err) => {
          console.error('Failed to load user:', err);
          tokenStorage.clearTokens();
        });
    }
  }, [dispatch, isAuthenticated]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    dispatch(setLoading(true));
    try {
      const res = await authService.login(email, password, rememberMe);
      dispatch(setUser(res.user));
      toast.success(`Welcome back, ${res.user.name}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    dispatch(setLoading(true));
    try {
      await authService.register(name, email, password);
      toast.success('Registration successful! Please verify your email.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await authService.logout(refreshToken || undefined);
    } finally {
      dispatch(logoutAction());
      tokenStorage.clearTokens();
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      dispatch(setUser({ ...user, ...userData }));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
