'use client';

import { useState, useEffect } from 'react';
import { setExchangeRate, getAllExchangeRates } from '@/actions/admin-rates';
import { RefreshCw, DollarSign, CheckCircle2, AlertCircle, Loader2, Plus, ArrowRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ExchangeRateManagerPage() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rate, setRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [activeRates, setActiveRates] = useState<any[]>([]);
  const [fetchingRates, setFetchingRates] = useState(true);

  const loadRates = async () => {
    setFetchingRates(true);
    const res = await getAllExchangeRates();
    if (res.success) setActiveRates(res.data);
    setFetchingRates(false);
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const fromClean = fromCurrency.trim().toUpperCase();
    const toClean = toCurrency.trim().toUpperCase();

    if (!fromClean || !toClean) {
      setStatus({ type: 'error', message: 'Please provide valid currency codes (e.g. USD, CAD).' });
      return;
    }

    if (fromClean === toClean) {
      setStatus({ type: 'error', message: 'Source and target currencies must be different.' });
      return;
    }

    if (!rate || parseFloat(rate) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid exchange rate greater than 0.' });
      return;
    }

    setLoading(true);
    const res = await setExchangeRate(fromClean, toClean, rate);
    setLoading(false);

    if (res.success) {
      setStatus({ type: 'success', message: `Saved rate: 1 ${fromClean} = ${rate} ${toClean}` });
      setRate('');
      loadRates(); // Refresh active rates table 🔄
    } else {
      setStatus({ type: 'error', message: res.error || 'Failed to save exchange rate.' });
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 min-h-screen bg-[#0B0F17] text-[#E2E8F0]">
      
      {/* Breadcrumb Navigation Back to Settings 🔙 */}
      <div>
        <Link 
          href="/admin/settings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition bg-[#151C28] border border-[#263346] px-3 py-1.5 rounded-xl shadow-sm"
        >
          <ChevronLeft size={14} /> Back to Settings Center
        </Link>
      </div>

      {/* Header ⚙️ */}
      <div className="border-b border-[#263346] pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <RefreshCw className="text-[#A78BFA]" size={32} />
          Currency & Exchange Rate Manager
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Add new currencies and configure conversion rates for user swaps
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form Card 💳 */}
        <div className="rounded-2xl border border-[#263346] bg-[#151C28] p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus size={20} className="text-[#8B5CF6]" /> Add / Update Currency Rate
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Currency Inputs 💱 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  From Currency Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. USD"
                  maxLength={5}
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-4 py-2.5 text-xs text-white uppercase placeholder-slate-500 focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  To Currency Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CAD"
                  maxLength={5}
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-[#263346] bg-[#0B0F17] px-4 py-2.5 text-xs text-white uppercase placeholder-slate-500 focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>

            {/* Rate Input 📊 */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Exchange Rate (1 {fromCurrency || 'SRC'} = ? {toCurrency || 'TGT'})
              </label>
              <input
                type="number"
                step="0.000001"
                placeholder="e.g. 1.35"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
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
              className="w-full py-3 rounded-xl bg-[#8B5CF6] text-white font-semibold text-xs hover:bg-[#7C3AED] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <DollarSign size={16} />}
              <span>Save Exchange Rate</span>
            </button>
          </form>
        </div>

        {/* Active Rates Table 📑 */}
        <div className="rounded-2xl border border-[#263346] bg-[#151C28] p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <RefreshCw size={20} className="text-[#8B5CF6]" /> Active Exchange Rates
          </h2>

          {fetchingRates ? (
            <div className="flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
              <Loader2 className="animate-spin text-[#8B5CF6]" size={16} /> Loading rates...
            </div>
          ) : activeRates.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No exchange rates added yet. Use the form to add one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B0F17] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#263346]">
                  <tr>
                    <th className="px-4 py-3">Pair</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263346]/50">
                  {activeRates.map((r) => (
                    <tr key={r.id} className="hover:bg-[#1C2536]/50 transition">
                      <td className="px-4 py-3 font-semibold text-white flex items-center gap-1.5">
                        <span>{r.fromCurrency}</span>
                        <ArrowRight size={12} className="text-slate-500" />
                        <span>{r.toCurrency}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                        {parseFloat(r.rate).toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-right text-[11px] text-slate-500">
                        {new Date(r.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}