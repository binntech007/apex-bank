'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Trash2, 
  PieChart, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { getBeneficiaries, addBeneficiary, deleteBeneficiary } from '@/actions/beneficiaries';

interface BeneficiaryItem {
  id: string;
  fullName: string;
  email: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'trust' | 'other';
  allocationPercentage: string;
}

export default function BeneficiariesPage() {
  const [list, setList] = useState<BeneficiaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<'spouse' | 'child' | 'parent' | 'sibling' | 'trust' | 'other'>('spouse');
  const [allocation, setAllocation] = useState('');

  const t = useTranslations('BeneficiariesPage');

  const loadData = async () => {
    setLoading(true);
    const res = await getBeneficiaries();
    if (res.success && res.beneficiaries) {
      setList(res.beneficiaries as BeneficiaryItem[]);
    } else {
      setMsg({ type: 'error', text: res.error || t('errors.loadFailed') });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAllocation = list.reduce((acc, curr) => acc + (parseFloat(curr.allocationPercentage) || 0), 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const newAlloc = parseFloat(allocation) || 0;
    if (totalAllocation + newAlloc > 100) {
      setMsg({ 
        type: 'error', 
        text: t('errors.exceedsLimit', { remaining: (100 - totalAllocation).toFixed(2) })
      });
      return;
    }

    setSaving(true);
    const res = await addBeneficiary({
      fullName,
      email,
      relationship,
      allocationPercentage: allocation,
    });

    if (res.success) {
      setMsg({ type: 'success', text: t('success.added') });
      setFullName('');
      setEmail('');
      setAllocation('');
      loadData();
    } else {
      setMsg({ type: 'error', text: res.error || t('errors.addFailed') });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setMsg(null);
    setDeletingId(id);
    const res = await deleteBeneficiary(id);
    if (res.success) {
      setMsg({ type: 'success', text: t('success.removed') });
      loadData();
    } else {
      setMsg({ type: 'error', text: res.error || t('errors.deleteFailed') });
    }
    setDeletingId(null);
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

      {/* Header 📜 */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {t('title')} 📜
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Overview Stat Card 📊 */}
      <div className="p-5 rounded-2xl bg-[#151C28] border border-[#263346] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
            <PieChart size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">{t('overview.portfolioLabel')}</p>
            <p className="text-lg font-bold text-white">{totalAllocation.toFixed(2)}% / 100.00%</p>
          </div>
        </div>
        <div className="w-full sm:w-48 bg-[#0B0F17] h-3 rounded-full overflow-hidden border border-[#263346]">
          <div 
            className="bg-[#8B5CF6] h-full transition-all duration-300" 
            style={{ width: `${Math.min(totalAllocation, 100)}%` }} 
          />
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

      {/* Add Beneficiary Form ➕ */}
      <form onSubmit={handleAdd} className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <UserPlus size={16} className="text-[#8B5CF6]" />
          {t('form.title')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">{t('form.fullNameLabel')}</label>
            <input
              type="text"
              required
              placeholder={t('form.fullNamePlaceholder')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">{t('form.emailLabel')}</label>
            <input
              type="email"
              required
              placeholder={t('form.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">{t('form.relationshipLabel')}</label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as any)}
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="spouse">{t('relationships.spouse')}</option>
              <option value="child">{t('relationships.child')}</option>
              <option value="parent">{t('relationships.parent')}</option>
              <option value="sibling">{t('relationships.sibling')}</option>
              <option value="trust">{t('relationships.trust')}</option>
              <option value="other">{t('relationships.other')}</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">{t('form.allocationLabel')}</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              required
              placeholder={t('form.allocationPlaceholder')}
              value={allocation}
              onChange={(e) => setAllocation(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-[#8B5CF6]/20"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          <span>{saving ? t('form.saving') : t('form.saveButton')}</span>
        </button>
      </form>

      {/* Beneficiaries List 👥 */}
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t('list.title', { count: list.length })}
        </h3>

        {list.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">{t('list.empty')}</p>
        ) : (
          <div className="space-y-3">
            {list.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-4 bg-[#0B0F17] border border-[#263346] rounded-xl text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm">{item.fullName}</p>
                    <span className="capitalize px-2 py-0.5 rounded-md bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20 text-[10px] font-semibold">
                      {t(`relationships.${item.relationship}`)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{item.email}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-white text-sm">{item.allocationPercentage}%</p>
                    <p className="text-[10px] text-slate-500">{t('list.allocationSub')}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition disabled:opacity-50"
                  >
                    {deletingId === item.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}