// Admin analytics
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiActivity, FiTrendingUp, FiUserCheck } from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { adminService } from '@/services/adminService';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const result = await adminService.getUserAnalytics(30);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Map backend response: { _id: date, count } -> { name, count }
  const mapGrowth = (arr: any[]) =>
    (Array.isArray(arr) ? arr : []).map((d: any) => ({
      name: new Date(d._id).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      registrations: d.count,
    }));

  const mapVisitors = (arr: any[]) =>
    (Array.isArray(arr) ? arr : []).map((d: any) => ({
      name: new Date(d._id).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      visitors: d.count,
    }));

  const registrationData = mapGrowth(data?.userGrowth);
  const visitorData = mapVisitors(data?.dailyVisitors);

  const stats = [
    { label: 'Total Users', value: data?.totalUsers ?? 0, icon: <FiUsers className="text-primary-500" /> },
    { label: 'Active Today', value: data?.activeToday ?? 0, icon: <FiActivity className="text-accent-500" /> },
    { label: 'New Registrations (30d)', value: registrationData.reduce((s: number, d: any) => s + d.registrations, 0), icon: <FiTrendingUp className="text-green-500" /> },
    { label: 'Avg Visitors/Day (30d)', value: Math.round(visitorData.reduce((s: number, d: any) => s + d.visitors, 0) / (visitorData.length || 1)), icon: <FiUserCheck className="text-purple-500" /> },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">User growth and platform analytics</p>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                User Registrations (30 days)
              </h3>
              <div className="h-64">
                {registrationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={registrationData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
                      <Bar dataKey="registrations" fill="#6366f1" radius={[6, 6, 0, 0]} name="Registrations" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No registration data for this period
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Visitors (30 days)
              </h3>
              <div className="h-64">
                {visitorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visitorData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Visitors"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No visitor data for this period
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

