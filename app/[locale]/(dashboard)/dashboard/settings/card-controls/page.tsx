'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  ArrowLeft, 
  CreditCard, 
  Snowflake, 
  Globe, 
  Landmark, 
  ShoppingBag, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { getCardControls, updateCardSetting, updateCardLimit } from '@/actions/card-controls';

interface CardData {
  id: string;
  type: 'metal' | 'virtual';
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  status: 'active' | 'frozen';
  spendLimit: string;
  spentThisMonth: string;
  isInternationalEnabled: boolean;
  isAtmEnabled: boolean;
  isOnlineEnabled: boolean;
}

export default function CardControlsPage() {
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  
  // Spend limit form state
  const [newLimit, setNewLimit] = useState('');
  const [limitMsg, setLimitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

  const t = useTranslations('CardControlsPage');

  useEffect(() => {
    async function loadCard() {
      setLoading(true);
      // Automatically fetches the user's first available card 🔍
      const res = await getCardControls(); 
      if (res.success && res.card) {
        setCard(res.card as CardData);
        setNewLimit(res.card.spendLimit);
      } else {
        setError(res.error || t('errors.loadFailed'));
      }
      setLoading(false);
    }
    loadCard();
  }, [t]);

  // Handle toggle updates (status, international, ATM, online) 🎛️
  const handleToggle = async (
    field: 'status' | 'isInternationalEnabled' | 'isAtmEnabled' | 'isOnlineEnabled',
    newValue: boolean | 'active' | 'frozen'
  ) => {
    if (!card) return;
    setUpdatingField(field);

    const res = await updateCardSetting(card.id, field, newValue);
    if (res.success) {
      setCard((prev) => (prev ? { ...prev, [field]: newValue } : null));
    }
    setUpdatingField(null);
  };

  // Handle spending limit update 💰
  const handleLimitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    setLimitMsg(null);
    setIsUpdatingLimit(true);

    const res = await updateCardLimit(card.id, newLimit);
    if (res.success) {
      setCard((prev) => (prev ? { ...prev, spendLimit: newLimit } : null));
      setLimitMsg({ type: 'success', text: t('success.limitUpdated') });
    } else {
      setLimitMsg({ type: 'error', text: res.error || t('errors.limitFailed') });
    }

    setIsUpdatingLimit(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-100 text-slate-400 gap-2">
        <Loader2 size={20} className="animate-spin text-[#8B5CF6]" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Link 
          href="/dashboard/settings" 
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={16} />
          <span>{t('backToSettings')}</span>
        </Link>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error || t('errors.notFound')}</span>
        </div>
      </div>
    );
  }

  const isFrozen = card.status === 'frozen';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Navigation 🔙 */}
      <Link 
        href="/dashboard/settings" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        <span>{t('backToSettings')}</span>
      </Link>

      {/* Header 💳 */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {t('title')} 💳
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Card Preview Banner 🎴 */}
      <div className={`p-6 rounded-2xl border transition shadow-xl relative overflow-hidden ${
        isFrozen 
          ? 'bg-[#1C1F2E] border-cyan-500/30' 
          : 'bg-linear-to-r from-[#1B2433] to-[#151C28] border-[#263346]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${
              isFrozen 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20'
            }`}>
              {isFrozen ? <Snowflake size={28} /> : <CreditCard size={28} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white uppercase tracking-wide">
                  {card.type === 'metal' ? t('cardTypes.metal') : t('cardTypes.virtual')} {t('cardTypes.suffix')}
                </h2>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  isFrozen 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isFrozen ? t('status.frozen') : t('status.active')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                •••• •••• •••• {card.cardNumber.slice(-4) || '4242'}
              </p>
            </div>
          </div>

          {/* Quick Freeze Button 🧊 */}
          <button
            type="button"
            onClick={() => handleToggle('status', isFrozen ? 'active' : 'frozen')}
            disabled={updatingField === 'status'}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border shrink-0 ${
              isFrozen 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20'
            }`}
          >
            {updatingField === 'status' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Snowflake size={16} />
            )}
            <span>{isFrozen ? t('buttons.unfreeze') : t('buttons.freeze')}</span>
          </button>
        </div>
      </div>

      {/* Permission Toggles 🎛️ */}
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-5 space-y-4 shadow-md">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t('togglesSectionTitle')}
        </h3>

        <div className="space-y-3">
          {/* International Payments 🌐 */}
          <div className="flex items-center justify-between p-3.5 bg-[#0B0F17] border border-[#263346] rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Globe size={18} />
              </div>
              <div>
                <p className="font-semibold text-white">{t('toggles.international.title')}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{t('toggles.international.desc')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('isInternationalEnabled', !card.isInternationalEnabled)}
              disabled={updatingField === 'isInternationalEnabled'}
              className={`w-12 h-6 rounded-full transition relative p-1 ${
                card.isInternationalEnabled ? 'bg-[#8B5CF6]' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition transform ${
                card.isInternationalEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* ATM Cash Withdrawals 🏧 */}
          <div className="flex items-center justify-between p-3.5 bg-[#0B0F17] border border-[#263346] rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Landmark size={18} />
              </div>
              <div>
                <p className="font-semibold text-white">{t('toggles.atm.title')}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{t('toggles.atm.desc')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('isAtmEnabled', !card.isAtmEnabled)}
              disabled={updatingField === 'isAtmEnabled'}
              className={`w-12 h-6 rounded-full transition relative p-1 ${
                card.isAtmEnabled ? 'bg-[#8B5CF6]' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition transform ${
                card.isAtmEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Online Shopping 🛒 */}
          <div className="flex items-center justify-between p-3.5 bg-[#0B0F17] border border-[#263346] rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="font-semibold text-white">{t('toggles.online.title')}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{t('toggles.online.desc')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('isOnlineEnabled', !card.isOnlineEnabled)}
              disabled={updatingField === 'isOnlineEnabled'}
              className={`w-12 h-6 rounded-full transition relative p-1 ${
                card.isOnlineEnabled ? 'bg-[#8B5CF6]' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition transform ${
                card.isOnlineEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Spending Limit Section 💰 */}
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-5 space-y-4 shadow-md">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t('limitSectionTitle')}
        </h3>

        {limitMsg && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            limitMsg.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {limitMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{limitMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleLimitSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
              {t('limitLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                required
                className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {t('spentThisMonth', { spent: card.spentThisMonth, limit: card.spendLimit })}
            </p>
          </div>

          <button
            type="submit"
            disabled={isUpdatingLimit}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#8B5CF6]/20 flex items-center gap-2"
          >
            {isUpdatingLimit && <Loader2 size={14} className="animate-spin" />}
            <span>{isUpdatingLimit ? t('buttons.updating') : t('buttons.updateLimit')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}