'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyAdminLogin } from '@/actions/admin-auth';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // 👈 Added password state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Verify credentials with server action 🔐
    const res = await verifyAdminLogin({ email, password });

    if (!res.success) {
      setError(res.error || 'Admin verification failed.');
      setLoading(false);
      return;
    }

    // 2. Start NextAuth session 🔑
    const authRes = await signIn('credentials', {
      email,
      password,
      role: 'admin',
      redirect: false,
    });

    if (authRes?.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Email Input Field ✉️ */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Corporate Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@apexbank.com"
            className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>
      </div>

      {/* Password Input Field 🔒 */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>
      </div>

      {/* Submit Button 🚀 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3.5 font-bold text-white hover:bg-[#7C3AED] transition disabled:opacity-50 shadow-lg shadow-[#8B5CF6]/20"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <>
            <span>Sign In to Compliance Portal</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <div className="flex items-center justify-between text-xs pt-2">
        <Link href="/" className="text-slate-400 hover:text-white transition">
          ← Customer Portal
        </Link>
        <Link href="/admin/register" className="font-semibold text-[#A78BFA] hover:underline">
          Register New Admin
        </Link>
      </div>
    </form>
  );
}