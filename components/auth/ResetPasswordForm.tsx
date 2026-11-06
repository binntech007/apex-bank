
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/actions/auth/reset-password';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({
  token,
}: ResetPasswordFormProps) {
  const locale = useLocale();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!token) {
      setError('This password reset link is invalid or incomplete.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        token,
        password,
        confirmPassword,
      });

      if (result.success) {
        setMessage(result.message);
        setPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="mb-5 text-sm text-red-400">
          This password reset link is invalid or incomplete.
        </p>

        <Link
          href={`/${locale}/forgot-password`}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">
          Create New Password
        </h1>

        <p className="mt-3 text-sm text-gray-400">
          Enter your new password below to secure your account.
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
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            New Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your new password"
            className="w-full rounded-lg border border-gray-700 bg-[#111827] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <p className="mt-2 text-xs text-gray-500">
            Use at least 8 characters.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Confirm New Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm your new password"
            className="w-full rounded-lg border border-gray-700 bg-[#111827] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
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
