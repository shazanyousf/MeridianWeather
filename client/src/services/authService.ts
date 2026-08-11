// Auth service - all authentication API calls
import api, { tokenStorage } from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
  async register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },

  async login(email: string, password: string, rememberMe: boolean): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    tokenStorage.setAccessToken(data.accessToken);
    tokenStorage.setRefreshToken(data.refreshToken);
    return data;
  },

  async logout(refreshToken?: string) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      tokenStorage.clearTokens();
    }
  },

  async refreshToken(refreshToken: string) {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },

  async verifyEmail(email: string, token: string) {
    const { data } = await api.post('/auth/verify-email', { email, token });
    return data;
  },

  async sendOTP(email: string) {
    const { data } = await api.post('/auth/send-otp', { email });
    return data;
  },

  async verifyOTP(email: string, otp: string) {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string) {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  },

  async resetPasswordWithOTP(email: string, otp: string, password: string) {
    const { data } = await api.post('/auth/reset-password-with-otp', { email, otp, password });
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/users/me');
    return data.user;
  },
};
