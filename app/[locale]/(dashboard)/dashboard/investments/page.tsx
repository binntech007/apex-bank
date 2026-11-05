'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  TrendingUp, 
  Plus, 
  ArrowLeft, 
  Wallet, 
  X, 
  AlertCircle, 
  Loader2,
  PieChart
} from 'lucide-react';
import { getUserInvestments, buyInvestment } from '@/actions/investments';
import { getUserVaults } from '@/actions/cards';

interface Investment {
  id: string;
  assetName: string;
  symbol: string;
  category: 'stocks' | 'crypto' | 'bonds' | 'commodities';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalAmount: number;
  status: 'active' | 'sold';
  createdAt: string;
}

interface Vault {
  id: string;
  name: string;
  currency: string;
  balance: number;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State 📝
  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [assetName, setAssetName] = useState('Apple Inc.');
  const [symbol, setSymbol] = useState('AAPL');
  const [category, setCategory] = useState<'stocks' | 'crypto' | 'bonds' | 'commodities'>('stocks');
  const [quantity, setQuantity] = useState('5');
  const [unitPrice, setUnitPrice] = useState('180');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = useTranslations('InvestmentsPage');

  useEffect(() => {
    async function loadData() {
      const [userInvestments, userVaults] = await Promise.all([
        getUserInvestments(),
        getUserVaults(),
      ]);
      setInvestments(userInvestments);
      setVaults(userVaults);
      if (userVaults.length > 0) {
        setSelectedVaultId(userVaults[0].id);
      }
    }
    loadData();
  }, []);

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedVaultId) {
      setErrorMessage(t('errors.selectVault'));
      return;
    }

    setIsSubmitting(true);

    const result = await buyInvestment({
      ledgerAccountId: selectedVaultId,
      assetName,
      symbol,
      category,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
    });

    if (result.success) {
      setIsModalOpen(false);
      const updatedInvestments = await getUserInvestments();
      setInvestments(updatedInvestments);
    } else {
      setErrorMessage(result.error || t('errors.purchaseFailed'));
    }

    setIsSubmitting(false);
  };

  const totalPortfolioValue = investments.reduce(
    (sum, item) => sum + item.quantity * item.currentPrice, 
    0
  );

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 relative">
      {/* Header Section 📈 */}
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
            {t('pageTitle')} 📈
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
          <span>{t('newInvestment')}</span>
        </button>
      </div>

      {/* Portfolio Value Overview Card 📊 */}
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs text-slate-400 uppercase font-semibold">{t('portfolioValue')}</span>
          <p className="text-3xl font-bold text-white font-mono mt-1">
            ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp size={14} /> {t('activeBadge')}
          </span>
        </div>
      </div>

      {/* Asset Holdings Display 🗂️ */}
      {investments.length === 0 ? (
        <div className="bg-[#151C28] border border-[#263346] rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-16 h-16 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto border border-[#8B5CF6]/20">
            <PieChart size={32} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map((inv) => (
            <div 
              key={inv.id}
              className="bg-[#151C28] border border-[#263346] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider bg-[#0B0F17] px-2.5 py-1 rounded-lg border border-[#263346]">
                    {inv.symbol}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider border border-[#263346] px-2 py-0.5 rounded-full">
                    {inv.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{inv.assetName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {inv.quantity} {t('card.units')} @ ${inv.purchasePrice.toFixed(2)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#263346] text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>{t('card.totalInvested')}:</span>
                    <span className="text-slate-200 font-mono font-semibold">${inv.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{t('card.currentPrice')}:</span>
                    <span className="text-slate-200 font-mono font-semibold">${inv.currentPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#263346] pt-3 text-[10px] text-slate-400 flex justify-between">
                <span>{t('card.status')}: {inv.status}</span>
                <span>{t('card.purchased')}: {new Date(inv.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BUY INVESTMENT MODAL 🛍️ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151C28] border border-[#263346] rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#263346] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {t('modal.title')} 🛍️
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

            <form onSubmit={handleBuySubmit} className="space-y-4">
              {/* Select Vault 🏦 */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  {t('modal.fundingVault')}
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
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

              {/* Asset Details 🏷️ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    {t('modal.assetName')}
                  </label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    {t('modal.symbol')}
                  </label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    {t('modal.category')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="stocks">{t('modal.categories.stocks')}</option>
                    <option value="crypto">{t('modal.categories.crypto')}</option>
                    <option value="bonds">{t('modal.categories.bonds')}</option>
                    <option value="commodities">{t('modal.categories.commodities')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    {t('modal.quantity')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    {t('modal.unitPrice')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    required
                    className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              {/* Total Summary 💵 */}
              <div className="p-3 bg-[#0B0F17] border border-[#263346] rounded-xl flex justify-between items-center text-xs">
                <span className="text-slate-400">{t('modal.totalPurchase')}</span>
                <span className="font-mono font-bold text-white text-sm">
                  ${(parseFloat(quantity || '0') * parseFloat(unitPrice || '0')).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-[#8B5CF6]/20 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('modal.processing')}</span>
                  </>
                ) : (
                  <span>{t('modal.confirmButton')}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}