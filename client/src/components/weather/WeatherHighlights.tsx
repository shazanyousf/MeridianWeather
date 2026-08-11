// Today's weather highlights grid
'use client';
import React from 'react';
import {
  FiDroplet,
  FiWind,
  FiEye,
  FiSun,
  FiCloud,
  FiSunrise,
  FiSunset,
} from 'react-icons/fi';
import { CurrentWeather } from '@/types';
import { formatTemp, getWindDirection } from '@/utils/format';
import { useAppSelector } from '@/redux/store';

interface WeatherHighlightsProps {
  weather: CurrentWeather;
  sunrise?: string;
  sunset?: string;
}

const HighlightItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
      {icon}
      <span className="text-xs font-medium uppercase">{label}</span>
    </div>
    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

export const WeatherHighlights: React.FC<WeatherHighlightsProps> = ({
  weather,
  sunrise,
  sunset,
}) => {
  const units = useAppSelector((state) => state.ui.units);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Today's Highlights
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <HighlightItem
          icon={<FiSun size={18} />}
          label="UV Index"
          value={weather.cloudCover ? 'Moderate' : 'Low'}
        />
        <HighlightItem
          icon={<FiDroplet size={18} />}
          label="Humidity"
          value={`${weather.humidity}%`}
        />
        <HighlightItem
          icon={<FiWind size={18} />}
          label="Wind Speed"
          value={`${Math.round(weather.windSpeed)} km/h`}
        />
        <HighlightItem
          icon={<FiCloud size={18} />}
          label="Cloud Cover"
          value={`${weather.cloudCover}%`}
        />
        <HighlightItem
          icon={<FiEye size={18} />}
          label="Visibility"
          value={weather.pressure ? 'Good' : 'Moderate'}
        />
        <HighlightItem
          icon={<FiSunrise size={18} />}
          label="Pressure"
          value={`${weather.pressure} hPa`}
        />
      </div>

      {sunrise && sunset && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
            <FiSunrise className="text-amber-500" size={24} />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sunrise</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
            <FiSunset className="text-orange-500" size={24} />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sunset</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
