// Admin search statistics
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { adminService } from '@/services/adminService';

export default function AdminSearchesPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getSearchStats(7);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Search Statistics</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Weather search analytics for the last 7 days</p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
          >
<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Searched Queries
            </h3>
            <div className="space-y-3">
              {stats.topQueries?.map((query: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{query._id}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{query.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Daily Search Volume
            </h3>
            <div className="space-y-3">
              {stats.dailySearches?.map((day: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
<span className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(day._id).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{day.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Total Searches: {stats.total}
              </p>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <FiSearch className="mx-auto mb-4" size={40} />
          No search data available
        </div>
      )}
    </div>
  );
}
