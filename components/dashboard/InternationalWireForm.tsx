// components/dashboard/InternationalWireForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  InternationalWireSchema,
  type InternationalWireInput,
} from '@/lib/validations/transfer';
import { Globe, Building2, User, DollarSign, Send, CheckCircle2, ExternalLink, RefreshCw, Lock } from 'lucide-react';
import Link from 'next/link';

interface Vault {
  id: string;
  name: string;
  currency: string;
  balance: string;
}

interface InternationalWireFormProps {
  vaults: Vault[];
  onSuccess?: () => void;
}

export function InternationalWireForm({ vaults }: InternationalWireFormProps) {
  const [selectedVaultId, setSelectedVaultId] = useState(vaults[0]?.id || '');
  const [pin, setPin] = useState(''); // 🔐 Transaction PIN state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ message: string; ledgerLineId?: string } | null>(null);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InternationalWireInput>({
    resolver: zodResolver(InternationalWireSchema),
  });

  const onSubmit = async (data: InternationalWireInput) => {
    if (!pin || pin.length !== 4) {
      setServerError('Please enter a valid 4-digit transaction PIN.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');
    setSuccessData(null);

    try {
      const response = await fetch('/api/transfers/international', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          sourceAccountId: selectedVaultId,
          pin, // 🔐 Pass transaction PIN
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Wire transfer processing failed');
      }

      setSuccessData({
        message: result.message || 'International wire submitted and is pending review.',
        ledgerLineId: result.ledgerLineId,
      });
      reset();
      setPin(''); // Reset PIN on success
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-5 shadow-xl max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
          <RefreshCw size={28} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Wire Transfer Pending ⏳</h3>
          <p className="text-xs text-slate-400 mt-1">{successData.message}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {successData.ledgerLineId ? (
            <Link
              href={`/dashboard/transactions/${successData.ledgerLineId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-xl transition shadow-lg shadow-[#8B5CF6]/20"
            >
              <ExternalLink size={16} />
              <span>View Official Receipt</span>
            </Link>
          ) : (
            <Link
              href="/dashboard/transactions"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-xl transition shadow-lg shadow-[#8B5CF6]/20"
            >
              <ExternalLink size={16} />
              <span>View Transactions</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setSuccessData(null)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0B0F17] border border-[#263346] hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition"
          >
            <RefreshCw size={16} />
            <span>Send Another Wire</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-6 shadow-xl max-w-2xl mx-auto"
    >
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="text-[#8B5CF6]" size={22} />
          International Wire Transfer
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Execute SWIFT / IBAN cross-border wire transfers securely.
        </p>
      </div>

      {/* Error Notification ⚠️ */}
      {serverError && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-semibold">
          {serverError}
        </div>
      )}

      {/* 1. Source Vault Selection 🏦 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Source Vault
        </label>
        <select
          value={selectedVaultId}
          onChange={(e) => setSelectedVaultId(e.target.value)}
          className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-[#8B5CF6] transition"
        >
          {vaults.map((vault) => (
            <option key={vault.id} value={vault.id}>
              {vault.name} ({vault.currency}) - Balance: {vault.currency} {vault.balance}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Recipient Information 👤 */}
      <div className="space-y-4 pt-2 border-t border-[#263346]">
        <h3 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-2">
          <User size={16} /> Recipient Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Full Legal Name
            </label>
            <input
              {...register('recipientName')}
              placeholder="e.g. Acme Corp Inc."
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
            />
            {errors.recipientName && (
              <p className="text-xs text-red-400 mt-1">{errors.recipientName.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Country
            </label>
            <input
              {...register('recipientCountry')}
              placeholder="e.g. United Kingdom"
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
            />
            {errors.recipientCountry && (
              <p className="text-xs text-red-400 mt-1">{errors.recipientCountry.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Physical Address
          </label>
          <input
            {...register('recipientAddress')}
            placeholder="123 Financial Way, Suite 400"
            className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
          />
          {errors.recipientAddress && (
            <p className="text-xs text-red-400 mt-1">{errors.recipientAddress.message}</p>
          )}
        </div>
      </div>

      {/* 3. Bank Routing Information 🏦 */}
      <div className="space-y-4 pt-2 border-t border-[#263346]">
        <h3 className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider flex items-center gap-2">
          <Building2 size={16} /> Destination Bank Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Bank Name
            </label>
            <input
              {...register('bankName')}
              placeholder="e.g. Barclays Bank PLC"
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
            />
            {errors.bankName && (
              <p className="text-xs text-red-400 mt-1">{errors.bankName.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              SWIFT / BIC Code
            </label>
            <input
              {...register('swiftBic')}
              placeholder="e.g. BARCGB22"
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6] uppercase"
            />
            {errors.swiftBic && (
              <p className="text-xs text-red-400 mt-1">{errors.swiftBic.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            IBAN or Account Number
          </label>
          <input
            {...register('ibanAccountNumber')}
            placeholder="GB82 BARC 2020 1530 0912 34"
            className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
          />
          {errors.ibanAccountNumber && (
            <p className="text-xs text-red-400 mt-1">{errors.ibanAccountNumber.message}</p>
          )}
        </div>
      </div>

      {/* 4. Amount & PIN & Submit 💰 */}
      <div className="pt-2 border-t border-[#263346] space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center gap-1">
            <DollarSign size={14} /> Transfer Amount
          </label>
          <input
            {...register('amount')}
            type="number"
            step="any"
            placeholder="0.00"
            className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-[#8B5CF6]"
          />
          {errors.amount && (
            <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>
          )}
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
          <p className="text-[11px] text-slate-500">Enter your 4-digit secret transfer PIN to authorize this wire.</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#8B5CF6]/20 transition duration-200"
        >
          <Send size={18} />
          {isSubmitting ? 'Processing Wire...' : 'Submit Wire Transfer'}
        </button>
      </div>
    </form>
  );
}