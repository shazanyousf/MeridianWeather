// Login page
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiCloud } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MainLayout } from '@/components/layout/MainLayout';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      if (String(message).toLowerCase().includes('not verified')) {
        setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(email)}`), 800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="inline-block text-primary-600 dark:text-primary-400 mb-3"
              >
                <FiCloud size={48} />
              </motion.span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your Meridian Weather account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<FiMail />}
                required
              />
              <div>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={<FiLock />}
                  required
                />
                <div className="flex justify-end mt-2">
                  <Link href="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Remember me
              </label>

              <Button type="submit" loading={loading} fullWidth size="lg">
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
