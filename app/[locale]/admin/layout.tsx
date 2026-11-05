// app/admin/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  History, 
  Settings, 
  LogOut,
  Menu,
  X,
  Landmark,
  CreditCard,
  Globe
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'KYC Approvals', href: '/admin/kyc', icon: FileCheck },
  { name: 'Transactions', href: '/admin/transactions', icon: Globe }, // 👈 Added Transactions link here
  { name: 'Loans', href: '/admin/loans', icon: Landmark },
  { name: 'Cards', href: '/admin/cards', icon: CreditCard },
  { name: 'User Directory', href: '/admin/users', icon: Users },
  { name: 'Audit Logs', href: '/admin/logs', icon: History },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#E2E8F0] flex flex-col md:flex-row">
      {/* Mobile Top Header 📱 */}
      <header className="md:hidden flex items-center justify-between border-b border-[#263346] bg-[#151C28] px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold text-white text-sm">Apex Admin</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-[#0B0F17] border border-[#263346] text-slate-300 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Overlay Backdrop 🌫️ */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Responsive Sidebar 🗂️ */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 border-r border-[#263346] bg-[#151C28] flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          {/* Brand Header 🛡️ */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-tight text-sm">Apex Admin</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Compliance Portal</p>
            </div>
          </div>

          {/* Navigation Links 🔗 */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20'
                      : 'text-slate-400 hover:text-white hover:bg-[#263346]/50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout Area 🚪 */}
        <div className="border-t border-[#263346] pt-4 px-2">
          <Link
            href="/admin/login"
            className="flex items-center gap-3 text-xs font-semibold text-slate-400 hover:text-red-400 transition"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area 📄 */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}