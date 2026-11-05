// components/layout/Header.tsx
import { Bell } from 'lucide-react';
import { LiveClock } from './LiveClock';

interface HeaderProps {
  userName?: string | null;
}

export function Header({ userName }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#263346] bg-[#151C28]/80 px-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
      {/* Mobile Branding */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="h-8 w-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center font-bold text-white">
          A
        </div>
        <span className="font-bold text-lg text-white">Apex Vault</span>
      </div>

      {/* Status & Live Clock */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <span className="h-2 w-2 rounded-full bg-[#8B5CF6] animate-pulse" />
          <span className="text-slate-400">Encrypted Wealth Ledger Active</span>
        </div>

        <div className="h-4 w-px bg-[#263346]" />

        <LiveClock />
      </div>

      {/* Greeting with Database User Name */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl text-slate-400 hover:bg-[#263346] transition border border-[#263346]">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#8B5CF6]" />
        </button>

        <div className="h-6 w-px bg-[#263346]" />

        <span className="text-sm font-semibold text-white">
          Hello, <span className="text-[#A78BFA]">{userName || 'User'}</span>
        </span>
      </div>
    </header>
  );
}