// Formatting utilities

/**
 * Format temperature based on units.
 */
export const formatTemp = (temp: number, units: 'metric' | 'imperial' = 'metric'): string => {
  if (temp === null || temp === undefined) return '--';
  const displayTemp = units === 'imperial' ? (temp * 9) / 5 + 32 : temp;
  return `${Math.round(displayTemp)}°${units === 'imperial' ? 'F' : 'C'}`;
};

/**
 * Format wind speed based on units.
 */
export const formatWind = (speed: number, units: 'metric' | 'imperial' = 'metric'): string => {
  if (speed === null || speed === undefined) return '--';
  const displaySpeed = units === 'imperial' ? speed * 0.621371 : speed;
  return `${Math.round(displaySpeed)} ${units === 'imperial' ? 'mph' : 'km/h'}`;
};

/**
 * Get wind direction from degrees.
 */
export const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

/**
 * Format date.
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', options || { weekday: 'long', month: 'long', day: 'numeric' });
};

/**
 * Format time (HH:MM).
 */
export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Relative time (e.g., "2 hours ago").
 */
export const timeAgo = (date: string | Date): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return count === 1 ? `1 ${interval.label} ago` : `${count} ${interval.label}s ago`;
    }
  }
  return 'just now';
};

/**
 * Get day name from date.
 */
export const getDayName = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Get hour from ISO time.
 */
export const getHour = (time: string): string => {
  const d = new Date(time);
  return d.toLocaleTimeString('en-US', { hour: 'numeric' });
};

/**
 * Format AQI.
 */
export const formatAQI = (aqi: number): { label: string; color: string } => {
  if (aqi <= 50) return { label: 'Good', color: '#22c55e' };
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#f97316' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#a855f7' };
  return { label: 'Hazardous', color: '#7f1d1d' };
};

/**
 * Convert unix timestamp.
 */
export const fromUnix = (seconds: number): Date => new Date(seconds * 1000);

/**
 * Format number with commas.
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Get weather icon (emoji or URL).
 */
export const getWeatherEmoji = (category: string): string => {
  const map: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rain: '🌧️',
    drizzle: '🌦️',
    snow: '❄️',
    storm: '⛈️',
    fog: '🌫️',
    thunderstorm: '⛈️',
    clear: '☀️',
  };
  return map[category?.toLowerCase()] || '🌤️';
};
