/**
 * Weather Service - Integrates multiple weather APIs with automatic fallback.
 * Providers: OpenWeatherMap, Open-Meteo, WeatherAPI.
 */

const axios = require('axios');
const ApiLog = require('../models/ApiLog');

// ---------------------------------------------------------------
// In-memory cache for historical (past) weather to avoid repeatedly
// hitting the slow Open-Meteo Archive API for the same location/day.
// Keyed by `lat:lon:days:YYYY-MM-DD`. Bounded to avoid unbounded growth.
// ---------------------------------------------------------------
const pastForecastCache = new Map();
const PAST_FORECAST_CACHE_MAX = 200;
const PAST_FORECAST_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// ---------------------------------------------------------------
// Generic bounded in-memory TTL cache for weather/geocode/air-quality
// responses. This dramatically reduces repeated calls to slow external
// weather + geocoding providers and makes the site feel much faster.
// ---------------------------------------------------------------
const weatherCache = new Map();
const CACHE_MAX = 500;
const CACHE_TTL = {
  weather: 5 * 60 * 1000, // 5 minutes for current weather/forecast
  geocode: 24 * 60 * 60 * 1000, // 24h for geocoding (stable data)
  reverseGeocode: 24 * 60 * 60 * 1000, // 24h for reverse geocoding
  airQuality: 5 * 60 * 1000, // 5 minutes for air quality
};

const getCache = (key) => {
  const entry = weatherCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL[entry.type]) {
    return entry.data;
  }
  if (entry) weatherCache.delete(key);
  return null;
};

const setCache = (key, type, data) => {
  weatherCache.set(key, { type, data, timestamp: Date.now() });
  if (weatherCache.size > CACHE_MAX) {
    const oldestKey = weatherCache.keys().next().value;
    if (oldestKey) weatherCache.delete(oldestKey);
  }
};

// Helper to log API calls (fire-and-forget - never blocks the request)
const logApiCall = async ({ provider, endpoint, success, responseTime, errorMessage, user }) => {
  try {
    ApiLog.create({
      provider,
      endpoint,
      success,
      responseTime,
      errorMessage,
      user: user || null,
    }).catch((err) => console.error('Failed to log API call:', err.message));
  } catch (err) {
    // Never let logging slow down or break the request
  }
};

/**
 * Geocode a location query to coordinates.
 * Uses OpenStreetMap Nominatim (free, no key needed, better village-level coverage).
 */
