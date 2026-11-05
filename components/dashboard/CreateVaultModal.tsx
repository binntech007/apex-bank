'use client';

import { useState } from 'react';
import { createNewVault } from '@/actions/vaults';
import { Wallet, X, CheckCircle2, AlertCircle, Loader2, Plus } from 'lucide-react';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const AVAILABLE_CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
];

export function CreateVaultModal({ isOpen, onClose, userId }: CreateVaultModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const res = await createNewVault(userId, selectedCurrency);
    setLoading(false);

    if (res.success) {
      setStatus({
        type: 'success',
        message: `${selectedCurrency} Vault created successfully!`,
      });
      setTimeout(() => {
        setStatus(null);
        onClose();
      }, 1200);
    } else {
      setStatus({ type: 'error', message: res.error || 'Could not create vault.' });
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

        {/* Modal Header 🏦 */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wallet size={22} className="text-[#8B5CF6]" /> Open New Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a currency to create a dedicated multi-currency vault
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Currency Selection 💱 */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Select Currency
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
              {AVAILABLE_CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCurrency(c.code)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                    selectedCurrency === c.code
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-white font-semibold'
                      : 'border-[#263346] bg-[#0B0F17] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[#A78BFA] font-bold">{c.symbol}</span>
                    <span>{c.name} ({c.code})</span>
                  </span>
                  {selectedCurrency === c.code && <CheckCircle2 size={16} className="text-[#8B5CF6]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Status Message 🔔 */}
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
            className="w-full py-3 rounded-xl bg-[#8B5CF6] text-white font-semibold text-xs hover:bg-[#7C3AED] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            <span>Create Vault</span>
          </button>
        </form>
      </div>
    </div>
  );
}