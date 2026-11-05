// app/[locale]/(dashboard)/dashboard/settings/pin/page.tsx
'use client';

import { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { setupUserPin } from '@/actions/pin';
import Link from 'next/link';

export default function SetTransactionPinPage() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setErrorMessage('PIN must be a 4-digit numeric code.');
      setIsSubmitting(false);
      return;
    }

    if (pin !== confirmPin) {
      setErrorMessage('PINs do not match. Please re-enter.');
      setIsSubmitting(false);
      return;
    }

    const result = await setupUserPin(pin);

    if (result.success) {
      setSuccessMessage(result.message || 'Transaction PIN configured successfully.');
      setPin('');
      setConfirmPin('');
    } else {
      setErrorMessage(result.error || 'Failed to configure PIN.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Back Link */}
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={16} /> Back to Settings
      </Link>

      {/* Header Card */}
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Transaction PIN</h1>
            <p className="text-xs text-slate-400 mt-1">
              Set a secure 4-digit code required to authorize all internal and international money transfers.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* New PIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={14} className="text-[#8B5CF6]" /> New 4-Digit PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              required
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-center text-xl tracking-[1em] text-white font-mono focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          {/* Confirm PIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={14} className="text-[#8B5CF6]" /> Confirm 4-Digit PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              required
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-center text-xl tracking-[1em] text-white font-mono focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#8B5CF6]/20 transition duration-200 text-xs uppercase tracking-wider"
          >
            {isSubmitting ? 'Saving PIN...' : 'Save Transaction PIN'}
          </button>
        </form>
      </div>

    </div>
  );
}