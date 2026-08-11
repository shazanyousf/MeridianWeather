// Notifications page
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { userService } from '@/services/userService';
import { NotificationItem } from '@/types';
import { timeAgo } from '@/utils/format';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
const data = await userService.getNotifications();
      setNotifications(data.data || []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await userService.markNotificationRead(id);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const markAllRead = async () => {
    try {
      await userService.markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const typeColor: Record<string, string> = {
    alert: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    success: 'bg-green-500',
    system: 'bg-purple-500',
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FiBell className="text-red-500" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Weather alerts and announcements
            </p>
          </div>
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
<FiCheckCircle size={16} />
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => (
            <motion.div
              key={notif._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !notif.read && markRead(notif._id)}
              className={`p-4 rounded-xl cursor-pointer transition-colors ${
                notif.read
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${typeColor[notif.type] || 'bg-gray-400'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{notif.title}</h3>
                    <span className="text-xs text-gray-500">{timeAgo(notif.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notif.message}</p>
                  {!notif.read && (
                    <span className="flex items-center gap-1 text-xs text-primary-600 mt-2">
                      <FiCheck size={12} />
                      Mark as read
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
