// Home page - hero + weather search + current conditions
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiCloud, FiTrendingUp, FiUsers, FiCompass } from 'react-icons/fi';
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
import { setWeatherData, setCurrentLocation, setWeatherLoading, addRecentSearch } from '@/redux/slices/weatherSlice';
import toast from 'react-hot-toast';

const features = [
  { icon: <FiCompass className="text-primary-500" size={28} />, title: 'Real-time Forecast', desc: 'Live weather data from multiple providers' },
  { icon: <FiTrendingUp className="text-accent-500" size={28} />, title: 'Climate Analytics', desc: 'Detailed charts and trends analysis' },
  { icon: <FiUsers className="text-purple-500" size={28} />, title: 'AI Recommendations', desc: 'Smart travel & health suggestions' },
];

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pastForecast, setPastForecast] = useState<PastForecastItem[]>([]);

  // Load past 7-day historical weather for coordinates (non-blocking)
  const loadPastForecast = async (latitude: number, longitude: number) => {
    try {
      const past = await weatherService.getPastForecast(latitude, longitude, 7);
      setPastForecast(past.daily || []);
    } catch (err) {
      // Historical data is optional - don't block the page if it fails
      setPastForecast([]);
    }
  };

// Load default city (Delhi) weather on mount
  useEffect(() => {
    const loadDefault = async () => {
      try {
        const data = await weatherService.getWeatherByCity('Delhi', 'auto');
        setWeather(data);
        dispatch(setWeatherData(data));
        if (data.location?.lat && data.location?.lon) {
          // Non-blocking - loads in background, won't delay the page
          loadPastForecast(data.location.lat, data.location.lon);
        }
      } catch (err) {
        toast.error('Could not load default weather. Please try searching a city.');
      } finally {
        setLoading(false);
      }
    };
    loadDefault();
  }, [dispatch]);

  const handleSelect = async (location: LocationResult) => {
    setLoading(true);
    dispatch(setCurrentLocation(location));
    dispatch(addRecentSearch(location.name));
    try {
      // Fire weather + past forecast concurrently to reduce load time
      const weatherPromise = weatherService.getCurrentWeather({
        lat: location.lat,
        lon: location.lon,
        city: location.name,
        country: location.country,
        source: 'search',
      });
      loadPastForecast(location.lat, location.lon);
      const data = await weatherPromise;
      setWeather(data);
      dispatch(setWeatherData(data));
    } catch (err) {
      toast.error('Failed to load weather for this location');
    } finally {
      setLoading(false);
    }
  };

return (
    <MainLayout>
      {/* Hero section */}
      <section className="relative z-40 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-float">
              <FiCloud size={18} />
              Smart Weather Forecasting & Climate Analytics
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Know the Weather
              <br />
              <span className="text-gradient">Before It Happens</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
              Get real-time weather forecasts, climate analytics,
              and AI-powered recommendations for any location worldwide.
            </p>

            {/* Search */}
            <WeatherSearch onSelect={handleSelect} />
          </motion.div>
        </div>
      </section>

      {/* Weather display section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">
              Search for a city to see current weather conditions
            </p>
          </div>
        )}
      </section>

      {/* AI recommendations */}
      {weather?.recommendations && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AIRecommendations recommendations={weather.recommendations} />
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Choose Meridian Weather?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 hover:shadow-glow transition-shadow"
            >
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
</section>
    </MainLayout>
  );
}

