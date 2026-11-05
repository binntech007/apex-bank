'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Globe, 
  Download, 
  Lock, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { getTaxProfile, updateTaxProfile } from '@/actions/tax';

export default function TaxSettingsPage() {
  const [taxResidency, setTaxResidency] = useState('United States');
  const [tin, setTin] = useState('');
  const [fatcaStatus, setFatcaStatus] = useState('Exempt');
  const [isUsPerson, setIsUsPerson] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const t = useTranslations('TaxSettingsPage');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const res = await getTaxProfile();
      if (res.success && res.profile) {
        setTaxResidency(res.profile.taxResidency);
        setTin(res.profile.tin);
        setFatcaStatus(res.profile.fatcaStatus);
        setIsUsPerson(res.profile.isUsPerson);
      } else {
        setMsg({ type: 'error', text: res.error || t('errors.loadFailed') });
      }
      setLoading(false);
    }
    loadProfile();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);

    const res = await updateTaxProfile({
      taxResidency,
      tin,
      fatcaStatus,
      isUsPerson,
    });

    if (res.success) {
      setMsg({ type: 'success', text: t('success.profileUpdated') });
    } else {
      setMsg({ type: 'error', text: res.error || t('errors.updateFailed') });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-100 text-slate-400 gap-2">
        <Loader2 size={20} className="animate-spin text-[#8B5CF6]" />
        <span className="text-sm">{t('loading')}</span>
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
        <span>{t('backToSettings')}</span>
      </Link>

      {/* Header 📄 */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {t('title')} 📄
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Feedback Alert 🔔 */}
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

      {/* Tax Profile Form 📝 */}
      <form onSubmit={handleSubmit} className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-6 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#8B5CF6]" />
          {t('form.sectionTitle')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Tax Residency Country 🌐 */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">{t('form.residencyLabel')}</label>
            <div className="relative">
              <select
                value={taxResidency}
                onChange={(e) => setTaxResidency(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="United States">United States 🇺🇸</option>
                <option value="United Kingdom">United Kingdom 🇬🇧</option>
                <option value="Canada">Canada 🇨🇦</option>
                <option value="Switzerland">Switzerland 🇨🇭</option>
                <option value="Singapore">Singapore 🇸🇬</option>
                <option value="Germany">Germany 🇩🇪</option>
              </select>
            </div>
          </div>

          {/* Tax Identification Number 🔐 */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">{t('form.tinLabel')}</label>
            <div className="relative">
              <input
                type="text"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                placeholder="***-**-****"
                className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6] font-mono"
              />
              <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
            <p className="text-[10px] text-slate-500">{t('form.tinSub')}</p>
          </div>

          {/* FATCA Status 📋 */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">{t('form.fatcaLabel')}</label>
            <select
              value={fatcaStatus}
              onChange={(e) => setFatcaStatus(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="Exempt">{t('form.fatcaOptions.exempt')}</option>
              <option value="Active NFFE">{t('form.fatcaOptions.activeNffe')}</option>
              <option value="Passive NFFE">{t('form.fatcaOptions.passiveNffe')}</option>
              <option value="Participating FFI">{t('form.fatcaOptions.participatingFfi')}</option>
            </select>
          </div>

          {/* US Tax Person Status 🇺🇸 */}
          <div className="space-y-1.5 flex flex-col justify-center">
            <label className="text-slate-300 font-semibold block mb-2">{t('form.usStatusLabel')}</label>
            <button
              type="button"
              onClick={() => setIsUsPerson(!isUsPerson)}
              className="flex items-center justify-between p-2.5 bg-[#0B0F17] border border-[#263346] rounded-xl"
            >
              <span className="text-slate-300">{t('form.usPersonToggle')}</span>
              <div className={`w-10 h-5 rounded-full transition relative p-0.5 ${
                isUsPerson ? 'bg-[#8B5CF6]' : 'bg-slate-800'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white transition transform ${
                  isUsPerson ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#263346] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-[#8B5CF6]/20 flex items-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            <span>{saving ? t('form.saving') : t('form.saveButton')}</span>
          </button>
        </div>
      </form>

      {/* Tax Documents Download Section 📥 */}
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <FileText size={16} className="text-[#8B5CF6]" />
          {t('documents.sectionTitle')}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-[#0B0F17] border border-[#263346] rounded-xl text-xs">
            <div>
              <p className="font-semibold text-white">{t('documents.form1099.title')}</p>
              <p className="text-slate-500 text-[11px]">{t('documents.form1099.meta')}</p>
            </div>
            <button 
              type="button"
              className="px-3 py-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/20 transition flex items-center gap-1.5 font-semibold text-[11px]"
            >
              <Download size={14} />
              <span>{t('documents.downloadBtn')}</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#0B0F17] border border-[#263346] rounded-xl text-xs">
            <div>
              <p className="font-semibold text-white">{t('documents.portfolioSummary.title')}</p>
              <p className="text-slate-500 text-[11px]">{t('documents.portfolioSummary.meta')}</p>
            </div>
            <button 
              type="button"
              className="px-3 py-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/20 transition flex items-center gap-1.5 font-semibold text-[11px]"
            >
              <Download size={14} />
              <span>{t('documents.downloadBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}