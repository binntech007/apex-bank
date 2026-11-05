'use client';

import { useState } from 'react';
import { VaultCard } from '@/components/dashboard/VaultCard';
import { CreateVaultModal } from '@/components/dashboard/CreateVaultModal';
import { useTranslations } from 'next-intl';
import { Plus, Wallet } from 'lucide-react';

interface Vault {
  id: string;
  accountNumber: string;
  name: string;
  currency: string;
  balance: string;
  numericBalance: number;
}

interface VaultSectionProps {
  userId: string;
  vaults: Vault[];
}

export function VaultSection({ userId, vaults }: VaultSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations('VaultSection');

  return (
    <div className="space-y-4">
      {/* Section Title 🏷️ */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Wallet size={20} className="text-[#8B5CF6]" /> {t('title')}
        </h2>
        <span className="text-xs text-slate-400 font-medium">
          {t('activeVaultsCount', { count: vaults.length })}
        </span>
      </div>

      {/* Vault Cards Grid 🏦 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vaults.map((vault) => (
          <VaultCard key={vault.id} {...vault} />
        ))}

        {/* Open New Vault Trigger Card ➕ */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center p-5 rounded-2xl border border-dashed border-[#263346] bg-[#151C28]/40 text-slate-400 hover:border-[#8B5CF6]/60 hover:text-[#A78BFA] transition group min-h-30 w-full text-left"
        >
          <div className="h-9 w-9 rounded-full bg-[#263346] group-hover:bg-[#8B5CF6]/20 flex items-center justify-center mb-2 transition">
            <Plus size={18} className="text-slate-300 group-hover:text-[#A78BFA]" />
          </div>
          <span className="text-xs font-semibold">{t('openNewVault')}</span>
        </button>
      </div>

      {/* Pop-up Modal 🪟 */}
      <CreateVaultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />
    </div>
  );
}