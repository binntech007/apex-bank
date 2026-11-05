// components/dashboard/DashboardHeader.tsx
import Link from 'next/link';
import { Send, CreditCard, ShieldAlert, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher'; // Adjust path if needed

interface DashboardHeaderProps {
  userName?: string | null;
  kycStatus?: string | null;
}

export function DashboardHeader({ userName, kycStatus }: DashboardHeaderProps) {
  const t = useTranslations('Dashboard');
  
  const isApproved = kycStatus === 'approved';
  const isPending = kycStatus === 'pending';
  const isRejected = kycStatus === 'rejected';

  const displayStatus = kycStatus || 'Unverified';

  return (
    <div className="space-y-4 border-b border-[#263346] pb-6">
      {/* Header Top Bar 🔝 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t('welcomeBack', { name: userName || 'Private Client' })}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isApproved
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : isPending
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : isRejected
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}
            >
              KYC: {displayStatus}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Actions & Language Switcher 🌐 */}
        <div className="flex items-center gap-3 flex-wrap">
          <LanguageSwitcher />
          <Link
            href="/dashboard/transfers"
            className="flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#7C3AED] transition shadow-lg shadow-[#8B5CF6]/20"
          >
            <Send size={16} /> {t('sendWire')}
          </Link>
          <Link
            href="/dashboard/cards"
            className="flex items-center gap-2 rounded-xl border border-[#263346] bg-[#151C28] px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#263346] transition"
          >
            <CreditCard size={16} /> {t('metalCards')}
          </Link>
        </div>
      </div>

      {/* KYC Alert Banner (Shows if NOT approved) 🛡️ */}
      {!isApproved && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border text-xs sm:text-sm font-medium ${
          isRejected 
            ? 'border-red-500/20 bg-red-500/10 text-red-300'
            : isPending
            ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
            : 'border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD]'
        }`}>
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="shrink-0" />
            <span>
              {isPending
                ? t('kycPending')
                : isRejected
                ? t('kycRejected')
                : t('kycRequired')}
            </span>
          </div>
          <Link
            href="/dashboard/kyc"
            className="shrink-0 inline-flex items-center justify-center gap-1 text-xs font-bold bg-white text-black hover:bg-slate-200 px-3.5 py-2 rounded-lg transition"
          >
            <span>{isPending ? t('checkStatus') : t('verifyNow')}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}