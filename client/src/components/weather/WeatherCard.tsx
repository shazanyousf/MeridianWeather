// Main weather display card
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDroplet, FiWind, FiSunrise, FiStar } from 'react-icons/fi';
import { CurrentWeather } from '@/types';
import { formatTemp, getWindDirection, getWeatherEmoji } from '@/utils/format';
import { useAppSelector } from '@/redux/store';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import toast from 'react-hot-toast';

interface WeatherCardProps {
  weather: CurrentWeather;
  city?: string;
  country?: string;
  lat?: number;
  lon?: number;
  date?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, city, country, lat, lon, date }) => {
  const units = useAppSelector((state) => state.ui.units);
  const { isAuthenticated } = useAuth();
  const [savingFavorite, setSavingFavorite] = useState(false);

  const handleSaveFavorite = async () => {
    if (!city || lat === undefined || lon === undefined) {
      toast.error('No location available to save');
      return;
    }

    setSavingFavorite(true);
    try {
      await userService.addFavorite({
        city,
        country,
        lat,
        lon,
      });
      toast.success(`${city} added to favorites`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add favorite');
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-glow p-8"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {/* Location & date */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{city || 'Current Location'}</h2>
            <p className="text-white/80 text-sm mt-0.5">
              {country && <span>{country} • </span>}
              {date}
            </p>
          </div>
<div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSaveFavorite}
                disabled={savingFavorite || lat === undefined || lon === undefined || !city}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiStar size={16} />
                {savingFavorite ? 'Saving...' : 'Save Favorite'}
              </button>
            )}
            <span className="text-5xl animate-float">{getWeatherEmoji(weather.category)}</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-end gap-4 mb-6">
          <span className="text-7xl font-bold leading-none">
            {formatTemp(weather.temperature, units)}
          </span>
          <div className="mb-2">
            <p className="text-white/90 font-medium capitalize">{weather.condition}</p>
            <p className="text-white/70 text-sm">
              Feels like {formatTemp(weather.feelsLike, units)}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <FiDroplet className="text-white/80" />
            <div>
              <p className="text-xs text-white/70">Humidity</p>
              <p className="font-semibold">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiWind className="text-white/80" />
            <div>
              <p className="text-xs text-white/70">Wind</p>
              <p className="font-semibold">{Math.round(weather.windSpeed)} km/h</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiSunrise className="text-white/80" />
            <div>
              <p className="text-xs text-white/70">Direction</p>
              <p className="font-semibold">{getWindDirection(weather.windDirection)}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
