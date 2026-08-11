// Weather analytics page
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiThermometer } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

const CONDITION_COLORS = [
  '#6366f1',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#3b82f6',
  '#ec4899',
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSearches: 0,
    totalFavorites: 0,
    totalHistory: 0,
    unreadNotifications: 0,
  });
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await userService.getDashboard();
        if (data?.stats) setStats(data.stats);
      } catch (err) {}
      try {
        const r = await userService.getStatistics(30);
        setReport({
          totalSearches: r?.totalSearches ?? 0,
          avgTemp: r?.avgTemp ?? '—',
          maxTemp: r?.maxTemp,
          minTemp: r?.minTemp,
          conditions: r?.conditions || {},
        });
      } catch (err) {}
    };
    loadStats();
  }, []);

  const conditionData = Object.entries(report?.conditions || {}).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: count as number,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <FiBarChart2 className="text-blue-500" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your weather usage statistics and trends
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Searches', value: stats.totalSearches },
          { label: 'Favorites', value: stats.totalFavorites },
          { label: 'History Entries', value: stats.totalHistory },
          { label: 'Unread Notifications', value: stats.unreadNotifications },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4"
          >
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Temperature summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4 flex items-center gap-4"
        >
          <span className="text-3xl text-blue-500">
            <FiThermometer />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {report?.avgTemp ?? '—'}
            </p>
            <p className="text-sm text-gray-500">Avg Temperature (°C)</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4 flex items-center gap-4"
        >
          <span className="text-3xl text-red-500">↑</span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {report?.maxTemp ?? '—'}
            </p>
            <p className="text-sm text-gray-500">Max Temperature (°C)</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4 flex items-center gap-4"
        >
          <span className="text-3xl text-blue-700">↓</span>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {report?.minTemp ?? '—'}
            </p>
            <p className="text-sm text-gray-500">Min Temperature (°C)</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weather Conditions Distribution
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Breakdown of weather conditions from your search history.
          </p>
          {conditionData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conditionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis allowDecimals={false} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Searches">
                    {conditionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CONDITION_COLORS[index % CONDITION_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              No search history data yet. Search for locations on the Weather page to see analytics here.
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Account Created</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Email Verified</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.isVerified ? '✓ Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">Units</span>
              <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                {user?.preferences?.units || 'metric'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
