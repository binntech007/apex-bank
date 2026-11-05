'use client';

import { useState, useEffect } from 'react';
import { addFundsToUserAccount } from '@/actions/admin-ledger';
import { DollarSign, X, Loader2, PlusCircle, CheckCircle, Wallet } from 'lucide-react';

interface Vault {
  id: string;
  name: string;
  currency: string;
  accountNumber: string;
  balance: string | number;
}

interface AddFundsModalProps {
  userId: string;
  userName: string;
  vaults: Vault[]; // ✨ 1. Accept the user's vaults array as a prop
  isOpen: boolean;
  onClose: () => void;
}

export function AddFundsModal({ userId, userName, vaults = [], isOpen, onClose }: AddFundsModalProps) {
  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ✨ Auto-select the first vault when the modal opens or vaults change
  useEffect(() => {
    if (vaults && vaults.length > 0) {
      setSelectedVaultId(vaults[0].id);
    }
  }, [vaults]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ✨ Pass vaultId along with userId, amount, and description to your backend action
    const res = await addFundsToUserAccount({ 
      userId, 
      vaultId: selectedVaultId, 
      amount, 
      description 
    });

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        setDescription('');
        onClose();
      }, 1500);
    } else {
      setError(res.error || 'Failed to deposit funds.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#263346] bg-[#151C28] p-6 shadow-2xl space-y-5">
        
        {/* Header 💳 */}
        <div className="flex items-center justify-between border-b border-[#263346] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30">
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Add User Funds</h3>
              <p className="text-xs text-slate-400">Target: <span className="text-white font-semibold">{userName}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#263346]">
            <X size={18} />
          </button>
        </div>

        {/* Alerts 🚨 */}
        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">{error}</div>}
        {success && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2"><CheckCircle size={16}/> Deposit processed successfully!</div>}

        {/* Form 📝 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ✨ Vault Selection Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Wallet size={14} className="text-[#8B5CF6]" /> Target Vault Account
            </label>
            <select
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
              className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-4 py-3 text-white focus:border-[#8B5CF6] focus:outline-none text-xs"
              required
            >
              {vaults.length > 0 ? (
                vaults.map((vault) => (
                  <option key={vault.id} value={vault.id}>
                    {vault.name} ({vault.currency}) — Acc: {vault.accountNumber}
                  </option>
                ))
              ) : (
                <option value="" disabled>No vaults available for this user</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500.00"
                className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:border-[#8B5CF6] focus:outline-none text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Reference / Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Wire Deposit Correction"
              className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-4 py-3 text-white placeholder-slate-600 focus:border-[#8B5CF6] focus:outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success || vaults.length === 0}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3 font-bold text-white hover:bg-[#7C3AED] transition disabled:opacity-50 shadow-lg shadow-[#8B5CF6]/20 text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Confirm Deposit</span>}
          </button>
        </form>
      </div>
    </div>
  );
}