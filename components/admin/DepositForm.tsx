'use client';

import { useState } from 'react';
import { depositUserFunds } from '@/actions/deposit';
import { Landmark, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function DepositForm() {
  const [accountNumber, setAccountNumber] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const numericAmount = parseFloat(amount);
    const res = await depositUserFunds(accountNumber, currency, numericAmount);

    if (res.success) {
      setMessage({ type: 'success', text: res.message || 'Deposit completed!' });
      setAmount('');
    } else {
      setMessage({ type: 'error', text: res.error || 'Deposit failed.' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {/* Account Number Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Target Account Number 🔢</label>
        <input
          type="text"
          required
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="e.g. ACC-100234 or ACC-100234-EUR"
          className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] p-3 text-sm font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
        />
      </div>

      {/* Currency & Amount Selection */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5 col-span-1">
          <label className="text-xs font-semibold text-slate-300">Currency 💱</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] p-3 text-sm font-bold text-white focus:outline-none focus:border-[#8B5CF6]"
          >
            <option value="USD">USD ($)</option>
            <option value="NGN">NGN (₦)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div className="space-y-1.5 col-span-2">
          <label className="text-xs font-semibold text-slate-300">Amount 💵</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] p-3 text-sm font-bold text-white focus:outline-none focus:border-[#8B5CF6]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !accountNumber || !amount}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3.5 font-bold text-white hover:bg-[#7C3AED] transition disabled:opacity-50 shadow-lg shadow-[#8B5CF6]/20"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Processing Deposit...</span>
          </>
        ) : (
          <>
            <Landmark size={18} />
            <span>Credit Account</span>
          </>
        )}
      </button>
    </form>
  );
}