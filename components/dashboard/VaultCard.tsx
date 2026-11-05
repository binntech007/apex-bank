// components/dashboard/VaultCard.tsx
import React from 'react';

interface VaultCardProps {
  id: string;
  accountNumber: string;
  name: string;
  currency: string;
  numericBalance: number;
}

function formatCurrency(amount: number, currency: string) {
  const symbolMap: Record<string, string> = {
    USD: '$',
    NGN: '₦',
    EUR: '€',
    GBP: '£',
    ZAR: 'R',  // ✨ Added South African Rand symbol
    CAD: 'CAD $', // ✨ Added CAD symbol for consistency
  };
  const symbol = symbolMap[currency] || '$';
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function VaultCard({
  accountNumber,
  name,
  currency,
  numericBalance,
}: VaultCardProps) {
  return (
    <div className="rounded-2xl border border-[#263346] bg-[#151C28] p-5 shadow-sm hover:border-[#8B5CF6]/40 transition flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA] text-xs font-bold border border-[#8B5CF6]/30">
          {currency}
        </span>
        <span className="text-xs font-mono text-slate-400 font-semibold">
          ••• {accountNumber.slice(-4)}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-extrabold tracking-tight text-white">
          {formatCurrency(numericBalance, currency)}
        </p>
        <p className="text-xs text-slate-400 font-medium">{name}</p>
      </div>
    </div>
  );
}