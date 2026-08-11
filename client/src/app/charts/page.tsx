// Charts & analytics page
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { WeatherSearch } from '@/components/weather/WeatherSearch';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import { RainfallChart } from '@/components/charts/RainfallChart';
import { WindChart } from '@/components/charts/WindChart';
import { HumidityChart } from '@/components/charts/HumidityChart';
import { LocationResult, WeatherData } from '@/types';
import { weatherService } from '@/services/weatherService';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

export default function ChartsPage() {
  const { resolvedTheme } = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (loc: LocationResult) => {
    setLoading(true);
    try {
      const data = await weatherService.getCurrentWeather({
        lat: loc.lat,
        lon: loc.lon,
        city: loc.name,
        country: loc.country,
        source: 'search',
      });
      setWeather(data);
    } catch (err) {
      toast.error('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Charts & Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Visualize temperature, rainfall, wind, and humidity trends
          </p>
        </motion.div>

        <WeatherSearch onSelect={handleSelect} />

        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : weather ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TemperatureChart daily={weather.daily || []} />
              <RainfallChart daily={weather.daily || []} />
              <WindChart daily={weather.daily || []} dark={resolvedTheme === 'dark'} />
              <HumidityChart hourly={weather.hourly || []} />
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              Search for a city to view weather charts and analytics
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
