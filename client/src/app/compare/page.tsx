// Weather comparison page
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { WeatherSearch } from '@/components/weather/WeatherSearch';
import { LocationResult, WeatherData } from '@/types';
import { weatherService } from '@/services/weatherService';
import { formatTemp, getWeatherEmoji } from '@/utils/format';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ComparedCity {
  location: LocationResult;
  weather: WeatherData;
}

const getCityName = (loc: LocationResult) => loc.name || loc.city || 'Unknown';

export default function ComparePage() {
  const [cities, setCities] = useState<ComparedCity[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (loc: LocationResult) => {
    if (cities.length >= 4) {
      toast.error('You can compare up to 4 cities');
      return;
    }
    // Deduplicate by coordinates (reliable) & also by display name
    const isDuplicate = cities.some(
      (c) =>
        (c.location.lat === loc.lat && c.location.lon === loc.lon) ||
        getCityName(c.location).toLowerCase() === getCityName(loc).toLowerCase()
    );
    if (isDuplicate) {
      toast.error('City already added');
      return;
    }

    setLoading(true);
    try {
      const data = await weatherService.getCurrentWeather({
        lat: loc.lat,
        lon: loc.lon,
        city: getCityName(loc),
        country: loc.country,
        source: 'comparison',
      });
      setCities([...cities, { location: loc, weather: data }]);
    } catch (err) {
      toast.error(`Failed to load weather for ${getCityName(loc)}`);
    } finally {
      setLoading(false);
    }
  };

  const removeCity = (index: number) => {
    setCities(cities.filter((_, i) => i !== index));
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Compare Weather
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Compare weather conditions across multiple cities (up to 4)
          </p>
        </motion.div>

        <WeatherSearch onSelect={handleSelect} />

        {cities.length === 0 && !loading ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            Add cities to start comparing weather
          </div>
        ) : (
          <div className="mt-10">
            {/* Header row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {cities.map((city, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 text-center"
                >
                  <button
                    onClick={() => removeCity(i)}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500"
                  >
                    <FiX size={18} />
                  </button>
                  <span className="text-4xl mb-3 block">
                    {getWeatherEmoji(city.weather.current.category)}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {getCityName(city.location)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{city.location.country}</p>
                  <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                    {formatTemp(city.weather.current.temperature)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {city.weather.current.condition}
                  </p>
                </motion.div>
              ))}
              {loading && (
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
              )}
            </div>

            {/* Comparison table */}
            {cities.length >= 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden mt-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Metric
                      </th>
                      {cities.map((city, i) => (
                        <th key={i} className="p-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {getCityName(city.location)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Temperature', key: 'temperature', unit: '°C' },
                      { label: 'Feels Like', key: 'feelsLike', unit: '°C' },
                      { label: 'Humidity', key: 'humidity', unit: '%' },
                      { label: 'Wind Speed', key: 'windSpeed', unit: ' km/h' },
                      { label: 'Pressure', key: 'pressure', unit: ' hPa' },
                      { label: 'Cloud Cover', key: 'cloudCover', unit: '%' },
                    ].map((row, idx) => (
                      <tr key={idx} className={idx % 2 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                        <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {row.label}
                        </td>
                        {cities.map((city, i) => {
                          const value = (city.weather.current as any)[row.key];
                          const display =
                            value === null || value === undefined || Number.isNaN(Number(value))
                              ? '--'
                              : `${Math.round(Number(value))}${row.unit}`;
                          return (
                            <td key={i} className="p-4 text-center text-sm text-gray-600 dark:text-gray-300">
                              {display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
