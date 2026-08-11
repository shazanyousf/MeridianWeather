// Settings page
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiMoon, FiSun, FiGlobe, FiBell } from 'react-icons/fi';
import { useThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { setUnits } from '@/redux/slices/uiSlice';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeContext();
  const { user, updateUser } = useAuth();
  const dispatch = useAppDispatch();
  const units = useAppSelector((state) => state.ui.units);
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: next-themes only knows the theme on the client.
  useEffect(() => setMounted(true), []);

  const handleUnitsChange = async (newUnits: 'metric' | 'imperial') => {
    dispatch(setUnits(newUnits));
    try {
      const prefs = await userService.updatePreferences({ units: newUnits });
      updateUser({ preferences: prefs });
      toast.success('Units updated');
    } catch (err) {
      toast.error('Failed to update units');
    }
  };

  const handleNotificationsToggle = async () => {
    const newVal = !notifications;
    setNotifications(newVal);
    try {
      const prefs = await userService.updatePreferences({ notifications: newVal });
      updateUser({ preferences: prefs });
      toast.success('Notification preferences updated');
    } catch (err) {
      setNotifications(!newVal);
      toast.error('Failed to update preferences');
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <FiSettings className="text-primary-500" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your weather experience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
        >
<div className="flex items-center gap-3 mb-4">
            {mounted && (theme === 'dark' ? <FiMoon className="text-purple-500" size={20} /> : <FiSun className="text-yellow-500" size={20} />)}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Theme</h3>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Currently using {mounted && (theme === 'dark' ? 'Dark' : 'Light')} mode
            </p>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Switch to {mounted && (theme === 'dark' ? 'Light' : 'Dark')}
            </button>
          </div>
        </motion.div>

        {/* Units */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiGlobe className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Measurement Units</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleUnitsChange('metric')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border ${
                units === 'metric'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              Metric (°C, km/h)
            </button>
            <button
              onClick={() => handleUnitsChange('imperial')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border ${
                units === 'imperial'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              Imperial (°F, mph)
            </button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiBell className="text-red-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Weather Alerts</p>
              <p className="text-xs text-gray-500">Receive alerts for severe weather</p>
            </div>
            <button
              onClick={handleNotificationsToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
