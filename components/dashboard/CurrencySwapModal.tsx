'use client';

import { useState } from 'react';
import { executeCurrencySwap } from '@/actions/swap';
import { RefreshCw, X, CheckCircle2, AlertCircle, Loader2, ArrowRightLeft } from 'lucide-react';

interface Vault {
  id: string;
  name: string;
  currency: string;
  balance: string;
}

interface CurrencySwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  vaults: Vault[];
}

const TARGET_CURRENCIES = ['EUR', 'GBP', 'USD', 'CAD', 'JPY'];

export function CurrencySwapModal({ isOpen, onClose, userId, vaults }: CurrencySwapModalProps) {
  const [fromAccountId, setFromAccountId] = useState(vaults[0]?.id || '');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const selectedVault = vaults.find((v) => v.id === fromAccountId) || vaults[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }

    setLoading(true);
    const res = await executeCurrencySwap({
      userId,
      fromAccountId: selectedVault?.id || '',
      toCurrency,
      fromAmount: amount,
    });
    setLoading(false);

    if (res.success) {
      setStatus({
        type: 'success',
        message: `Swapped ${amount} ${selectedVault?.currency} into ${res.convertedAmount} ${res.targetCurrency}!`,
      });
      setAmount('');
      setTimeout(() => {
        setStatus(null);
        onClose();
      }, 1500);
    } else {
      setStatus({ type: 'error', message: res.error || 'Swap failed.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#263346] bg-[#151C28] p-6 shadow-2xl relative space-y-6 text-white">
        {/* Close Button ✖️ */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* Modal Header 💱 */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <RefreshCw size={22} className="text-[#8B5CF6]" /> Instant Currency Swap
          </h2>
          <p className="text-xs text-slate-400 mt-1">Convert funds between your multi-currency vaults</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source Vault Selection 🏦 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">From Vault</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-4 py-2.5 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
            >
              {vaults.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.currency}) — Balance: {parseFloat(v.balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Target Currency Selection 🎯 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">To Currency</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-4 py-2.5 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
            >
              {TARGET_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c} Vault
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input 💵 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Amount to Swap ({selectedVault?.currency || 'USD'})
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          {/* Status Feedback 🔔 */}
          {status && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{status.message}</span>
            </div>
          )}

          {/* Submit Button 🚀 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#8B5CF6] text-white font-semibold text-xs hover:bg-[#7C3AED] transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRightLeft size={16} />}
            <span>Confirm & Swap</span>
          </button>
        </form>
      </div>
    </div>
  );
}