// components/dashboard/InternalTransferForm.tsx
'use client';

import { useState, useMemo } from 'react';
import { ArrowLeftRight, Send, CheckCircle2, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { executeInternalTransfer } from '@/actions/transfers';
import { useTranslations } from 'next-intl';

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

interface InternalTransferFormProps {
  vaults: Vault[];
  userId: string;
  rates?: ExchangeRate[];
}

export function InternalTransferForm({ vaults, userId, rates = [] }: InternalTransferFormProps) {
  const [sourceVaultId, setSourceVaultId] = useState(vaults[0]?.id || '');
  const [targetVaultId, setTargetVaultId] = useState(vaults[1]?.id || vaults[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState(''); // 🔐 Secret transaction PIN state

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const t = useTranslations('InternalTransferForm');

  // Find source and target vaults 🏦
  const sourceVault = vaults.find((v) => v.id === sourceVaultId);
  const targetVault = vaults.find((v) => v.id === targetVaultId);

  // Determine current rate 📈
  const currentRate = useMemo(() => {
    if (!sourceVault || !targetVault) return 1;
    if (sourceVault.currency === targetVault.currency) return 1;

    const match = rates.find(
      (r) => r.fromCurrency === sourceVault.currency && r.toCurrency === targetVault.currency
    );

    return match ? parseFloat(match.rate) : null;
  }, [sourceVault, targetVault, rates]);

  // Calculate live preview amount 🧮
  const numericAmount = parseFloat(amount) || 0;
  const estimatedOutcome = currentRate !== null ? (numericAmount * currentRate).toFixed(2) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (numericAmount <= 0) {
      setErrorMessage(t('errors.invalidAmount'));
      setIsSubmitting(false);
      return;
    }

    if (sourceVaultId === targetVaultId) {
      setErrorMessage(t('errors.sameVault'));
      setIsSubmitting(false);
      return;
    }

    if (!pin || pin.length !== 4) {
      setErrorMessage('Please enter a valid 4-digit transaction PIN.');
      setIsSubmitting(false);
      return;
    }

    const result = await executeInternalTransfer({
      senderUserId: userId,
      senderAccountId: sourceVaultId,
      targetAccountId: targetVaultId,
      amount: numericAmount,
      description: 'Internal Vault Swap',
      pin, // 🔐 Pass the transaction PIN
    });

    if (result.success) {
      setSuccessMessage('message' in result && result.message ? result.message : t('success.swapCompleted'));
      setAmount('');
      setPin(''); // Reset PIN on success
    } else {
      setErrorMessage('error' in result && result.error ? String(result.error) : t('errors.swapFailed'));
    }

    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-5 shadow-xl max-w-2xl mx-auto"
    >
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowLeftRight className="text-[#8B5CF6]" size={22} />
          {t('title')}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t('description')}
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {/* From Vault 🏦 */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          {t('fromVault')}
        </label>
        <select
          value={sourceVaultId}
          onChange={(e) => setSourceVaultId(e.target.value)}
          className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-[#8B5CF6]"
        >
          {vaults.map((vault) => (
            <option key={vault.id} value={vault.id}>
              {vault.name} ({vault.currency}) - {t('balanceLabel')}: {vault.currency} {vault.balance}
            </option>
          ))}
        </select>
      </div>

      {/* To Vault 🎯 */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          {t('toVault')}
        </label>
        <select
          value={targetVaultId}
          onChange={(e) => setTargetVaultId(e.target.value)}
          className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-[#8B5CF6]"
        >
          {vaults.map((vault) => (
            <option key={vault.id} value={vault.id}>
              {vault.name} ({vault.currency}) - {t('balanceLabel')}: {vault.currency} {vault.balance}
            </option>
          ))}
        </select>
      </div>

      {/* Amount 💰 */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          {t('amountToSend')}
        </label>
        <input
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
          className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-[#8B5CF6]"
        />
      </div>

      {/* 🔐 Transaction PIN Input Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Lock size={14} className="text-[#8B5CF6]" /> Transaction PIN 🔐
        </label>
        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="••••"
          required
          className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-center text-lg tracking-widest text-white font-mono focus:outline-none focus:border-[#8B5CF6]"
        />
        <p className="text-[11px] text-slate-500">Enter your 4-digit secret transfer PIN to authorize this swap.</p>
      </div>

      {/* Live Preview Card 💡 */}
      {sourceVault && targetVault && sourceVault.currency !== targetVault.currency && (
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#263346] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <RefreshCw size={12} className="text-[#8B5CF6]" /> {t('exchangeRate')}
            </span>
            <span className="font-semibold text-white">
              {currentRate !== null
                ? `1 ${sourceVault.currency} = ${currentRate} ${targetVault.currency}`
                : t('rateNotSet')}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#151C28]">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              {t('recipientReceives')}
            </span>
            <span className="text-base font-bold text-emerald-400">
              {estimatedOutcome !== null
                ? `${estimatedOutcome} ${targetVault.currency}`
                : 'N/A'}
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || currentRate === null}
        className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#8B5CF6]/20 transition duration-200"
      >
        <Send size={18} />
        {isSubmitting ? t('processing') : t('executeSwap')}
      </button>
    </form>
  );
}