// Admin feedback management
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiCheck, FiX } from 'react-icons/fi';
import { adminService } from '@/services/adminService';
import { Feedback } from '@/types';
import toast from 'react-hot-toast';

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyById, setReplyById] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const data = await adminService.getAllFeedback(1, 100);
      setFeedback(data.data || []);
    } catch (err) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateFeedback(id, { status });
      setFeedback(feedback.map((f) => (f._id === id ? { ...f, status } : f)));
      toast.success('Feedback updated');
    } catch (err) {
      toast.error('Failed to update feedback');
    }
  };

  const handleReply = async (id: string) => {
    const replyText = (replyById[id] || '').trim();
    if (!replyText) return;
    try {
      await adminService.updateFeedback(id, { status: 'resolved', adminReply: replyText });
      setFeedback(feedback.map((f) => (f._id === id ? { ...f, status: 'resolved', adminReply: replyText } : f)));
      setReplyById((prev) => ({ ...prev, [id]: '' }));
      toast.success('Reply sent');
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Feedback</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Review and respond to user feedback</p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FiMessageSquare className="mx-auto mb-4" size={40} />
          No feedback yet
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((fb, i) => (
            <motion.div
              key={fb._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{fb.subject}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {fb.category} • Rating: {'★'.repeat(fb.rating)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  fb.status === 'resolved'
                    ? 'bg-green-100 text-green-700'
                    : fb.status === 'reviewed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {fb.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{fb.message}</p>

              {fb.adminReply && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Admin Reply:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{fb.adminReply}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus(fb._id, 'reviewed')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100"
                >
                  <FiCheck size={12} /> Mark Reviewed
                </button>
                <button
                  onClick={() => handleUpdateStatus(fb._id, 'resolved')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100"
                >
                  <FiCheck size={12} /> Resolve
                </button>
                <input
                  type="text"
                  value={replyById[fb._id] || ''}
                  onChange={(e) =>
                    setReplyById((prev) => ({
                      ...prev,
                      [fb._id]: e.target.value,
                    }))
                  }
                  placeholder="Write a reply..."
                  className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => handleReply(fb._id)}
                  className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Send Reply
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
