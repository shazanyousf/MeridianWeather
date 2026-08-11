// Verify email page
'use client';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiCheckCircle, FiShield, FiRefreshCw } from 'react-icons/fi';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MainLayout } from '@/components/layout/MainLayout';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';
  const prefilledEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const isTokenFlow = Boolean(token);

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await authService.verifyEmail(email, token);
      setStatus('success');
      setMessage('Email verified successfully! You can now login.');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await authService.verifyOTP(email, otp);
      setStatus('success');
      setMessage('Email verified successfully! You can now login.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email first.');
      return;
    }

    setResending(true);
    setMessage('');
    try {
      await authService.sendOTP(email);
      setStatus('success');
      setMessage('A new OTP has been sent to your email.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card p-8">
      <div className="text-center mb-8">
        {status === 'success' ? (
          <FiCheckCircle className="text-green-500 mx-auto mb-3" size={48} />
        ) : (
          <FiShield className="text-primary-600 dark:text-primary-400 mx-auto mb-3" size={48} />
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Verify Your Email
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isTokenFlow
            ? 'Enter your email to complete verification'
            : 'Enter the OTP sent to your email'}
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            status === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={isTokenFlow ? handleVerifyToken : handleVerifyOtp} className="space-y-5">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<FiMail />}
          required
        />
        {!isTokenFlow && (
          <Input
            label="OTP"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            required
          />
        )}
        <Button type="submit" loading={loading} fullWidth size="lg">
          {isTokenFlow ? 'Verify Email' : 'Verify OTP'}
        </Button>
      </form>

      {!isTokenFlow && (
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resending}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-60"
        >
          <FiRefreshCw size={14} className={resending ? 'animate-spin' : ''} />
          {resending ? 'Sending...' : 'Resend OTP'}
        </button>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <VerifyEmailForm />
          </Suspense>
        </motion.div>
      </div>
    </MainLayout>
  );
}
