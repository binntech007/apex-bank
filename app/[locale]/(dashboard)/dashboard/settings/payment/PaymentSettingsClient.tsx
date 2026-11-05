'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  Landmark, 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowLeft 
} from 'lucide-react';
import { addBankAccount, addCard } from '@/actions/payment-methods';

interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  isDefault: boolean;
  createdAt: Date;
}

interface LinkedCard {
  id: string;
  userId: string;
  cardholderName: string;
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  isDefault: boolean;
  createdAt: Date;
}

interface PaymentSettingsClientProps {
  userId: string;
  initialBanks: BankAccount[];
  initialCards: LinkedCard[];
}

export default function PaymentSettingsClient({
  userId,
  initialBanks,
  initialCards,
}: PaymentSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'banks' | 'cards'>('banks');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Lists State 📋
  const [banks, setBanks] = useState<BankAccount[]>(initialBanks);
  const [cards, setCards] = useState<LinkedCard[]>(initialCards);

  // Visibility Toggles 👁️
  const [visibleBankId, setVisibleBankId] = useState<string | null>(null);
  const [visibleCardId, setVisibleCardId] = useState<string | null>(null);

  // Bank Form State 🏦
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('checking');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');

  // Card Form State 💳
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [brand, setBrand] = useState('Visa');

  const t = useTranslations('PaymentSettingsClient');

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const res = await addBankAccount({
      userId,
      bankName,
      accountType,
      accountNumber,
      routingNumber,
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message || t('success.bankLinked') });
      setBanks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          userId,
          bankName,
          accountType,
          accountNumber,
          routingNumber,
          isDefault: prev.length === 0,
          createdAt: new Date(),
        },
      ]);
      setBankName('');
      setAccountNumber('');
      setRoutingNumber('');
    } else {
      setMessage({ type: 'error', text: res.error || t('errors.bankFailed') });
    }
    setIsSubmitting(false);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const res = await addCard({
      userId,
      cardholderName,
      cardNumber,
      expMonth,
      expYear,
      cvc,
      brand,
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message || t('success.cardLinked') });
      setCards((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          userId,
          cardholderName,
          brand,
          last4: cardNumber.slice(-4),
          expMonth,
          expYear,
          cvc,
          isDefault: prev.length === 0,
          createdAt: new Date(),
        },
      ]);
      setCardholderName('');
      setCardNumber('');
      setExpMonth('');
      setExpYear('');
      setCvc('');
    } else {
      setMessage({ type: 'error', text: res.error || t('errors.cardFailed') });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Button 🔙 */}
      <Link 
        href="/dashboard/settings" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        <span>{t('backToSettings')}</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {t('pageTitle')} ⚙️
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('pageDescription')}
        </p>
      </div>

      {/* Tab Switcher 🔘 */}
      <div className="flex bg-[#151C28] p-1.5 rounded-2xl border border-[#263346] max-w-md">
        <button
          type="button"
          onClick={() => { setActiveTab('banks'); setMessage(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'banks'
              ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Landmark size={16} />
          <span>{t('tabs.banks')}</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('cards'); setMessage(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'cards'
              ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard size={16} />
          <span>{t('tabs.cards')}</span>
        </button>
      </div>

      {/* Notification Banner 🔔 */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Saved Banks List 🏦 */}
      {activeTab === 'banks' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{t('banksList.title')}</h2>
          {banks.length === 0 ? (
            <p className="text-xs text-slate-500 italic">{t('banksList.empty')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banks.map((bank) => (
                <div key={bank.id} className="bg-[#151C28] border border-[#263346] p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{bank.bankName}</span>
                      <span className="text-[10px] uppercase bg-[#8B5CF6]/20 text-[#8B5CF6] px-2 py-0.5 rounded-full font-bold">
                        {bank.accountType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-mono flex items-center gap-2">
                      <span>{t('banksList.accountLabel')}:</span>
                      <span>
                        {visibleBankId === bank.id
                          ? bank.accountNumber
                          : `••••••••${bank.accountNumber.slice(-4)}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setVisibleBankId(visibleBankId === bank.id ? null : bank.id)}
                        className="text-slate-400 hover:text-white transition"
                      >
                        {visibleBankId === bank.id ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAddBank} className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-[#8B5CF6]" />
              {t('bankForm.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('bankForm.bankName')}</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder={t('bankForm.bankNamePlaceholder')}
                  required
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('bankForm.accountType')}</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="checking">{t('bankForm.checking')}</option>
                  <option value="savings">{t('bankForm.savings')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('bankForm.routingNumber')}</label>
                <input
                  type="text"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  placeholder={t('bankForm.routingPlaceholder')}
                  required
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('bankForm.accountNumber')}</label>
                <input
                  type="password"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={t('bankForm.accountPlaceholder')}
                  required
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
            >
              {isSubmitting ? t('bankForm.submitting') : t('bankForm.submit')}
            </button>
          </form>
        </div>
      )}

      {/* Saved Cards List 💳 */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{t('cardsList.title')}</h2>
          {cards.length === 0 ? (
            <p className="text-xs text-slate-500 italic">{t('cardsList.empty')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card) => (
                <div key={card.id} className="bg-[#151C28] border border-[#263346] p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{card.brand}</span>
                      <span className="text-xs text-slate-400">•••• {card.last4}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-mono flex items-center gap-3">
                      <span>{t('cardsList.expires')}: {card.expMonth}/{card.expYear}</span>
                      <span className="flex items-center gap-1">
                        CVC: {visibleCardId === card.id ? card.cvc : '•••'}
                        <button
                          type="button"
                          onClick={() => setVisibleCardId(visibleCardId === card.id ? null : card.id)}
                          className="text-slate-400 hover:text-white transition"
                        >
                          {visibleCardId === card.id ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAddCard} className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-[#8B5CF6]" />
              {t('cardForm.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('cardForm.holderName')}</label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder={t('cardForm.holderPlaceholder')}
                  required
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('cardForm.network')}</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">American Express</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('cardForm.number')}</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder={t('cardForm.numberPlaceholder')}
                  required
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('cardForm.expMonth')}</label>
                <input
                  type="text"
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  placeholder={t('cardForm.expMonthPlaceholder')}
                  required
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('cardForm.expYear')}</label>
                <input
                  type="text"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  placeholder={t('cardForm.expYearPlaceholder')}
                  required
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">{t('cardForm.cvc')}</label>
                <input
                  type="password"
                  maxLength={4}
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder={t('cardForm.cvcPlaceholder')}
                  required
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
            >
              {isSubmitting ? t('cardForm.submitting') : t('cardForm.submit')}
            </button>
          </form>
        </div>
      )}

      {/* Security Note 🔒 */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0B0F17] border border-[#263346] text-xs text-slate-400">
        <ShieldCheck size={20} className="text-[#8B5CF6] shrink-0" />
        <span>
          {t('securityNote')}
        </span>
      </div>
    </div>
  );
}