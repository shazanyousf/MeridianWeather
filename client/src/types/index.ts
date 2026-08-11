// Global type definitions for the Meridian Weather client

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  isVerified: boolean;
  isBlocked?: boolean;
  preferences?: UserPreferences;
  favoriteCities?: Favorite[];
  createdAt?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  units: 'metric' | 'imperial';
  language: string;
  notifications: boolean;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  rememberMe?: boolean;
  sessionId?: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LocationResult {
  name: string;
  city?: string;
  country?: string;
  countryCode?: string;
  admin1?: string;
  admin2?: string;
  displayName?: string;
  lat: number;
  lon: number;
  population?: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts?: number;
  cloudCover: number;
  precipitation: number;
  rain?: number;
  snowfall?: number;
  isDay: boolean;
  condition: string;
  icon: string;
  category: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  condition: string;
  icon: string;
  category: string;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  uvIndex: number;
  precipitationSum: number;
  rainSum: number;
  snowfallSum: number;
  windSpeedMax: number;
  condition: string;
  icon: string;
  category: string;
}

export interface PastForecastItem {
  date: string;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  precipitationSum: number;
  rainSum: number;
  snowfallSum: number;
  windSpeedMax: number;
  condition: string;
  icon: string;
  category: string;
}

export interface AirQuality {
  aqi: number;
  aqiLevel: string;
  components: Record<string, number>;
  timestamp: number;
}

export interface WeatherData {
  provider: string;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  timezone?: string;
  airQuality?: AirQuality | null;
  recommendations?: Recommendations;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    lat: number;
    lon: number;
  };
}

export interface Recommendations {
  clothing: string[];
  health: { level: string; message: string }[];
  activities: { suitable: string[]; notRecommended: string[] };
  travel: { rating: number; suggestion: string; reason: string };
  crop: string[];
  disaster: { type: string; severity: string; message: string }[];
  bestTimeToVisit?: {
    date: string;
    score: number;
    condition: string;
    tempMax: number;
    tempMin: number;
    recommendation: string;
  } | null;
}

export interface Favorite {
  _id: string;
  location: {
    city: string;
    state?: string;
    country?: string;
    zipCode?: string;
    lat: number;
    lon: number;
  };
  isPinned: boolean;
  note?: string;
  createdAt: string;
}

export interface WeatherHistoryItem {
  _id: string;
  location: {
    city: string;
    state?: string;
    country?: string;
    lat: number;
    lon: number;
  };
  weather: {
    temperature: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    icon: string;
  };
  source: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'warning' | 'success' | 'system';
  category: string;
  read: boolean;
  createdAt: string;
}

export interface WeatherAlert {
  _id: string;
  title: string;
  description: string;
  type: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  location?: { city?: string; state?: string; country?: string };
  isActive: boolean;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: string;
  isActive: boolean;
  priority: string;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  subject: string;
  message: string;
  rating: number;
  category: string;
  status: string;
  adminReply?: string;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export interface AdminOverview {
  totalUsers: number;
  totalVerified: number;
  totalBlocked: number;
  totalFeedback: number;
  totalAlerts: number;
  totalSearches: number;
  todaySearches: number;
  todayVisitors: number;
  totalApiCalls: number;
  activeSessions: number;
}
