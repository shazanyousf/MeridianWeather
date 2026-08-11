// Admin service - all admin API calls
import api, { tokenStorage } from './api';
import { AdminOverview, ApiResponse, AdminUser } from '@/types';

const getAdminAuthConfig = () => {
  const token = tokenStorage.getAdminToken();
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

export const adminService = {
  async login(email: string, password: string) {
    const { data } = await api.post('/admin/login', { email, password });
    tokenStorage.setAdminToken(data.accessToken);
    return data;
  },

  logout() {
    tokenStorage.clearAdminToken();
  },

  async getOverview(): Promise<AdminOverview> {
    const { data } = await api.get('/admin/overview', getAdminAuthConfig());
    return data.data;
  },

  async getUsers(page = 1, limit = 10, search?: string, status?: string): Promise<ApiResponse<AdminUser[]>> {
    const { data } = await api.get('/admin/users', {
      params: { page, limit, search, status },
      ...getAdminAuthConfig(),
    });
    return data;
  },

  async getUserById(id: string) {
    const { data } = await api.get(`/admin/users/${id}`, getAdminAuthConfig());
    return data.data;
  },

  async deleteUser(id: string) {
    const { data } = await api.delete(`/admin/users/${id}`, getAdminAuthConfig());
    return data;
  },

  async toggleBlockUser(id: string) {
    const { data } = await api.put(`/admin/users/${id}/block`, {}, getAdminAuthConfig());
    return data;
  },

  async promoteUser(id: string) {
    const { data } = await api.put(`/admin/users/${id}/promote`, {}, getAdminAuthConfig());
    return data;
  },

  async getSearchStats(days = 7) {
    const { data } = await api.get('/admin/search-stats', {
      params: { days },
      ...getAdminAuthConfig(),
    });
    return data.data;
  },

  async getApiUsage(days = 7) {
    const { data } = await api.get('/admin/api-usage', {
      params: { days },
      ...getAdminAuthConfig(),
    });
    return data.data;
  },

  async getUserAnalytics(days = 30) {
    const { data } = await api.get('/admin/user-analytics', {
      params: { days },
      ...getAdminAuthConfig(),
    });
    return data.data;
  },

  async getAllFeedback(page = 1, limit = 10) {
    const { data } = await api.get('/admin/feedback', {
      params: { page, limit },
      ...getAdminAuthConfig(),
    });
    return data;
  },

  async getAllAlerts() {
    const { data } = await api.get('/admin/alerts', getAdminAuthConfig());
    return data.data;
  },

  async createAlert(alert: any) {
    const { data } = await api.post('/alerts', alert, getAdminAuthConfig());
    return data.data;
  },

  async updateAlert(id: string, alert: any) {
    const { data } = await api.put(`/alerts/${id}`, alert, getAdminAuthConfig());
    return data.data;
  },

  async deleteAlert(id: string) {
    const { data } = await api.delete(`/alerts/${id}`, getAdminAuthConfig());
    return data;
  },

  async getAnnouncements() {
    const { data } = await api.get('/announcements/all', getAdminAuthConfig());
    return data.data;
  },

  async createAnnouncement(announcement: any) {
    const { data } = await api.post('/announcements', announcement, getAdminAuthConfig());
    return data.data;
  },

  async updateAnnouncement(id: string, announcement: any) {
    const { data } = await api.put(`/announcements/${id}`, announcement, getAdminAuthConfig());
    return data.data;
  },

  async deleteAnnouncement(id: string) {
    const { data } = await api.delete(`/announcements/${id}`, getAdminAuthConfig());
    return data;
  },

  async updateFeedback(id: string, feedback: any) {
    const { data } = await api.put(`/feedback/${id}`, feedback, getAdminAuthConfig());
    return data.data;
  },
};
