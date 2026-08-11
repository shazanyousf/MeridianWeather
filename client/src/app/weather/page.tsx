// Weather search page with full details
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { WeatherSearch } from '@/components/weather/WeatherSearch';
import { WeatherCard } from '@/components/weather/WeatherCard';
import { HourlyForecast } from '@/components/weather/HourlyForecast';
import { ForecastCard } from '@/components/weather/ForecastCard';
import { PastForecastCard } from '@/components/weather/PastForecastCard';
import { WeatherHighlights } from '@/components/weather/WeatherHighlights';
import { AirQualityCard } from '@/components/weather/AirQualityCard';
import { AIRecommendations } from '@/components/weather/AIRecommendations';
import { LocationResult, WeatherData, PastForecastItem } from '@/types';
import { weatherService } from '@/services/weatherService';
import { useAppDispatch } from '@/redux/store';
import { setWeatherData, setCurrentLocation } from '@/redux/slices/weatherSlice';
import toast from 'react-hot-toast';

export default function WeatherPage() {
  const dispatch = useAppDispatch();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [pastForecast, setPastForecast] = useState<PastForecastItem[]>([]);

  // Load past 7-day historical weather (non-blocking - never blocks the page)
  const loadPastForecast = async (latitude: number, longitude: number) => {
    try {
      const past = await weatherService.getPastForecast(latitude, longitude, 7);
      setPastForecast(past.daily || []);
    } catch (err) {
      // Historical data is optional - don't block the page if it fails
      setPastForecast([]);
    }
  };

  const handleSelect = async (loc: LocationResult) => {
    setLoading(true);
    setLocation(loc);
    dispatch(setCurrentLocation(loc));
    try {
      // Fire weather + past forecast concurrently to reduce load time
      const weatherPromise = weatherService.getCurrentWeather({
        lat: loc.lat,
        lon: loc.lon,
        city: loc.name,
        country: loc.country,
        source: 'search',
      });
      loadPastForecast(loc.lat, loc.lon);
      const data = await weatherPromise;
      setWeather(data);
      dispatch(setWeatherData(data));
    } catch (err) {
      toast.error('Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Weather Search
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Search by city, state, country, zip code, or coordinates
          </p>
        </motion.div>

        <WeatherSearch onSelect={handleSelect} />

        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            </div>
          ) : weather ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <WeatherCard
                  weather={weather.current}
                  city={weather.location?.city}
                  country={weather.location?.country}
                  lat={weather.location?.lat}
                  lon={weather.location?.lon}
                  date={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                />
                <HourlyForecast hourly={weather.hourly || []} />
                <WeatherHighlights
                  weather={weather.current}
                  sunrise={weather.daily?.[0]?.sunrise}
                  sunset={weather.daily?.[0]?.sunset}
                />
                {weather.airQuality && <AirQualityCard airQuality={weather.airQuality} />}
              </div>
              <div className="space-y-6">
                <ForecastCard forecast={weather.daily || []} />
                {pastForecast.length > 0 && <PastForecastCard forecast={pastForecast} />}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              Search for a city to see detailed weather information
            </div>
          )}
        </div>

        {weather?.recommendations && (
          <div className="mt-10">
            <AIRecommendations recommendations={weather.recommendations} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
