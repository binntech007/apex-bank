'use client';

import { useState } from 'react';
import { CurrencySwapModal } from '@/components/dashboard/CurrencySwapModal';
import { RefreshCw, Send } from 'lucide-react';
import Link from 'next/link';

interface DashboardControlsProps {
  userId: string;
  vaults: Array<{ id: string; name: string; currency: string; balance: string }>;
}

export function DashboardControls({ userId, vaults }: DashboardControlsProps) {
  const [isSwapOpen, setIsSwapOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Send Wire Button 💸 */}
        <Link
          href="/dashboard/transfers"
          className="px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold hover:bg-[#7C3AED] transition flex items-center gap-2 shadow-md"
        >
          <Send size={14} />
          <span>Send Wire</span>
        </Link>

        {/* Currency Swap Button 💱 */}
        <button
          onClick={() => setIsSwapOpen(true)}
          className="px-4 py-2 rounded-xl border border-[#263346] bg-[#151C28] text-slate-300 text-xs font-semibold hover:bg-[#1C2536] hover:text-white transition flex items-center gap-2"
        >
          <RefreshCw size={14} className="text-[#A78BFA]" />
          <span>Currency Swap</span>
        </button>
      </div>

      {/* Currency Swap Modal 💳 */}
      <CurrencySwapModal
        isOpen={isSwapOpen}
        onClose={() => setIsSwapOpen(false)}
        userId={userId}
        vaults={vaults}
      />
    </>
  );
}