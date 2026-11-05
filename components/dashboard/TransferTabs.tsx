'use client';

import { useState } from 'react';
import { ArrowLeftRight, UserCheck, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { InternalTransferForm } from '@/components/dashboard/InternalTransferForm';
import { P2PTransferForm } from '@/components/dashboard/P2PTransferForm';
import { InternationalWireForm } from '@/components/dashboard/InternationalWireForm';

interface Vault {
  id: string;
  name: string;
  currency: string;
  balance: string;
}

interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: string;
}

interface TransferTabsProps {
  vaults: Vault[];
  userId: string;
  rates?: ExchangeRate[];
}

export function TransferTabs({ vaults, userId, rates = [] }: TransferTabsProps) {
  const [activeTab, setActiveTab] = useState<'internal' | 'p2p' | 'international'>('internal');
  const t = useTranslations('TransferTabs');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Tab Controls 🔘 */}
      <div className="flex rounded-2xl bg-[#151C28] p-1.5 border border-[#263346]">
        <button
          type="button"
          onClick={() => setActiveTab('internal')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'internal'
              ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20'
              : 'text-slate-400 hover:text-white hover:bg-[#263346]/40'
          }`}
        >
          <ArrowLeftRight size={16} />
          <span>{t('myVaults')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('p2p')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'p2p'
              ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20'
              : 'text-slate-400 hover:text-white hover:bg-[#263346]/40'
          }`}
        >
          <UserCheck size={16} />
          <span>{t('payUser')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('international')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === 'international'
              ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20'
              : 'text-slate-400 hover:text-white hover:bg-[#263346]/40'
          }`}
        >
          <Globe size={16} />
          <span>{t('wireTransfer')}</span>
        </button>
      </div>

      {/* Render Active Tab 📝 */}
      {activeTab === 'internal' && (
        <InternalTransferForm vaults={vaults} userId={userId} rates={rates} />
      )}
      {activeTab === 'p2p' && <P2PTransferForm vaults={vaults} userId={userId} />}
      {activeTab === 'international' && <InternationalWireForm vaults={vaults} />}
    </div>
  );
}