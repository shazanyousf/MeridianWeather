// User service - profile & dashboard API calls
import api from './api';
import { ApiResponse, User, UserPreferences, NotificationItem } from '@/types';

export const userService = {
  async updateProfile(name: string): Promise<User> {
    const { data } = await api.put('/users/profile', { name });
    return data.user;
  },

  async uploadProfileImage(formData: FormData): Promise<string> {
    const { data } = await api.post('/users/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.profileImage;
  },

  async updatePreferences(preferences: Partial<UserPreferences>) {
    const { data } = await api.put('/users/preferences', preferences);
    return data.preferences;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  async deleteAccount() {
    const { data } = await api.delete('/users/account');
    return data;
  },

  async getDashboard() {
    const { data } = await api.get('/users/dashboard');
    return data.data;
  },

  async getAnnouncements() {
    const { data } = await api.get('/announcements');
    return data.data;
  },

  async getStatistics(days = 30) {
    const { data } = await api.get('/reports/statistics', { params: { days } });
    return data.data;
  },

  async getNotifications(page = 1, unreadOnly = false): Promise<ApiResponse<NotificationItem[]>> {
    const { data } = await api.get('/notifications', {
      params: { page, unreadOnly },
    });
    return data;
  },

  async markNotificationRead(id: string) {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  async markAllNotificationsRead() {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },

  async deleteNotification(id: string) {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  async getFavorites() {
    const { data } = await api.get('/favorites');
    return data.data;
  },

  async addFavorite(fav: {
    city: string;
    state?: string;
    country?: string;
    zipCode?: string;
    lat: number;
    lon: number;
    note?: string;
  }) {
    const { data } = await api.post('/favorites', fav);
    return data.data;
  },

  async removeFavorite(id: string) {
    const { data } = await api.delete(`/favorites/${id}`);
    return data;
  },

  async togglePin(id: string) {
    const { data } = await api.put(`/favorites/${id}/pin`);
    return data.data;
  },

async submitFeedback(feedback: {
    subject: string;
    message: string;
    rating: number;
    category: string;
  }) {
    const { data } = await api.post('/feedback', feedback);
    return data.data;
  },

  async getMyFeedback() {
    const { data } = await api.get('/feedback/my');
    return data.data;
  },
};
