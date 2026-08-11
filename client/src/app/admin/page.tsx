// Admin dashboard
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiActivity, FiMessageSquare, FiShield, FiEye } from 'react-icons/fi';
import { adminService } from '@/services/adminService';
import { AdminOverview } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getOverview();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'text-blue-600 bg-blue-100' },
        { label: 'Total Searches', value: stats.totalSearches, icon: FiSearch, color: 'text-green-600 bg-green-100' },
        { label: 'API Calls', value: stats.totalApiCalls, icon: FiActivity, color: 'text-purple-600 bg-purple-100' },
        { label: 'Feedback', value: stats.totalFeedback, icon: FiMessageSquare, color: 'text-yellow-600 bg-yellow-100' },
        { label: 'Daily Visitors', value: stats.todayVisitors, icon: FiEye, color: 'text-red-600 bg-red-100' },
        { label: 'Blocked Users', value: stats.totalBlocked, icon: FiShield, color: 'text-gray-600 bg-gray-100' },
      ]
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Overview of the Meridian Weather platform</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <card.icon size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </motion.div>
            ))}
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
                <p className="text-sm text-gray-500">Today&apos;s Searches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.todaySearches}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
                <p className="text-sm text-gray-500">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeSessions}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
                <p className="text-sm text-gray-500">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalAlerts}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