const geocodeLocation = async (query, user = null) => {
  const cacheKey = `geocode:${String(query).trim().toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const startTime = Date.now();
  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'jsonv2',
        addressdetails: 1,
        limit: 8,
      },
      headers: {
        'User-Agent': 'MeridianWeather/1.0',
        'Accept-Language': 'en',
      },
      timeout: 8000,
    });

    await logApiCall({
      provider: 'openmeteo',
      endpoint: '/nominatim/search',
      success: true,
      responseTime: Date.now() - startTime,
      user,
    });

if (!data || data.length === 0) {
      setCache(cacheKey, 'geocode', []);
      return [];
    }

    const results = data.map((r) => {
      const addr = r.address || {};
      const name =
        r.name ||
        addr.village ||
        addr.town ||
        addr.city ||
        addr.hamlet ||
        addr.suburb ||
        addr.municipality ||
        addr.county ||
        'Location';
      return {
        name,
        country: addr.country,
        countryCode: (addr.country_code || '').toUpperCase(),
        admin1: addr.state || addr.state_district || addr.region,
        admin2: addr.county || addr.district,
lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        displayName: r.display_name,
      };
    });

    setCache(cacheKey, 'geocode', results);
    return results;
  } catch (error) {
    await logApiCall({
      provider: 'openmeteo',
      endpoint: '/nominatim/search',
      success: false,
      responseTime: Date.now() - startTime,
      errorMessage: error.message,
      user,
    });
    throw error;
  }
};

/**
 * Get current weather + forecast from Open-Meteo (primary, no key).
 */
const getWeatherFromOpenMeteo = async (lat, lon, user = null) => {
  const startTime = Date.now();
  try {
    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'is_day',
          'precipitation',
          'rain',
          'showers',
          'snowfall',
          'weather_code',
          'cloud_cover',
          'pressure_msl',
          'surface_pressure',
          'wind_speed_10m',
          'wind_direction_10m',
          'wind_gusts_10m',
        ].join(','),
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'precipitation_probability',
          'precipitation',
          'weather_code',
          'wind_speed_10m',
        ].join(','),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'sunrise',
          'sunset',
          'uv_index_max',
          'precipitation_sum',
          'rain_sum',
'snowfall_sum',
          'wind_speed_10m_max',
        ].join(','),
        timezone: 'auto',
        forecast_days: 7,
      },
      timeout: 5000,
    });

    await logApiCall({
      provider: 'openmeteo',
      endpoint: '/v1/forecast',
      success: true,
      responseTime: Date.now() - startTime,
      user,
    });

    // Map WMO weather codes to descriptions
    const weatherCodeMap = {
      0: { condition: 'Clear', icon: '01d', category: 'sunny' },
      1: { condition: 'Mainly Clear', icon: '01d', category: 'sunny' },
      2: { condition: 'Partly Cloudy', icon: '02d', category: 'cloudy' },
      3: { condition: 'Overcast', icon: '04d', category: 'cloudy' },
      45: { condition: 'Fog', icon: '50d', category: 'fog' },
      48: { condition: 'Depositing Rime Fog', icon: '50d', category: 'fog' },
      51: { condition: 'Light Drizzle', icon: '09d', category: 'rain' },
      53: { condition: 'Drizzle', icon: '09d', category: 'rain' },
      55: { condition: 'Heavy Drizzle', icon: '09d', category: 'rain' },
      61: { condition: 'Light Rain', icon: '10d', category: 'rain' },
      63: { condition: 'Moderate Rain', icon: '10d', category: 'rain' },
      65: { condition: 'Heavy Rain', icon: '10d', category: 'rain' },
      66: { condition: 'Freezing Rain', icon: '13d', category: 'snow' },
      67: { condition: 'Freezing Rain (Heavy)', icon: '13d', category: 'snow' },
      71: { condition: 'Light Snow', icon: '13d', category: 'snow' },
      73: { condition: 'Moderate Snow', icon: '13d', category: 'snow' },
      75: { condition: 'Heavy Snow', icon: '13d', category: 'snow' },
      77: { condition: 'Snow Grains', icon: '13d', category: 'snow' },
      80: { condition: 'Light Showers', icon: '09d', category: 'rain' },
      81: { condition: 'Moderate Showers', icon: '09d', category: 'rain' },
      82: { condition: 'Violent Showers', icon: '09d', category: 'rain' },
      85: { condition: 'Snow Showers', icon: '13d', category: 'snow' },
      86: { condition: 'Heavy Snow Showers', icon: '13d', category: 'snow' },
      95: { condition: 'Thunderstorm', icon: '11d', category: 'storm' },
      96: { condition: 'Thunderstorm with Hail', icon: '11d', category: 'storm' },
      99: { condition: 'Thunderstorm with Heavy Hail', icon: '11d', category: 'storm' },
    };

    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    // Build current weather
    const currentWeather = {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      pressure: current.pressure_msl,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      windGusts: current.wind_gusts_10m,
      cloudCover: current.cloud_cover,
      precipitation: current.precipitation,
      rain: current.rain,
      snowfall: current.snowfall,
      isDay: current.is_day === 1,
      ...(weatherCodeMap[current.weather_code] || { condition: 'Unknown', icon: '01d', category: 'unknown' }),
    };

    // Build hourly forecast (next 24 hours)
    const hourlyForecast = [];
    for (let i = 0; i < 24; i++) {
      const code = hourly.weather_code[i];
      hourlyForecast.push({
        time: hourly.time[i],
        temperature: hourly.temperature_2m[i],
        humidity: hourly.relative_humidity_2m[i],
        precipitation: hourly.precipitation[i],
        precipitationProbability: hourly.precipitation_probability[i],
        windSpeed: hourly.wind_speed_10m[i],
        ...(weatherCodeMap[code] || { condition: 'Unknown', icon: '01d', category: 'unknown' }),
      });
    }

    // Build 7-day forecast
    const dailyForecast = [];
    for (let i = 0; i < daily.time.length; i++) {
      const code = daily.weather_code[i];
      dailyForecast.push({
        date: daily.time[i],
        tempMax: daily.temperature_2m_max[i],
        tempMin: daily.temperature_2m_min[i],
        sunrise: daily.sunrise[i],
        sunset: daily.sunset[i],
        uvIndex: daily.uv_index_max[i],
        precipitationSum: daily.precipitation_sum[i],
        rainSum: daily.rain_sum[i],
        snowfallSum: daily.snowfall_sum[i],
        windSpeedMax: daily.wind_speed_10m_max[i],
        ...(weatherCodeMap[code] || { condition: 'Unknown', icon: '01d', category: 'unknown' }),
      });
    }

    return {
      provider: 'openmeteo',
      current: currentWeather,
      hourly: hourlyForecast,
      daily: dailyForecast,
      timezone: data.timezone,
    };
  } catch (error) {
    await logApiCall({
      provider: 'openmeteo',
      endpoint: '/v1/forecast',
      success: false,
      responseTime: Date.now() - startTime,
      errorMessage: error.message,
      user,
    });
    throw error;
  }
};

/**
 * Get historical weather for the past N days using Open-Meteo Archive API (free, no key needed).
 */
const getHistoricalWeather = async (lat, lon, days = 7, user = null, year, date) => {
  const startTime = Date.now();
  try {
    // Archive API contains complete calendar years from ~1940 onward. When a
    // year is requested, return that full year; otherwise retain the existing
    // recent-day behaviour used by the forecast cards.
    let startDate;
    let endDate;
    if (date) {
      startDate = new Date(`${date}T00:00:00Z`);
      endDate = new Date(`${date}T00:00:00Z`);
    } else if (year) {
      startDate = new Date(Date.UTC(year, 0, 1));
      endDate = new Date(Date.UTC(year, 11, 31));
    } else {
      const now = new Date();
      endDate = new Date(now);
      endDate.setDate(now.getDate() - 1); // yesterday
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - (days - 1));
    }

    const formatDate = (d) => d.toISOString().split('T')[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    // Cache key based on location + date range. Check cache first to avoid
    // repeatedly hitting the slow Open-Meteo Archive API.
    const cacheKey = `${lat}:${lon}:${days}:${startDateStr}:${endDateStr}`;
    const cached = pastForecastCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < PAST_FORECAST_TTL_MS) {
      return cached.data;
    }

    const fetchArchive = () =>
      axios.get('https://archive-api.open-meteo.com/v1/archive', {
        params: {
          latitude: lat,
          longitude: lon,
          start_date: startDateStr,
          end_date: endDateStr,
          daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'sunrise',
            'sunset',
            'precipitation_sum',
            'rain_sum',
            'snowfall_sum',
            'wind_speed_10m_max',
          ].join(','),
          timezone: 'auto',
        },
        timeout: 8000,
      });

    // The archive provider occasionally times out. Retry up to three times
    // with a short backoff instead of immediately repeating the same request.
    let data;
    let lastError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetchArchive();
        data = response.data;
        break;
      } catch (error) {
        lastError = error;
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    }
    if (!data) throw lastError;

    await logApiCall({
      provider: 'openmeteo',
      endpoint: '/v1/archive',
      success: true,
      responseTime: Date.now() - startTime,
      user,
    });

    // Reuse the same WMO code map for consistent conditions
    const weatherCodeMap = {
      0: { condition: 'Clear', icon: '01d', category: 'sunny' },
      1: { condition: 'Mainly Clear', icon: '01d', category: 'sunny' },
      2: { condition: 'Partly Cloudy', icon: '02d', category: 'cloudy' },
      3: { condition: 'Overcast', icon: '04d', category: 'cloudy' },
      45: { condition: 'Fog', icon: '50d', category: 'fog' },
      48: { condition: 'Depositing Rime Fog', icon: '50d', category: 'fog' },
      51: { condition: 'Light Drizzle', icon: '09d', category: 'rain' },
      53: { condition: 'Drizzle', icon: '09d', category: 'rain' },
      55: { condition: 'Heavy Drizzle', icon: '09d', category: 'rain' },
      61: { condition: 'Light Rain', icon: '10d', category: 'rain' },
      63: { condition: 'Moderate Rain', icon: '10d', category: 'rain' },
      65: { condition: 'Heavy Rain', icon: '10d', category: 'rain' },
      66: { condition: 'Freezing Rain', icon: '13d', category: 'snow' },
      67: { condition: 'Freezing Rain (Heavy)', icon: '13d', category: 'snow' },
      71: { condition: 'Light Snow', icon: '13d', category: 'snow' },
      73: { condition: 'Moderate Snow', icon: '13d', category: 'snow' },
      75: { condition: 'Heavy Snow', icon: '13d', category: 'snow' },
      77: { condition: 'Snow Grains', icon: '13d', category: 'snow' },
      80: { condition: 'Light Showers', icon: '09d', category: 'rain' },
      81: { condition: 'Moderate Showers', icon: '09d', category: 'rain' },
      82: { condition: 'Violent Showers', icon: '09d', category: 'rain' },
      85: { condition: 'Snow Showers', icon: '13d', category: 'snow' },
      86: { condition: 'Heavy Snow Showers', icon: '13d', category: 'snow' },
      95: { condition: 'Thunderstorm', icon: '11d', category: 'storm' },
      96: { condition: 'Thunderstorm with Hail', icon: '11d', category: 'storm' },
      99: { condition: 'Thunderstorm with Heavy Hail', icon: '11d', category: 'storm' },
    };

const daily = data.daily;
    const dailyForecast = [];

    for (let i = 0; i < daily.time.length; i++) {
      const code = daily.weather_code[i];
      dailyForecast.push({
        date: daily.time[i],
        tempMax: daily.temperature_2m_max[i],
        tempMin: daily.temperature_2m_min[i],
        sunrise: daily.sunrise[i],
        sunset: daily.sunset[i],
        precipitationSum: daily.precipitation_sum[i],
        rainSum: daily.rain_sum[i],
        snowfallSum: daily.snowfall_sum[i],
        windSpeedMax: daily.wind_speed_10m_max[i],
        ...(weatherCodeMap[code] || { condition: 'Unknown', icon: '01d', category: 'unknown' }),
      });
    }

    const result = {
      provider: 'openmeteo-archive',
      daily: dailyForecast,
      timezone: data.timezone,
    };

    // Store in cache (bounded) for fast subsequent loads.
    pastForecastCache.set(cacheKey, { data: result, timestamp: Date.now() });
    if (pastForecastCache.size > PAST_FORECAST_CACHE_MAX) {
      const oldestKey = pastForecastCache.keys().next().value;
      if (oldestKey) pastForecastCache.delete(oldestKey);
    }

    return result;
  } catch (error) {
    await logApiCall({
      provider: 'openmeteo',
      endpoint: '/v1/archive',
      success: false,
      responseTime: Date.now() - startTime,
      errorMessage: error.message,
      user,
    });
    throw error;
  }
};

/**
 * Get weather from OpenWeatherMap (fallback, requires API key).
 */
const getWeatherFromOpenWeather = async (lat, lon, user = null) => {
  const startTime = Date.now();
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    await logApiCall({
      provider: 'openweathermap',
      endpoint: '/data/2.5/weather',
      success: true,
      responseTime: Date.now() - startTime,
      user,
    });

    const d = response.data;
    return {
      provider: 'openweathermap',
      current: {
        temperature: d.main.temp,
        feelsLike: d.main.feels_like,
        humidity: d.main.humidity,
        pressure: d.main.pressure,
        windSpeed: d.wind.speed,
        windDirection: d.wind.deg,
        cloudCover: d.clouds.all,
        condition: d.weather[0].description,
        icon: d.weather[0].icon,
        category: d.weather[0].main.toLowerCase(),
      },
    };
  } catch (error) {
    await logApiCall({
      provider: 'openweathermap',
      endpoint: '/data/2.5/weather',
      success: false,
      responseTime: Date.now() - startTime,
      errorMessage: error.message,
      user,
    });
    throw error;
  }
};

/**
 * Get weather with fallback chain.
 */
const getWeather = async (lat, lon, user = null) => {
  const cacheKey = `weather:${lat}:${lon}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  // Primary: Open-Meteo (no API key needed)
  try {
    const data = await getWeatherFromOpenMeteo(lat, lon, user);
    setCache(cacheKey, 'weather', data);
    return data;
  } catch (error) {
    console.log('Open-Meteo failed, falling back to OpenWeatherMap');
  }

  // Fallback: OpenWeatherMap
  try {
    const ow = await getWeatherFromOpenWeather(lat, lon, user);
    setCache(cacheKey, 'weather', ow);
    return ow;
  } catch (error) {
    throw new Error('Unable to fetch weather data from any provider');
  }
};

