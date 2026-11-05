'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  ArrowLeftRight, 
  Receipt, 
  History, 
  Sliders, 
  PlusCircle 
} from 'lucide-react';

export function QuickActions() {
  const t = useTranslations('QuickActions');

  const actions = [
    {
      label: t('addMoney.label'),
      desc: t('addMoney.desc'),
      href: '/dashboard/deposit',
      icon: PlusCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: t('sendWire.label'),
      desc: t('sendWire.desc'),
      href: '/dashboard/transfers',
      icon: ArrowLeftRight,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      label: t('payBills.label'),
      desc: t('payBills.desc'),
      href: '/dashboard/bills',
      icon: Receipt,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: t('history.label'),
      desc: t('history.desc'),
      href: '/dashboard/transactions',
      icon: History,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: t('cardLimits.label'),
      desc: t('cardLimits.desc'),
      href: '/dashboard/settings/limits',
      icon: Sliders,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {t('sectionTitle')} ⚡
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              href={act.href}
              className="group p-4 bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 rounded-2xl transition-all duration-200 shadow-lg flex flex-col justify-between space-y-3"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${act.bg}`}>
                <Icon size={18} className={act.color} />
              </div>

              <div>
                <p className="text-xs font-bold text-white group-hover:text-[#A78BFA] transition">
                  {act.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {act.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}