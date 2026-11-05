'use client';

import { useState, useEffect } from 'react';
import { executeCurrencySwap } from '@/actions/swap';
import { RefreshCw, ArrowDown, CheckCircle, AlertCircle } from 'lucide-react';

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  rateToUsd: string;
}

interface Vault {
  id: string;
  currency: string;
  balance: string;
  name: string;
}

interface SwapFormProps {
  userId: string;
  vaults: Vault[];
  activeCurrencies: CurrencyOption[];
}

export function SwapForm({ userId, vaults, activeCurrencies }: SwapFormProps) {
  // Default to user's first vault or first currency
  const [selectedVaultId, setSelectedVaultId] = useState(vaults[0]?.id || '');
  const [toCurrency, setToCurrency] = useState(
    activeCurrencies.find((c) => c.code !== vaults[0]?.currency)?.code || 'EUR'
  );
  const [amount, setAmount] = useState('');
  const [convertedEstimate, setConvertedEstimate] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Find currently selected source vault
  const currentVault = vaults.find((v) => v.id === selectedVaultId) || vaults[0];

  // 🧮 Recalculate estimated conversion amount when inputs change
  useEffect(() => {
    const fromCurr = activeCurrencies.find((c) => c.code === currentVault?.currency);
    const toCurr = activeCurrencies.find((c) => c.code === toCurrency);

    if (fromCurr && toCurr && amount && !isNaN(parseFloat(amount))) {
      const fromRate = parseFloat(fromCurr.rateToUsd);
      const toRate = parseFloat(toCurr.rateToUsd);
      const numVal = parseFloat(amount);
      const est = (numVal / fromRate) * toRate;
      setConvertedEstimate(est.toFixed(2));
    } else {
      setConvertedEstimate('0.00');
    }
  }, [amount, currentVault, toCurrency, activeCurrencies]);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!currentVault?.id) {
      setMessage({ type: 'error', text: 'Please select a valid source vault.' });
      setLoading(false);
      return;
    }

    // ⚡ Call backend action using the required object format
    const res = await executeCurrencySwap({
      userId,
      fromAccountId: currentVault.id,
      toCurrency,
      fromAmount: amount,
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: `Swapped ${amount} ${currentVault.currency} into ${res.convertedAmount} ${res.targetCurrency}!`,
      });
      setAmount('');
    } else {
      setMessage({ type: 'error', text: res.error || 'Swap failed.' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSwap} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
            message.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* You Pay Section 💳 */}
      <div className="rounded-xl border border-[#263346] bg-[#0B0F17] p-4 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>You Pay</span>
          <span>Source Vault</span>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none"
          />
          <select
            value={selectedVaultId}
            onChange={(e) => setSelectedVaultId(e.target.value)}
            className="rounded-lg border border-[#263346] bg-[#151C28] px-3 py-2 text-sm font-bold text-white focus:outline-none"
          >
            {vaults.map((v) => (
              <option key={v.id} value={v.id}>
                {v.currency} (${parseFloat(v.balance).toFixed(2)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center -my-3 relative z-10">
        <div className="h-9 w-9 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white shadow-lg">
          <ArrowDown size={18} />
        </div>
      </div>

      {/* You Receive Section 🎯 */}
      <div className="rounded-xl border border-[#263346] bg-[#0B0F17] p-4 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>You Receive (Estimated)</span>
          <span>Target Currency</span>
        </div>
        <div className="flex gap-3 items-center">
          <div className="w-full text-2xl font-bold text-[#A78BFA]">{convertedEstimate}</div>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="rounded-lg border border-[#263346] bg-[#151C28] px-3 py-2 text-sm font-bold text-white focus:outline-none"
          >
            {activeCurrencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !amount}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3.5 font-bold text-white hover:bg-[#7C3AED] transition disabled:opacity-50 shadow-lg shadow-[#8B5CF6]/20"
      >
        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Executing Swap...' : 'Confirm Instant Swap'}
      </button>
    </form>
  );
}