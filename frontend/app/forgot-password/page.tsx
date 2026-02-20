'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError(validateEmail(value));
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      toast.error(emailError);
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        toast.success(result.message);
        setEmail('');
      } else {
        // Check if it's a rate limit error
        if (result.message.includes('rate limit') || result.message.includes('Email rate limit exceeded')) {
          toast.error('Email rate limit exceeded. Please contact admin or try again after 1 hour.');
        } else {
          toast.error(result.message);
        }
      }
    } catch (error: any) {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900">Forgot Password?</h1>
            <p className="text-gray-600 mt-2">
              Enter your email and we'll send you a reset link
            </p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-left">
              <p className="font-semibold text-yellow-800 mb-1">⚠️ Email Rate Limit:</p>
              <p className="text-yellow-700">
                If you get "rate limit exceeded" error, please contact admin to reset your password directly from Supabase dashboard, or wait 1 hour and try again.
              </p>
            </div>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                required
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <Link href="/login" className="block text-blue-900 hover:underline">
              Back to Sign In
            </Link>
            <Link href="/" className="block text-gray-600 hover:text-blue-900">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
