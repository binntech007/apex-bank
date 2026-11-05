// app/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { InputGroup } from './InputGroup';
import { ArrowRight } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const t = useTranslations('LoginForm');

  const LoginSchema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
    password: z.string().min(1, t('validation.passwordRequired')),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setError('');

    const validation = LoginSchema.safeParse({ email, password });
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0];
        if (typeof fieldName === 'string') {
          formattedErrors[fieldName] = issue.message;
        }
      }
      setFieldErrors(formattedErrors);
      return;
    }

    setLoading(true);

    try {
      // 🔑 Perform NextAuth authentication
      const authRes = await signIn('credentials', {
        email,
        password,
        twoFactorToken: showTwoFactor ? twoFactorToken : undefined,
        redirect: false,
      });

      if (authRes?.error) {
        const errMessage = String(authRes.error);
        const errCode = (authRes as any).code || '';

        // 🚫 1. Check for Account Suspension
        if (errCode === 'ACCOUNT_SUSPENDED' || errMessage.includes('ACCOUNT_SUSPENDED')) {
          setShowTwoFactor(false);
          setError('Your account is suspended. Please contact support 🚫.');
        } 
        // 🔑 2. Check for Invalid Password
        else if (errCode === 'INVALID_PASSWORD' || errMessage.includes('INVALID_PASSWORD')) {
          setShowTwoFactor(false);
          setError('Invalid password. Please try again ⚠️.');
        } 
        // 📱 3. Check if 2FA is required and token is missing
        else if (
          errCode === '2FA_REQUIRED' || 
          errMessage.includes('2FA_REQUIRED') || 
          (!showTwoFactor && (errMessage.includes('CredentialsSignin') || errCode === 'CredentialsSignin') && !twoFactorToken)
        ) {
          setShowTwoFactor(true);
          setError('Please enter your 2FA authenticator code 📱.');
        } 
        // ⚠️ 4. Check for invalid 2FA token specifically
        else if (errCode === 'INVALID_2FA_TOKEN' || errMessage.includes('INVALID_2FA_TOKEN')) {
          setShowTwoFactor(true);
          setError('Invalid 2FA code. Please try again ⚠️.');
        } 
        // ❌ 5. Fallback for general errors
        else {
          setShowTwoFactor(false);
          setError(t('errors.invalidCredentials'));
        }
      } else if (!authRes?.ok) {
        setShowTwoFactor(false);
        setError(t('errors.invalidCredentials'));
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setShowTwoFactor(false);
      setError(t('errors.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold text-center ${
          error.includes('authenticator code')
            ? 'border-purple-500/25 bg-purple-500/10 text-purple-300'
            : 'border-red-500/25 bg-red-500/10 text-red-400'
        }`}>
          {error}
        </div>
      )}

      <InputGroup
        label={t('fields.emailLabel')}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="samuel@example.com"
        error={fieldErrors.email}
      />

      <InputGroup
        label={t('fields.passwordLabel')}
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        error={fieldErrors.password}
      />

      {/* 🔐 Conditional 2FA Input Field */}
      {showTwoFactor && (
        <div className="space-y-1 animate-fadeIn">
          <label className="text-xs font-semibold text-slate-300 uppercase block">
            2FA Verification Code 📱
          </label>
          <input
            type="text"
            value={twoFactorToken}
            onChange={(e) => setTwoFactorToken(e.target.value)}
            placeholder="123456"
            maxLength={6}
            required
            autoFocus
            className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-center tracking-widest text-white focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3.5 font-bold text-white hover:bg-[#7C3AED] transition disabled:opacity-50 shadow-lg shadow-[#8B5CF6]/20"
      >
        {loading ? t('buttons.authenticating') : t('buttons.signIn')}
        <ArrowRight size={18} />
      </button>

      <div className="pt-4 border-t border-[#263346] flex items-center justify-between text-xs text-slate-400">
        <span>{t('footer.prompt')}</span>
        <Link href="/register" className="font-semibold text-[#A78BFA] hover:underline">
          {t('footer.createAccount')}
        </Link>
      </div>
    </form>
  );
}