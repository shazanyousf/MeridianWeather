// Feedback page
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiSend } from 'react-icons/fi';
import { userService } from '@/services/userService';
import { Feedback } from '@/types';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('suggestion');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const data = await userService.getMyFeedback();
      setFeedbacks(data);
    } catch (err) {
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userService.submitFeedback({ subject, message, rating, category });
      toast.success('Feedback submitted! Thank you.');
      setSubject('');
      setMessage('');
      setRating(5);
      loadFeedback();
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <FiMessageSquare className="text-purple-500" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feedback</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Share your thoughts about Meridian Weather
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit feedback */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Submit Feedback
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                placeholder="Brief subject"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                placeholder="Your feedback..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className={`text-2xl ${r <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              <FiSend size={16} />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>

        {/* Feedback history */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Feedback History
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : feedbacks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No feedback submitted yet</p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <motion.div
                  key={fb._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{fb.subject}</h4>
                    <span className="text-xs">{'★'.repeat(fb.rating)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{fb.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      fb.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : fb.status === 'reviewed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {fb.status}
                    </span>
                    {fb.adminReply && (
                      <p className="text-xs text-gray-500">Admin: {fb.adminReply}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
