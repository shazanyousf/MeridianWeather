// Reset password page
'use client';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiLock, FiCloud } from 'react-icons/fi';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MainLayout } from '@/components/layout/MainLayout';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const otpFlow = !token && Boolean(email);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      if (otpFlow) {
        await authService.resetPasswordWithOTP(email, otp, password);
      } else {
        await authService.resetPassword(token, password);
      }
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card p-8">
      <div className="text-center mb-8">
        <FiCloud className="text-primary-600 dark:text-primary-400 mx-auto mb-3" size={48} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your new password</p>
      </div>

      {!token && !otpFlow && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg text-sm">
          No reset token provided. Please use the link from your email.
        </div>
      )}

      {otpFlow && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
          Enter the OTP sent to {email} and set a new password.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {otpFlow && (
          <Input
            label="OTP"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            required
          />
        )}
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 characters"
          icon={<FiLock />}
          required
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          icon={<FiLock />}
          required
        />
        <Button type="submit" loading={loading} fullWidth size="lg" disabled={!token && !otpFlow}>
          Reset Password
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </MainLayout>
  );
}
