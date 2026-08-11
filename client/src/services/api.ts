// Axios API client with auth token interceptor
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

// Token management
const ACCESS_TOKEN_KEY = 'mw_access_token';
const REFRESH_TOKEN_KEY = 'mw_refresh_token';
const ADMIN_TOKEN_KEY = 'mw_admin_token';

export const tokenStorage = {
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY) || Cookies.get(ACCESS_TOKEN_KEY) || null;
  },
  setAccessToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getRefreshToken: () => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY) || null;
  },
  setRefreshToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 7 });
  },
  getAdminToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY) || Cookies.get(ADMIN_TOKEN_KEY) || null;
  },
  setAdminToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    Cookies.set(ADMIN_TOKEN_KEY, token, { expires: 7 });
  },
  clearAdminToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    Cookies.remove(ADMIN_TOKEN_KEY);
  },
  clearTokens: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },
};

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - attach access token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If an Authorization header was explicitly set (e.g. admin token via
    // adminService.getAdminAuthConfig()), respect it and do not overwrite it.
    if (config.headers.Authorization) {
      return config;
    }

    const url = config.url || '';
    // Admin routes use the admin token
    if (url.startsWith('/admin')) {
      const adminToken = tokenStorage.getAdminToken();
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
      return config;
    }
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 & refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken,
          });
          tokenStorage.setAccessToken(data.accessToken);
          tokenStorage.setRefreshToken(data.refreshToken);

          // Retry original request with new token
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout
          tokenStorage.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// Helper to extract error message
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors)[0] as string;
  }
  if (error.message) return error.message;
  return 'Something went wrong';
};

export default axiosInstance;
