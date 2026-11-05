'use client';

import { Settings, RefreshCw, Shield, Bell, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsHubPage() {
  const settingSections = [
    {
      title: 'Currency & Exchange Rates',
      description: 'Manage active currency pairs, set custom conversion rates, and view history.',
      icon: RefreshCw,
      href: '/admin/settings/exchange-rates',
      badge: 'Active',
    },
    // You can add more setting cards here in the future!
    {
      title: 'Security & Access Control',
      description: 'Configure session lifetimes, strict 2FA requirements, and IP restrictions.',
      icon: Shield,
      href: '#',
      badge: 'Coming Soon',
    },
    {
      title: 'System Notifications',
      description: 'Customize global email alerts, SMS gateways, and webhook endpoints.',
      icon: Bell,
      href: '#',
      badge: 'Coming Soon',
    },
    {
      title: 'Localization & Regions',
      description: 'Set default platform languages, timezone parameters, and date formatting.',
      icon: Globe,
      href: '#',
      badge: 'Coming Soon',
    },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 min-h-screen bg-[#0B0F17] text-[#E2E8F0]">
      {/* Header ⚙️ */}
      <div className="border-b border-[#263346] pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="text-[#A78BFA]" size={32} />
          Admin Control Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage system configurations, global parameters, and platform operational modules
        </p>
      </div>

      {/* Settings Grid Cards 🗂️ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingSections.map((section, idx) => {
          const Icon = section.icon;
          const isReady = section.href !== '#';

          return (
            <div
              key={idx}
              className={`rounded-2xl border border-[#263346] bg-[#151C28] p-6 shadow-xl flex flex-col justify-between transition relative overflow-hidden ${
                isReady ? 'hover:border-[#8B5CF6]/50 group' : 'opacity-75'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20">
                    <Icon size={24} />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    isReady 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {section.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition">
                    {section.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#263346]/50 flex items-center justify-between">
                {isReady ? (
                  <Link
                    href={section.href}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#A78BFA] hover:text-white transition"
                  >
                    <span>Configure module</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <span className="text-xs font-medium text-slate-500">Available in future updates</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}