// app/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';
import { Crown } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function CustomerLoginPage() {
  const t = await getTranslations('CustomerLoginPage');

  return (
    <div className="flex min-h-screen bg-obsidian text-[#E2E8F0] items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-[#263346] bg-[#151C28] p-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30">
            <Crown size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-xs text-slate-400">{t('subtitle')}</p>
        </div>

        <LoginForm />

        <div className="text-center pt-2">
          <Link href="/admin/login" className="text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition">
            {t('adminPortalLink')} →
          </Link>
        </div>
      </div>
    </div>
  );
}