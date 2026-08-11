// Favorites page
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiTrash2, FiMapPin } from 'react-icons/fi';
import { userService } from '@/services/userService';
import { weatherService } from '@/services/weatherService';
import { Favorite } from '@/types';
import { formatTemp, getWeatherEmoji } from '@/utils/format';
import { useAppSelector } from '@/redux/store';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const units = useAppSelector((state) => state.ui.units);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const loadFavorites = async () => {
    try {
      const data = await userService.getFavorites();
      setFavorites(data);

      // Fetch weather for each favorite with a bounded concurrency limit so the
      // client doesn't fire N simultaneous requests (reduces load & latency).
      const CONCURRENCY = 3;
      let index = 0;
      const worker = async () => {
        while (index < data.length) {
          const fav: Favorite = data[index++];
          try {
            const w = await weatherService.getCurrentWeather({
              lat: fav.location.lat,
              lon: fav.location.lon,
              city: fav.location.city,
              source: 'favorite',
            });
            setWeatherData((prev) => ({ ...prev, [fav._id]: w }));
          } catch (err) {}
        }
      };
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, data.length) }, () => worker()));
    } catch (err) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await userService.removeFavorite(id);
      setFavorites(favorites.filter((f) => f._id !== id));
      toast.success('Removed from favorites');
    } catch (err) {
      toast.error('Failed to remove favorite');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await userService.togglePin(id);
      loadFavorites();
    } catch (err) {
      toast.error('Failed to update pin');
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <FiStar className="text-yellow-500" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Favorite Cities</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Quick access to your saved locations
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <FiMapPin className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">
            You haven't saved any favorite cities yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav, i) => {
            const weather = weatherData[fav._id];
            return (
              <motion.div
                key={fav._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 relative"
              >
{fav.isPinned && (
                  <span className="absolute top-3 right-3 text-yellow-500">📌</span>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {fav.location.city}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {fav.location.country}
                    </p>
                  </div>
                  <span className="text-3xl">
                    {weather ? getWeatherEmoji(weather.current.category) : '🕐'}
                  </span>
                </div>

                {weather && (
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {formatTemp(weather.current.temperature, units)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {weather.current.condition}
                    </p>
                  </div>
                )}

                {fav.note && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                    📝 {fav.note}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTogglePin(fav._id)}
                    className="flex-1 px-3 py-2 text-sm font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100"
                  >
                    {fav.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => handleRemove(fav._id)}
                    className="flex-1 px-3 py-2 text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
