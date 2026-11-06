
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { requestPasswordReset } from '@/actions/auth/forgot-password';

export default function ForgotPasswordForm() {
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const result = await requestPasswordReset({
        email,
        locale,
      });

      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">
          Forgot Password?
        </h1>

        <p className="mt-3 text-sm text-gray-400">
          Enter your registered email address and we will send you a
          password reset link.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Email Address
          </label>

          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            className="w-full rounded-lg border border-gray-700 bg-[#111827] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-7 text-center">
        <Link
          href={`/${locale}/login`}
          className="text-sm text-blue-400 transition hover:text-blue-300"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
