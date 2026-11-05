'use client';

import Link from 'next/link';
import { usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Landmark,    // 🏦 Loans
  TrendingUp,   // 📈 Investment
  FileCheck,    // 🆔 KYC Verification
  Settings,     // ⚙️ Settings
  ShieldAlert,
  LogOut,
  Crown,
} from 'lucide-react';

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === 'admin';
  const t = useTranslations('Sidebar');

  // Navigation config array 🗺️ with translations
  const navItems = [
    { label: t('overview'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('transfers'), href: '/dashboard/transfers', icon: ArrowLeftRight },
    { label: t('metalCards'), href: '/dashboard/cards', icon: CreditCard },
    { label: t('loans'), href: '/dashboard/loans', icon: Landmark },
    { label: t('investment'), href: '/dashboard/investments', icon: TrendingUp },
    { label: t('kycVerification'), href: '/dashboard/kyc', icon: FileCheck },
    { label: t('settings'), href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#263346] bg-[#151C28]/90 backdrop-blur-xl p-6 sticky top-0 h-screen shrink-0">
      <div className="space-y-8">
        {/* Brand Logo 👑 */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-[#8B5CF6] flex items-center justify-center font-bold text-white shadow-lg shadow-[#8B5CF6]/25 group-hover:scale-105 transition-transform">
            <Crown size={22} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white block">
              Apex Vault
            </span>
            <span className="text-[10px] uppercase font-semibold text-[#A78BFA] tracking-widest block">
              Private Wealth
            </span>
          </div>
        </Link>

        {/* Navigation Links 🧭 */}
        <nav className="space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {t('navigation')}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 font-semibold shadow-sm shadow-[#8B5CF6]/10'
                    : 'text-slate-400 hover:text-white hover:bg-[#263346]/50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#8B5CF6]' : 'text-slate-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Admin Compliance Section 🛡️ */}
          {isAdmin && (
            <div className="pt-4 border-t border-[#263346]/60 mt-4 space-y-1.5">
              <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#A78BFA]">
                {t('compliance')}
              </div>
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/40 font-semibold'
                    : 'text-[#A78BFA]/80 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 hover:text-[#A78BFA] border border-[#8B5CF6]/20'
                }`}
              >
                <ShieldAlert size={18} />
                <span>{t('adminPanel')}</span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile & Sign Out 👤 */}
      <div className="border-t border-[#263346] pt-4 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-xl bg-[#263346] flex items-center justify-center font-bold text-[#A78BFA] border border-[#8B5CF6]/30 shrink-0">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user.name || t('customer')}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#263346] bg-[#0B0F17] text-xs font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition"
        >
          <LogOut size={14} />
          <span>{t('signOut')}</span>
        </button>
      </div>
    </aside>
  );
}