// Admin announcements management
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { adminService } from '@/services/adminService';
import { Announcement } from '@/types';
import toast from 'react-hot-toast';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await adminService.getAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createAnnouncement({ title, message, type, priority });
      setTitle('');
      setMessage('');
      setType('info');
      setPriority('medium');
      setShowForm(false);
      toast.success('Announcement created');
      loadAnnouncements();
    } catch (err) {
      toast.error('Failed to create announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await adminService.deleteAnnouncement(id);
      setAnnouncements(announcements.filter((a) => a._id !== id));
      toast.success('Announcement deleted');
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  const handleToggle = async (ann: Announcement) => {
    try {
      await adminService.updateAnnouncement(ann._id, { isActive: !ann.isActive });
      setAnnouncements(announcements.map((a) => (a._id === ann._id ? { ...a, isActive: !a.isActive } : a)));
      toast.success('Announcement updated');
    } catch (err) {
      toast.error('Failed to update announcement');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Announcements</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage platform announcements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <FiPlus size={16} />
          New Announcement
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-8 space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Announcement</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="maintenance">Maintenance</option>
                <option value="feature">Feature</option>
                <option value="alert">Alert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Create Announcement
          </button>
        </motion.form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FiBell className="mx-auto mb-4" size={40} />
          No announcements yet
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann, i) => (
            <motion.div
              key={ann._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 ${
                !ann.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{ann.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ann.type === 'warning' ? 'bg-yellow-100 text-yellow-700'
                      : ann.type === 'alert' ? 'bg-red-100 text-red-700'
                      : ann.type === 'feature' ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ann.type}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{ann.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(ann)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    title={ann.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {ann.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
