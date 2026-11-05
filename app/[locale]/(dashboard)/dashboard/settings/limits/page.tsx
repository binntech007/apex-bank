'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { getUserLimits, updateUserLimits } from '@/actions/limits';

export default function LimitsPage() {
  const [dailyLimit, setDailyLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [singleTxLimit, setSingleTxLimit] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadLimits() {
      setLoading(true);
      const res = await getUserLimits();
      if (res.success && res.limits) {
        setDailyLimit(res.limits.dailyLimit);
        setMonthlyLimit(res.limits.monthlyLimit);
        setSingleTxLimit(res.limits.singleTxLimit);
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to load transfer limits.' });
      }
      setLoading(false);
    }
    loadLimits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const single = parseFloat(singleTxLimit);
    const daily = parseFloat(dailyLimit);
    const monthly = parseFloat(monthlyLimit);

    // Frontend Logical Validation 🛡️
    if (single > daily) {
      setMsg({ type: 'error', text: 'Single transaction limit cannot exceed daily limit.' });
      return;
    }

    if (daily > monthly) {
      setMsg({ type: 'error', text: 'Daily limit cannot exceed monthly limit.' });
      return;
    }

    setSaving(true);
    const res = await updateUserLimits({
      dailyLimit,
      monthlyLimit,
      singleTxLimit,
    });

    if (res.success) {
      setMsg({ type: 'success', text: 'Transfer limits updated successfully!' });
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to update limits.' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-100 text-slate-400 gap-2">
        <Loader2 size={20} className="animate-spin text-[#8B5CF6]" />
        <span className="text-sm">Loading limit settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Navigation 🔙 */}
      <Link 
        href="/dashboard/settings" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        <span>Back to Settings</span>
      </Link>

      {/* Header 📊 */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Spending & Transfer Limits 📊
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure maximum transfer thresholds to protect your wealth vault.
        </p>
      </div>

      {/* Info Banner 🛡️ */}
      <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck size={20} className="text-[#8B5CF6] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white">Security Protection</p>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Any transfer exceeding these limits will require secondary multi-factor authentication or manual compliance review.
          </p>
        </div>
      </div>

      {/* Feedback Message 🔔 */}
      {msg && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
          msg.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Limits Form 📝 */}
      <form onSubmit={handleSubmit} className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Single Transaction Limit ⚡ */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Single Transaction
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={singleTxLimit}
                onChange={(e) => setSingleTxLimit(e.target.value)}
                required
                className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <p className="text-[11px] text-slate-400">Max amount allowed per individual transfer.</p>
          </div>

          {/* Daily Transfer Limit ☀️ */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-400" />
              Daily Limit
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                required
                className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <p className="text-[11px] text-slate-400">Max cumulative amount per 24 hours.</p>
          </div>

          {/* Monthly Transfer Limit 📅 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-400" />
              Monthly Limit
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
                className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <p className="text-[11px] text-slate-400">Max cumulative amount per calendar month.</p>
          </div>

        </div>

        <div className="pt-4 border-t border-[#263346] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-[#8B5CF6]/20 flex items-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            <span>Save Limit Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}