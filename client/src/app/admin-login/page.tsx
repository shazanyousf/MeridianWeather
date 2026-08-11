// Admin login page
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { adminService } from '@/services/adminService';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminService.login(email, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card p-8">
            <div className="text-center mb-8">
              <FiShield className="text-primary-600 dark:text-primary-400 mx-auto mb-3" size={48} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Sign in to manage Meridian Weather
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Admin Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                icon={<FiMail />}
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<FiLock />}
                required
              />

              <Button type="submit" loading={loading} fullWidth size="lg">
                Sign In as Admin
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                User account?{' '}
                <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  Go to user login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
