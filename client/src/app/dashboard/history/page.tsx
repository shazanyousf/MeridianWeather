// Weather history page
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import { weatherService } from '@/services/weatherService';
import { WeatherHistoryItem } from '@/types';
import { formatTemp, getWeatherEmoji, timeAgo, formatDate } from '@/utils/format';
import { useAppSelector } from '@/redux/store';

export default function HistoryPage() {
  const units = useAppSelector((state) => state.ui.units);
  const [history, setHistory] = useState<WeatherHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

const loadHistory = async () => {
    try {
      const data = await weatherService.getHistory(page, 10);
      setHistory(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <FiClock className="text-blue-500" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weather History</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your past weather searches and data
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          No search history yet
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Location</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Weather</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Temp</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Humidity</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">When</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, i) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-t border-gray-100 dark:border-gray-700"
                    >
                      <td className="p-4">
                        <p className="font-medium text-gray-900 dark:text-white">{item.location.city}</p>
                        <p className="text-xs text-gray-500">{item.location.country}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getWeatherEmoji(item.weather.condition)}</span>
                          <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                            {item.weather.condition}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-900 dark:text-white">
                        {formatTemp(item.weather.temperature, units)}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{item.weather.humidity}%</td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{timeAgo(item.createdAt)}</p>
                        <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
