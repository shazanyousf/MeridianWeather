// Admin user management
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrash2, FiUserX, FiUserCheck, FiShield } from 'react-icons/fi';
import { adminService } from '@/services/adminService';
import { AdminUser } from '@/types';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers(1, 100);
      setUsers(data.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (user: AdminUser) => {
    try {
      await adminService.toggleBlockUser(user._id);
      setUsers(users.map((u) => (u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u)));
      toast.success(user.isBlocked ? 'User unblocked' : 'User blocked');
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handlePromote = async (user: AdminUser) => {
    try {
      await adminService.promoteUser(user._id);
      toast.success('User promoted');
    } catch (err) {
      toast.error('Failed to promote user');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all registered users</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-64 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-t border-gray-100 dark:border-gray-700"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.isBlocked
                          ? 'bg-red-100 text-red-700'
                          : user.isVerified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.isBlocked ? 'Blocked' : user.isVerified ? 'Active' : 'Unverified'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      {user.createdAt ? new Date(user.createdAt).toDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBlock(user)}
                          className={`p-2 rounded-lg ${
                            user.isBlocked
                              ? 'bg-green-100 text-green-600'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}
                          title={user.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {user.isBlocked ? <FiUserCheck size={16} /> : <FiUserX size={16} />}
                        </button>
                        <button
                          onClick={() => handlePromote(user)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600"
                          title="Promote"
                        >
                          <FiShield size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 rounded-lg bg-red-100 text-red-600"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
