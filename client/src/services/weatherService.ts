// Weather service - all weather API calls
import api from './api';
import {
  ApiResponse,
  LocationResult,
  WeatherData,
  WeatherHistoryItem,
  DailyForecast,
  HourlyForecast,
  PastForecastItem,
} from '@/types';

// Lightweight client-side cache to avoid redundant fetches when navigating
// between pages or re-searching the same location within a short window.
// Keyed by `lat:lon`, bounded, TTL ~5 minutes.
const currentWeatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CURRENT_WEATHER_TTL = 5 * 60 * 1000;

const getCurrentWeatherCacheKey = (lat: number, lon: number) => `${lat.toFixed(4)}:${lon.toFixed(4)}`;

const getCached = (key: string): WeatherData | null => {
  const entry = currentWeatherCache.get(key);
  if (entry && Date.now() - entry.timestamp < CURRENT_WEATHER_TTL) {
    return entry.data;
  }
  if (entry) currentWeatherCache.delete(key);
  return null;
};

const setCached = (key: string, data: WeatherData) => {
  currentWeatherCache.set(key, { data, timestamp: Date.now() });
  if (currentWeatherCache.size > 200) {
    const oldestKey = currentWeatherCache.keys().next().value;
    if (oldestKey) currentWeatherCache.delete(oldestKey);
  }
};

export const weatherService = {
  async geocode(query: string): Promise<LocationResult[]> {
    const { data } = await api.get('/weather/geocode', { params: { query } });
    return data.results;
  },

  async reverseGeocode(lat: number, lon: number): Promise<LocationResult | null> {
    const { data } = await api.get('/weather/reverse-geocode', { params: { lat, lon } });
    return data.location;
  },

  async getCurrentWeather(params: {
    lat: number;
    lon: number;
    city?: string;
    state?: string;
    country?: string;
    source?: string;
  }): Promise<WeatherData> {
    const key = getCurrentWeatherCacheKey(params.lat, params.lon);
    const cached = getCached(key);
    if (cached) return cached;

    const { data } = await api.get('/weather/current', { params });
    if (data?.data) setCached(key, data.data);
    return data.data;
  },

  async getWeatherByCity(city: string, source?: string): Promise<WeatherData> {
    // Check cache by city name as a fallback before making the API call
    const args = { city, source };
    const key = `city:${city.trim().toLowerCase()}`;
    const cached = getCached(key);
    if (cached) return cached;

    const { data } = await api.get('/weather/city', { params: args });
    if (data?.data?.location?.lat && data?.data?.location?.lon) {
      setCached(getCurrentWeatherCacheKey(data.data.location.lat, data.data.location.lon), data.data);
      setCached(key, data.data);
    }
    return data.data;
  },

  async getForecast(lat: number, lon: number): Promise<{
    hourly: HourlyForecast[];
    daily: DailyForecast[];
  }> {
    const { data } = await api.get('/weather/forecast', { params: { lat, lon } });
    return data.data;
  },

  async getPastForecast(
    lat: number,
    lon: number,
    days = 7,
    year?: number,
    date?: string
  ): Promise<{
    provider: string;
    daily: PastForecastItem[];
    timezone?: string;
  }> {
    const { data } = await api.get('/weather/past', { params: { lat, lon, days, year, date } });
    return data.data;
  },

  async getHistory(page = 1, limit = 10): Promise<ApiResponse<WeatherHistoryItem[]>> {
    const { data } = await api.get('/weather/history', { params: { page, limit } });
    return data;
  },

  async getPopularCities() {
    const { data } = await api.get('/search/popular');
    return data.data;
  },

  async getRecentSearches() {
    const { data } = await api.get('/search/recent');
    return data.data;
  },

  async getSuggestions(q: string) {
    const { data } = await api.get('/search/suggestions', { params: { q } });
    return data.data;
  },

  async getTrending() {
    const { data } = await api.get('/search/trending');
    return data.data;
  },
};
