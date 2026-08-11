// Admin API usage
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity } from 'react-icons/fi';
import { adminService } from '@/services/adminService';

export default function AdminApiUsagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await adminService.getApiUsage(7);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">API Usage</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">External weather API consumption</p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Calls by Provider
            </h3>
            <div className="space-y-3">
              {data.byProvider?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                    {item._id}
                  </span>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {item.count}
                  </span>
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
              Usage Summary
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Total Calls', value: data.total },
                { label: 'Successful', value: data.success },
                { label: 'Failed', value: data.failed },
                { label: 'Avg Response Time', value: `${data.avgResponseTime?.toFixed(0)}ms` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <FiActivity className="mx-auto mb-4" size={40} />
          No API usage data available
        </div>
      )}
    </div>
  );
}
