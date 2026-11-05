'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import {
  Menu,
  X,
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Building2,
  TrendingUp,
  UserCheck,
  Settings,
  ShieldAlert,
  LogOut,
  Crown,
} from 'lucide-react';

interface MobileNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = user.role === 'admin';
  const t = useTranslations('Sidebar');

  // Automatically close the mobile drawer whenever the page route changes 🔄
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock background body scrolling when the drawer is open 🔒
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { label: t('overview'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('transfers'), href: '/dashboard/transfers', icon: ArrowLeftRight },
    { label: t('metalCards'), href: '/dashboard/cards', icon: CreditCard },
    { label: t('loans'), href: '/dashboard/loans', icon: Building2 },
    { label: t('investment'), href: '/dashboard/investments', icon: TrendingUp },
    { label: t('kycVerification'), href: '/dashboard/kyc', icon: UserCheck },
    { label: t('settings'), href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="lg:hidden w-full bg-[#151C28] border-b border-[#263346] sticky top-0 z-40">
      {/* Top Bar Header 🔝 */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center font-bold text-white shadow-md shadow-[#8B5CF6]/20">
            <Crown size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block leading-none">
              Apex Vault
            </span>
            <span className="text-[9px] uppercase font-semibold text-[#A78BFA] tracking-widest block mt-0.5">
              Private Wealth
            </span>
          </div>
        </Link>

        {/* Hamburger Toggle Button 🍔 */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation Menu"
          className="p-2 rounded-xl border border-[#263346] bg-[#0B0F17] text-slate-300 hover:text-white hover:bg-[#263346]/50 transition"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Slide-Over Overlay & Drawer Panel 🚪 */}
      {isOpen && (
        <div className="fixed inset-0 top-14.25 z-50 flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 top-14.25 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-4/5 max-w-xs bg-[#151C28] border-r border-[#263346] p-5 flex flex-col justify-between h-[calc(100vh-57px)] z-10 shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <nav className="space-y-1.5">
                <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {t('navigation')}
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = 
                    item.href === '/dashboard' 
                      ? pathname === '/dashboard' 
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#263346]/50'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-[#8B5CF6]' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Admin Section 🛡️ */}
                {isAdmin && (
                  <div className="pt-4 border-t border-[#263346]/60 mt-4 space-y-1.5">
                    <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#A78BFA]">
                      {t('compliance')}
                    </div>
                    <Link
                      href="/admin"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
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

            {/* Footer Profile & Sign Out 👤 */}
            <div className="border-t border-[#263346] pt-4 space-y-3 mt-6">
              <div className="flex items-center gap-3 px-1">
                <div className="h-8 w-8 rounded-lg bg-[#263346] flex items-center justify-center font-bold text-[#A78BFA] border border-[#8B5CF6]/30 shrink-0 text-xs">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">{user.name || t('customer')}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#263346] bg-[#0B0F17] text-xs font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition"
              >
                <LogOut size={14} />
                <span>{t('signOut')}</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}