'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAdmin } from '@/actions/admin-auth';
import { ShieldAlert, KeyRound, User, Mail, ArrowRight, Lock, Loader2 } from 'lucide-react';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // 👈 Added password state
  const [adminSecret, setAdminSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Step 1: Register Admin Record in Database 🐘
    const res = await registerAdmin({
      fullName,
      email,
      password, // 👈 Passing password to hashed server action
      adminSecret,
    });

    if (!res.success) {
      setError(res.error || 'Admin setup failed.');
      setLoading(false);
      return;
    }

    // Step 2: Authenticate Session via NextAuth Credentials 🔑
    const authRes = await signIn('credentials', {
      email,
      password, // 👈 Passing password for NextAuth verification
      redirect: false,
    });

    if (authRes?.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Admin created, but session start failed. Please try logging in manually.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-[#E2E8F0] items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-[#263346] bg-[#151C28] p-8 backdrop-blur-xl shadow-2xl">
        {/* Header 🛡️ */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30">
            <ShieldAlert size={26} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Compliance Admin Setup</h1>
          <p className="text-xs text-slate-400">Internal Audit & System Oversight Provisioning</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Secret Key Input 🔑 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Authorization Key / Secret Passphrase
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter ADMIN_REGISTRATION_SECRET"
                className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>
          </div>

          {/* Full Name Input 👤 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Legal Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Official Name"
                className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>
          </div>

          {/* Email Input ✉️ */}
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

          {/* Password Input 🔒 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Admin Password
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

          {/* Notice Box 🔒 */}
          <div className="p-3.5 rounded-xl border border-[#263346] bg-[#0B0F17]/50 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock size={12} className="text-[#A78BFA]" /> Restricted Internal Access
            </p>
            <p>Admin accounts hold elevated permissions for KYC overrides, ledger reversions, and system parameters.</p>
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
                <span>Provisioning Account...</span>
              </>
            ) : (
              <>
                <span>Provision Admin Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered as admin?{' '}
          <Link href="/admin/login" className="font-semibold text-[#A78BFA] hover:underline">
            Admin Portal Login
          </Link>
        </p>
      </div>
    </div>
  );
}