/**
 * Get air quality data.
 */
const getAirQuality = async (lat, lon, user = null) => {
  const cacheKey = `airQuality:${lat}:${lon}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const startTime = Date.now();
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    await logApiCall({
      provider: 'openweathermap',
      endpoint: '/data/2.5/air_pollution',
      success: true,
      responseTime: Date.now() - startTime,
      user,
    });

    const d = response.data.list[0];
    const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const result = {
      aqi: d.main.aqi,
      aqiLevel: aqiLevels[d.main.aqi - 1],
      components: d.components,
      timestamp: d.dt,
    };
    setCache(cacheKey, 'airQuality', result);
    return result;
  } catch (error) {
    await logApiCall({
      provider: 'openweathermap',
      endpoint: '/data/2.5/air_pollution',
      success: false,
      responseTime: Date.now() - startTime,
      errorMessage: error.message,
      user,
    });
    throw error;
  }
};

/**
 * Reverse geocode coordinates to a location name.
 * Uses OpenStreetMap Nominatim reverse geocoding (free, no key needed, better local names).
 */
const reverseGeocode = async (lat, lon, user = null) => {
  const cacheKey = `reverseGeocode:${lat}:${lon}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const startTime = Date.now();
  try {
    const { data } = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          lat,
          lon,
          format: 'jsonv2',
          addressdetails: 1,
          zoom: 14,
        },
        headers: {
          'User-Agent': 'MeridianWeather/1.0',
          'Accept-Language': 'en',
        },
        timeout: 8000,
      }
    );

    await logApiCall({
      provider: 'openmeteo',
      endpoint: '/nominatim/reverse',
      success: true,
      responseTime: Date.now() - startTime,
      user,
    });

    const addr = data.address || {};
    // Prefer the most specific local name available
    const name =
      data.name ||
      addr.village ||
      addr.hamlet ||
      addr.town ||
      addr.city ||
      addr.suburb ||
      addr.district ||
      addr.county ||
      addr.municipality ||
      addr.state_district ||
      addr.state ||
      'Current Location';

if (!name || name === 'Current Location') {
      setCache(cacheKey, 'reverseGeocode', null);
      return null;
    }

    const result = {
      name,
      country: addr.country,
      countryCode: (addr.country_code || '').toUpperCase(),
      admin1: addr.state || addr.state_district || addr.region,
      admin2: addr.district || addr.county,
      lat: parseFloat(data.lat) || lat,
      lon: parseFloat(data.lon) || lon,
    };
    setCache(cacheKey, 'reverseGeocode', result);
    return result;
  } catch (error) {
    await logApiCall({
      provider: 'openmeteo',
      endpoint: '/nominatim/reverse',
      success: false,
      responseTime: Date.now() - startTime,
      errorMessage: error.message,
      user,
    });
    throw error;
  }
};

module.exports = {
  geocodeLocation,
  reverseGeocode,
  getWeather,
  getWeatherFromOpenMeteo,
  getWeatherFromOpenWeather,
  getAirQuality,
  getHistoricalWeather,
};
