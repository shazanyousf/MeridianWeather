// Forgot password page
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiCloud } from 'react-icons/fi';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MainLayout } from '@/components/layout/MainLayout';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authService.forgotPassword(email);
      const targetEmail = response?.email || email;
      setMessage('OTP sent! Redirecting you to reset your password...');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(targetEmail)}`);
      }, 900);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
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
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card p-8">
            <div className="text-center mb-8">
              <FiCloud className="text-primary-600 dark:text-primary-400 mx-auto mb-3" size={48} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Enter your email to receive a password reset OTP
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
                {message}
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
              <Button type="submit" loading={loading} fullWidth size="lg">
                Send OTP
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
