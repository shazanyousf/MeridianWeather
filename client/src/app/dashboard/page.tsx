// Dashboard overview page
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiStar, FiClock, FiBell, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { Favorite, WeatherHistoryItem, NotificationItem, Announcement } from '@/types';
import { formatTemp, timeAgo, getWeatherEmoji } from '@/utils/format';
import { useAppSelector } from '@/redux/store';

export default function DashboardPage() {
  const { user } = useAuth();
  const units = useAppSelector((state) => state.ui.units);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<WeatherHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({ totalFavorites: 0, totalSearches: 0, unreadNotifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await userService.getDashboard();
        setFavorites(data.favorites || []);
        setHistory(data.history || []);
        setNotifications(data.notifications || []);
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
    userService.getAnnouncements().then(setAnnouncements).catch(() => {});
  }, []);

  const announcementStyles: Record<string, string> = {
    info: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
    warning: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800',
    maintenance: 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800',
    feature: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
    alert: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
  };

  const statCards = [
    { label: 'Favorite Cities', value: stats.totalFavorites, icon: <FiStar className="text-yellow-500" /> },
    { label: 'Total Searches', value: stats.totalSearches, icon: <FiClock className="text-blue-500" /> },
    { label: 'Unread Notifications', value: stats.unreadNotifications, icon: <FiBell className="text-red-500" /> },
  ];

  return (
    <div className="p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Here's an overview of your weather activity
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

{/* Announcements */}
      {announcements.length > 0 && (
        <div className="mb-8 space-y-3">
          {announcements.map((ann) => (
            <motion.div
              key={ann._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-l-4 rounded-xl p-4 ${announcementStyles[ann.type] || announcementStyles.info}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {ann.type}
                </span>
                {ann.priority === 'high' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-semibold">
                    HIGH PRIORITY
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{ann.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{ann.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(ann.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorites */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Favorite Cities</h3>
            <Link href="/dashboard/favorites" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          {favorites.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No favorite cities yet</p>
          ) : (
            <div className="space-y-3">
              {favorites.slice(0, 5).map((fav) => (
                <div key={fav._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-primary-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{fav.location.city}</p>
                      <p className="text-xs text-gray-500">{fav.location.country}</p>
                    </div>
                  </div>
                  {fav.isPinned && <span className="text-yellow-500">📌</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent searches */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Searches</h3>
            <Link href="/dashboard/history" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          {history.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No recent searches</p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getWeatherEmoji(item.weather.condition)}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.location.city}</p>
                      <p className="text-xs text-gray-500">{item.location.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatTemp(item.weather.temperature, units)}
                    </p>
                    <p className="text-xs text-gray-500">{timeAgo(item.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
          <Link href="/dashboard/notifications" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        {notifications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications</p>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif) => (
              <div key={notif._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 dark:text-white">{notif.title}</p>
                  <span className="text-xs text-gray-500">{timeAgo(notif.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
