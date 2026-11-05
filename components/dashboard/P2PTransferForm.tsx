// components/dashboard/P2PTransferForm.tsx
'use client';

import { useState } from 'react';
import { UserCheck, Send, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Lock } from 'lucide-react';
import Link from 'next/link';
import { executeInternalTransfer } from '@/actions/transfers';

interface Vault {
  id: string;
  name: string;
  currency: string;
  balance: string;
}

interface P2PTransferFormProps {
  vaults: Vault[];
  userId: string;
}

export function P2PTransferForm({ vaults, userId }: P2PTransferFormProps) {
  const [selectedVaultId, setSelectedVaultId] = useState(vaults[0]?.id || '');
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState(''); // 🔐 Secret transaction PIN state

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ message: string; ledgerLineId: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessData(null);
    setErrorMessage('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid transfer amount.');
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
      senderAccountId: selectedVaultId,
      recipientAccountNumber,
      amount: parsedAmount,
      description: description || 'P2P Transfer',
      pin, // 🔐 Pass transaction PIN
    });

    if (result.success) {
      setSuccessData({
        message: result.message,
        ledgerLineId: result.ledgerLineId,
      });
      setRecipientAccountNumber('');
      setAmount('');
      setDescription('');
      setPin(''); // Reset PIN on success
    } else {
      setErrorMessage(result.error);
    }

    setIsSubmitting(false);
  };

  if (successData) {
    return (
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-5 shadow-xl max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Transfer Successful 🧾</h3>
          <p className="text-xs text-slate-400 mt-1">{successData.message}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/dashboard/transactions/${successData.ledgerLineId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-xl transition shadow-lg shadow-[#8B5CF6]/20"
          >
            <ExternalLink size={16} />
            <span>View Official Receipt</span>
          </Link>
          <button
            type="button"
            onClick={() => setSuccessData(null)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0B0F17] border border-[#263346] hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition"
          >
            <RefreshCw size={16} />
            <span>Make Another Transfer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-5 shadow-xl max-w-2xl mx-auto"
    >
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCheck className="text-[#8B5CF6]" size={22} />
          Pay Another User
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Send funds instantly to any user using their account number.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {/* Source Vault 🏦 */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          From Vault
        </label>
        <select
          value={selectedVaultId}
          onChange={(e) => setSelectedVaultId(e.target.value)}
          className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-[#8B5CF6]"
        >
          {vaults.map((vault) => (
            <option key={vault.id} value={vault.id}>
              {vault.name} ({vault.currency}) - Balance: {vault.currency} {vault.balance}
            </option>
          ))}
        </select>
      </div>

      {/* Recipient Account Number 👤 */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Recipient Account Number
        </label>
        <input
          type="text"
          value={recipientAccountNumber}
          onChange={(e) => setRecipientAccountNumber(e.target.value)}
          placeholder="e.g. ACC-10928374"
          required
          className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
        />
      </div>

      {/* Amount 💰 */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Amount
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

      {/* Description / Note 📝 */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Note / Description (Optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Dinner reimbursement"
          className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
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
        <p className="text-[11px] text-slate-500">Enter your 4-digit secret transfer PIN to authorize this payment.</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#8B5CF6]/20 transition duration-200"
      >
        <Send size={18} />
        {isSubmitting ? 'Sending Payment...' : 'Send Payment'}
      </button>
    </form>
  );
}