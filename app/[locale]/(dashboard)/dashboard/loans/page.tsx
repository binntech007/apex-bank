'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  Building2, 
  Plus, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Wallet, 
  X, 
  AlertCircle, 
  Loader2
} from 'lucide-react';
import { applyForLoan, getUserLoans } from '@/actions/loans';
import { getUserVaults } from '@/actions/cards';

interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  remainingBalance: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: string;
}

interface Vault {
  id: string;
  name: string;
  currency: string;
  balance: number;
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form inputs
  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [amountInput, setAmountInput] = useState('5000');
  const [termInput, setTermInput] = useState('12');
  const [purposeInput, setPurposeInput] = useState('Business Expansion');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = useTranslations('LoansPage');

  useEffect(() => {
    async function loadData() {
      const [userLoans, userVaults] = await Promise.all([
        getUserLoans(),
        getUserVaults(),
      ]);
      setLoans(userLoans);
      setVaults(userVaults);
      if (userVaults.length > 0) {
        setSelectedVaultId(userVaults[0].id);
      }
    }
    loadData();
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedVaultId) {
      setErrorMessage(t('errors.selectVault'));
      return;
    }

    setIsSubmitting(true);

    const result = await applyForLoan({
      ledgerAccountId: selectedVaultId,
      amount: parseFloat(amountInput),
      termMonths: parseInt(termInput),
      purpose: purposeInput,
    });

    if (result.success) {
      setIsModalOpen(false);
      const updatedLoans = await getUserLoans();
      setLoans(updatedLoans);
    } else {
      setErrorMessage(result.error || t('errors.submissionFailed'));
    }

    setIsSubmitting(false);
  };

  const getStatusBadge = (status: Loan['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={14} /> {t('status.pending')}
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={14} /> {t('status.approved')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle size={14} /> {t('status.rejected')}
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {t('status.paid')}
          </span>
        );
    }
  };

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft size={16} />
            <span>{t('backToDashboard')}</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {t('pageTitle')} 🏦
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('pageDescription')}
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#7C3AED] transition shadow-lg shadow-[#8B5CF6]/20"
        >
          <Plus size={18} />
          <span>{t('applyButton')}</span>
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="bg-[#151C28] border border-[#263346] rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-16 h-16 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto border border-[#8B5CF6]/20">
            <Building2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">{t('empty.title')}</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {t('empty.description')}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-5 py-3 text-xs font-bold text-white hover:bg-[#7C3AED] transition shadow-lg shadow-[#8B5CF6]/20 mt-2"
          >
            <Plus size={16} />
            <span>{t('empty.button')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('applicationsTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loans.map((loan) => (
              <div 
                key={loan.id}
                className="bg-[#151C28] border border-[#263346] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {loan.purpose}
                    </p>
                    {getStatusBadge(loan.status)}
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block">{t('card.requestedAmount')}</span>
                    <p className="text-2xl font-bold text-white font-mono mt-0.5">
                      ${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#0B0F17] border border-[#263346] text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">{t('card.term')}</span>
                      <span className="text-slate-200 font-semibold">{loan.termMonths} {t('card.months')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">{t('card.monthlyEst')}</span>
                      <span className="text-slate-200 font-semibold">${loan.monthlyPayment.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#263346] pt-3 flex justify-between text-[11px] text-slate-400">
                  <span>{t('card.interest')}: {loan.interestRate}% APR</span>
                  <span>{t('card.submitted')}: {new Date(loan.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOAN APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151C28] border border-[#263346] rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#263346] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {t('modal.title')} 💰
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('modal.subtitle')}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  {t('modal.vaultLabel')}
                </label>
                <div className="space-y-2">
                  {vaults.map((vault) => (
                    <div
                      key={vault.id}
                      onClick={() => setSelectedVaultId(vault.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        selectedVaultId === vault.id
                          ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]'
                          : 'bg-[#0B0F17]/50 border-[#263346] hover:bg-[#1C2638]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Wallet size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs font-bold text-white">{vault.name}</p>
                          <p className="text-[10px] text-slate-400">{vault.currency} {t('modal.accountLabel')}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-300">${vault.balance.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  {t('modal.amountLabel')}
                </label>
                <input
                  type="number"
                  min="500"
                  max="100000"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  required
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    {t('modal.termLabel')}
                  </label>
                  <select
                    value={termInput}
                    onChange={(e) => setTermInput(e.target.value)}
                    className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="6">6 {t('card.months')}</option>
                    <option value="12">12 {t('card.months')}</option>
                    <option value="24">24 {t('card.months')}</option>
                    <option value="36">36 {t('card.months')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    {t('modal.purposeLabel')}
                  </label>
                  <input
                    type="text"
                    value={purposeInput}
                    onChange={(e) => setPurposeInput(e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-[#8B5CF6]/20 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('modal.submitting')}</span>
                  </>
                ) : (
                  <span>{t('modal.submitButton')}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}