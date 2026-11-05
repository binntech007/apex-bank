// components/dashboard/DepositForm.tsx
'use client';

import { useState } from 'react';
import { Building2, ShieldCheck, Copy, Check } from 'lucide-react';

interface Vault {
  id: string;
  name: string;
  currency: string;
  accountNumber: string;
  balance: string | number;
}

export function DepositForm({ vaults, userId }: { vaults: Vault[]; userId: string }) {
  const [selectedVaultId, setSelectedVaultId] = useState(vaults[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [senderName, setSenderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false); // 📋 State for copy feedback

  const activeVault = vaults.find((v) => v.id === selectedVaultId) || vaults[0];
  const displayAccountNumber = activeVault?.accountNumber || vaults[0]?.accountNumber || 'ACC-99823411';

  // 📋 Copy function handler
  const handleCopy = () => {
    navigator.clipboard.writeText(displayAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Handle submission logic here
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column: Wire Instructions with Copy Button */}
      <div className="md:col-span-1 space-y-4">
        <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#263346]">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Building2 size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Wire Instructions</h3>
              <p className="text-[10px] text-slate-400">Assigned Partner Bank</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Bank Name</span>
              <span className="font-medium text-slate-200">Apex Global Trust Bank</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Account Number ({activeVault?.currency} Vault)
              </span>
              <div className="flex items-center justify-between bg-[#0B0F17] border border-[#263346] rounded-xl px-3 py-2 mt-1">
                {/* Account Number Display */}
                <span className="font-mono text-white font-bold tracking-wider">{displayAccountNumber}</span>
                
                {/* 📋 Interactive Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-[#151C28] hover:bg-[#263346] text-slate-300 hover:text-white transition flex items-center gap-1 text-[10px]"
                  title="Copy account number"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Routing / SWIFT Code</span>
              <span className="font-mono text-slate-200">APEXUS33XXX</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#263346] flex items-center gap-2 text-[11px] text-amber-400">
            <ShieldCheck size={14} />
            <span>Inbound wires reflect within 1 business day.</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="md:col-span-2 bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Vault</label>
            <select
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.name} ({vault.currency}) — Acc: {vault.accountNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deposit Amount ({activeVault?.currency})</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Sender Name / Reference</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. John Doe Wire"
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {message && <p className="text-xs text-emerald-400">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition shadow-lg"
          >
            {loading ? 'Processing...' : 'Confirm & Submit Deposit'}
          </button>
        </form>
      </div>
    </div>
  );
}