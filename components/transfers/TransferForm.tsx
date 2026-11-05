// components/transfers/TransferForm.tsx
'use client';

import { useState } from 'react';
import { executeInternalTransfer } from '@/actions/transfers';
import { Send, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';

interface Vault {
  id: string;
  name: string;
  currency: string;
  balance: string;
  accountNumber: string;
}

interface TransferFormProps {
  userId: string;
  userVaults: Vault[];
}

export function TransferForm({ userId, userVaults }: TransferFormProps) {
  const [selectedVaultId, setSelectedVaultId] = useState(userVaults[0]?.id || '');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState(''); // 🔐 Secret transaction PIN state

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid transfer amount.' });
      return;
    }

    if (!pin || pin.length !== 4) {
      setStatus({ type: 'error', message: 'Please enter your 4-digit transaction PIN.' });
      return;
    }

    setLoading(true);

    const res = await executeInternalTransfer({
      senderUserId: userId,
      senderAccountId: selectedVaultId,
      recipientAccountNumber: recipientAccount.trim(),
      amount: numAmount,
      description: description.trim() || 'Internal Ledger Transfer',
      pin, // 🔐 Pass the transaction PIN
    });

    setLoading(false);

    if ('message' in res && res.message) {
      setStatus({ type: 'success', message: res.message });
      setAmount('');
      setRecipientAccount('');
      setDescription('');
      setPin(''); // Reset PIN on success
    } else if ('error' in res && res.error) {
      setStatus({ type: 'error', message: res.error });
    } else {
      setStatus({ type: 'error', message: 'An unexpected transfer error occurred.' });
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-[#151C28] border border-[#263346] rounded-2xl shadow-xl text-white">
      <div className="flex items-center gap-2 mb-6">
        <Send className="text-[#8B5CF6]" size={24} />
        <h2 className="text-xl font-bold">Transfer Money</h2>
      </div>

      {status && (
        <div
          className={`p-3.5 mb-5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Source Vault Selection 🏦 */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">From Vault</label>
          <select
            value={selectedVaultId}
            onChange={(e) => setSelectedVaultId(e.target.value)}
            className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
          >
            {userVaults.map((vault) => (
              <option key={vault.id} value={vault.id}>
                {vault.name} ({vault.currency}) — ${parseFloat(vault.balance).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {/* Recipient Account Number 🎯 */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Recipient Account Number</label>
          <input
            type="text"
            placeholder="e.g. 8492019482"
            value={recipientAccount}
            onChange={(e) => setRecipientAccount(e.target.value)}
            required
            className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>

        {/* Amount 💰 */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Amount</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-[#8B5CF6] focus:outline-none font-mono"
          />
        </div>

        {/* Description 📝 */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Note / Description (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Lunch reimbursement"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>

        {/* 🔐 Transaction PIN Field */}
        <div>
          <label className="block text-slate-400 mb-1 font-semibold flex items-center gap-1.5">
            <Lock size={13} className="text-[#8B5CF6]" /> Transaction PIN 🔐
          </label>
          <input
            type="password"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            required
            className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-3.5 py-2.5 text-center text-base tracking-widest text-white placeholder-slate-600 focus:border-[#8B5CF6] focus:outline-none font-mono"
          />
        </div>

        {/* Submit Button 🚀 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] transition text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Processing...
            </>
          ) : (
            'Send Funds'
          )}
        </button>
      </form>
    </div>
  );
}