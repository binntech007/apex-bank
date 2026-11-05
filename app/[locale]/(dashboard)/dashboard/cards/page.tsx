
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  CreditCard,
  Plus,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  Wallet,
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
  XCircle,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';

import {
  purchaseCard,
  getUserVaults,
  getUserCards,
  updateCustomerCardStatus,
} from '@/actions/cards';

type CardStatus = 'pending' | 'active' | 'frozen' | 'rejected';

interface Card {
  id: string;
  type: 'metal' | 'virtual';
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cvv: string;
  status: CardStatus;
  spendLimit: number;
  spentThisMonth: number;
  createdAt?: string;
}

interface Vault {
  id: string;
  name: string;
  currency: string;
  balance: number;
}

const CARD_PRICES = {
  virtual: 5,
  metal: 50,
};

const SUPPORTED_CARD_CURRENCIES = [
  'CAD',
  'USD',
  'EUR',
  'GBP',
  'AUD',
] as const;

// Format the stored demo reference.
// This is a non-functional application identifier,
// not a payment-card number.
function formatDemoCardNumber(cardNumber: string) {
  if (!cardNumber || cardNumber === 'PENDING') {
    return 'PENDING';
  }

  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length !== 16) {
    return cardNumber;
  }

  return digits.match(/.{1,4}/g)?.join(' ') ?? cardNumber;
}

export default function CardsPage() {
  const t = useTranslations('CardsPage');

  const [cards, setCards] = useState<Card[]>([]);
  const [vaults, setVaults] = useState<Vault[]>([]);

  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedVaultId, setSelectedVaultId] = useState('');

  const [showSensitiveDetails, setShowSensitiveDetails] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [cardType, setCardType] = useState<'virtual' | 'metal'>('virtual');

  const [cardholderInput, setCardholderInput] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);

  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedCard = cards.find(
    (card) => card.id === selectedCardId
  );

  // Supported vault currencies.
  const eligibleVaults = vaults.filter((vault) =>
    SUPPORTED_CARD_CURRENCIES.includes(
      vault.currency.toUpperCase() as
        (typeof SUPPORTED_CARD_CURRENCIES)[number]
    )
  );

  const selectedVault = eligibleVaults.find(
    (vault) => vault.id === selectedVaultId
  );

  const pendingCards = cards.filter(
    (card) => card.status === 'pending'
  );

  const activeCards = cards.filter(
    (card) => card.status === 'active'
  );

  const frozenCards = cards.filter(
    (card) => card.status === 'frozen'
  );

  const rejectedCards = cards.filter(
    (card) => card.status === 'rejected'
  );

  const approvedCards = cards.filter(
    (card) =>
      card.status === 'active' || card.status === 'frozen'
  );

  const formatMoney = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  // LOAD CUSTOMER CARDS AND VAULTS
  async function loadData() {
    try {
      setLoadError(null);

      const [vaultData, cardData] = await Promise.all([
        getUserVaults(),
        getUserCards(),
      ]);

      setVaults(vaultData);
      setCards(cardData);

      const supportedVaults = vaultData.filter((vault) =>
        SUPPORTED_CARD_CURRENCIES.includes(
          vault.currency.toUpperCase() as
            (typeof SUPPORTED_CARD_CURRENCIES)[number]
        )
      );

      setSelectedVaultId((previous) => {
        if (
          previous &&
          supportedVaults.some((vault) => vault.id === previous)
        ) {
          return previous;
        }

        return supportedVaults[0]?.id || '';
      });

      setSelectedCardId((previous) => {
        if (previous && cardData.some((card) => card.id === previous)) {
          return previous;
        }

        return (
          cardData.find((card) => card.status === 'active')?.id ||
          cardData.find((card) => card.status === 'frozen')?.id ||
          cardData[0]?.id ||
          ''
        );
      });
    } catch (error) {
      console.error('CARD PAGE LOAD ERROR:', error);

      setLoadError(
        'Unable to load your cards. Please refresh the page.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // SUBMIT CARD REQUEST
  const handlePurchaseSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPurchaseError(null);
    setSuccessMessage(null);

    if (!selectedVaultId) {
      setPurchaseError(
        'Please select a CAD, USD, EUR, GBP, or AUD vault.'
      );
      return;
    }

    if (!cardholderInput.trim()) {
      setPurchaseError('Please enter the cardholder name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await purchaseCard({
        ledgerAccountId: selectedVaultId,
        type: cardType,
        cardholderName: cardholderInput.trim(),
      });

      if (!result.success) {
        setPurchaseError(
          result.error || 'Unable to submit your card request.'
        );
        return;
      }

      setIsModalOpen(false);
      setCardholderInput('');

      setSuccessMessage(
        result.message ||
          'Your card request has been submitted and is awaiting banking approval.'
      );

      await loadData();
    } catch (error) {
      console.error('CARD REQUEST FRONTEND ERROR:', error);

      setPurchaseError(
        'Something went wrong while submitting your request.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // FREEZE OR UNFREEZE CARD
  const handleToggleCardStatus = async (card: Card) => {
    if (card.status !== 'active' && card.status !== 'frozen') {
      return;
    }

    const nextStatus =
      card.status === 'active' ? 'frozen' : 'active';

    const confirmation =
      nextStatus === 'frozen'
        ? 'Are you sure you want to freeze this card?'
        : 'Are you sure you want to reactivate this card?';

    if (!window.confirm(confirmation)) return;

    setIsUpdatingCard(true);
    setPurchaseError(null);
    setSuccessMessage(null);

    try {
      const result = await updateCustomerCardStatus(
        card.id,
        nextStatus
      );

      if (!result.success) {
        setPurchaseError(
          result.error || 'Unable to update card status.'
        );
        return;
      }

      setSuccessMessage(result.message || 'Card status updated.');

      await loadData();

      setShowSensitiveDetails(false);
    } catch (error) {
      console.error('CARD STATUS UPDATE ERROR:', error);

      setPurchaseError(
        'Unable to update your card. Please try again.'
      );
    } finally {
      setIsUpdatingCard(false);
    }
  };

  const closeModal = () => {
    if (isSubmitting) return;

    setIsModalOpen(false);
    setPurchaseError(null);
  };

  const openModal = () => {
    setPurchaseError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const getStatusStyle = (status: CardStatus) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';

      case 'frozen':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';

      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  const getStatusIcon = (status: CardStatus) => {
    switch (status) {
      case 'active':
        return <ShieldCheck size={14} />;

      case 'pending':
        return <Clock size={14} />;

      case 'frozen':
        return <Lock size={14} />;

      case 'rejected':
        return <XCircle size={14} />;
    }
  };

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft size={16} />
            {t('backToDashboard')}
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            {t('pageTitle')} 💳
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Manage your card requests and approved cards.
          </p>
        </div>

        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#7C3AED] transition"
        >
          <Plus size={18} />
          Request New Card
        </button>
      </div>

      {/* FEEDBACK */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
          <Check size={18} />
          {successMessage}
        </div>
      )}

      {purchaseError && !isModalOpen && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          {purchaseError}
        </div>
      )}

      {/* LOADING */}
      {isLoading && (
        <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-12 flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-[#8B5CF6]" />
          <p className="text-sm text-slate-400">
            Loading your cards...
          </p>
        </div>
      )}

      {/* LOAD ERROR */}
      {!isLoading && loadError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {loadError}

          <button
            onClick={loadData}
            className="ml-3 underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !loadError && (
        <>
          {/* CARD SUMMARY */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Approved',
                value: activeCards.length,
                color: 'text-emerald-400',
              },
              {
                label: 'Pending',
                value: pendingCards.length,
                color: 'text-amber-400',
              },
              {
                label: 'Frozen',
                value: frozenCards.length,
                color: 'text-blue-400',
              },
              {
                label: 'Rejected',
                value: rejectedCards.length,
                color: 'text-red-400',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[#151C28] border border-[#263346] rounded-2xl p-4"
              >
                <p className="text-xs text-slate-400">
                  {item.label}
                </p>

                <p className={`text-2xl font-bold mt-2 ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* PENDING REQUESTS */}
          {pendingCards.length > 0 && (
            <section className="bg-[#151C28] border border-amber-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="text-amber-400" size={20} />

                <h2 className="text-sm font-bold text-white">
                  Pending Card Requests
                </h2>
              </div>

              {pendingCards.map((card) => (
                <div
                  key={card.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F17] border border-[#263346] rounded-xl p-4"
                >
                  <div>
                    <p className="text-sm font-bold text-white capitalize">
                      {card.type} card
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Cardholder: {card.cardholderName}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Request reference: {card.id.slice(0, 8)}
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold ${getStatusStyle('pending')}`}>
                    <Clock size={14} />
                    Awaiting approval
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* REJECTED REQUESTS */}
          {rejectedCards.length > 0 && (
            <section className="bg-[#151C28] border border-[#263346] rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-white">
                Rejected Requests
              </h2>

              {rejectedCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between gap-3 bg-[#0B0F17] rounded-xl p-4"
                >
                  <div>
                    <p className="text-sm text-white font-semibold capitalize">
                      {card.type} card
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {card.cardholderName}
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs ${getStatusStyle('rejected')}`}>
                    <XCircle size={14} />
                    Rejected
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* APPROVED CARDS */}
          {approvedCards.length === 0 ? (
            <div className="bg-[#151C28] border border-[#263346] rounded-3xl p-10 text-center space-y-4">
              <div className="w-16 h-16 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto">
                <CreditCard size={32} />
              </div>

              <h2 className="text-xl font-bold text-white">
                No approved cards yet
              </h2>

              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Submit a card request to get started. Your request will
                appear above while it awaits banking review.
              </p>

              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 bg-[#8B5CF6] px-5 py-3 rounded-xl text-white text-sm font-bold"
              >
                <Plus size={16} />
                Request a Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* SELECTED CARD */}
              <div className="lg:col-span-7 space-y-5">
                {selectedCard &&
                (selectedCard.status === 'active' ||
                  selectedCard.status === 'frozen') ? (
                  <>
                    <div className="relative aspect-[1.586/1] w-full max-w-md mx-auto rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-[#1E1233] via-[#121824] to-[#0B0F17]">

                      <div className="flex justify-between items-start z-10">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            Apex Vault
                          </p>

                          <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/10 text-slate-200">
                            {selectedCard.type}
                          </span>
                        </div>

                        <CreditCard
                          size={26}
                          className="text-[#8B5CF6]"
                        />
                      </div>

                      {/* CARD DETAILS */}
                      <div className="space-y-4 z-10">
                        <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-200 to-amber-400/80 border border-amber-100/40" />

                        {/* FULL DEMO NUMBER */}
                        <p className="font-mono text-lg sm:text-xl tracking-widest text-white font-semibold break-all">
                          {formatDemoCardNumber(selectedCard.cardNumber)}
                        </p>

                        {/* EXPIRY AND STATUS */}
                        <div className="flex gap-8 text-xs text-slate-300 font-mono">
                          <div>
                            <span className="text-[9px] uppercase text-slate-400 block">
                              Expiry Date
                            </span>

                            <span className="text-white">
                              {selectedCard.expiry || '--/--'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[9px] uppercase text-slate-400 block">
                              Status
                            </span>

                            <span className="text-white">
                              {selectedCard.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CARDHOLDER */}
                      <div className="flex justify-between items-end z-10">
                        <p className="text-xs font-semibold tracking-wider text-slate-200 uppercase">
                          {selectedCard.cardholderName}
                        </p>

                        <span className="text-[10px] text-slate-300 uppercase">
                          {selectedCard.status}
                        </span>
                      </div>
                    </div>

                    {/* DEMO NOTICE */}
                    <div className="max-w-md mx-auto p-4 bg-[#151C28] border border-[#263346] rounded-xl text-xs text-slate-400">
                      <p className="text-amber-400 font-bold mb-1">
                         PAYMENT CARD
                      </p>

                      This is a payment card reference for this banking
                      application. It can be used to make payments.
                    </div>

                    {/* CARD ACTIONS */}
                    <div className="max-w-md mx-auto space-y-3">
                      <button
                        type="button"
                        disabled={isUpdatingCard}
                        onClick={() =>
                          handleToggleCardStatus(selectedCard)
                        }
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition disabled:opacity-50 ${
                          selectedCard.status === 'active'
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {isUpdatingCard ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : selectedCard.status === 'active' ? (
                          <Lock size={17} />
                        ) : (
                          <Unlock size={17} />
                        )}

                        {isUpdatingCard
                          ? 'Updating Card...'
                          : selectedCard.status === 'active'
                            ? 'Freeze Card'
                            : 'Unfreeze Card'}
                      </button>

                      {selectedCard.status === 'frozen' && (
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                          This card is currently frozen. Its status
                          must be changed back to active before it
                          can be used within the application's
                          simulated card features.
                        </div>
                      )}

                      {/* SHOW / HIDE DETAILS */}
                      <button
                        type="button"
                        onClick={() =>
                          setShowSensitiveDetails((previous) => !previous)
                        }
                        className="w-full flex items-center justify-center gap-2 bg-[#151C28] hover:bg-[#1C2638] text-slate-200 text-xs font-semibold py-3 px-4 rounded-xl border border-[#263346]"
                      >
                        {showSensitiveDetails ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}

                        {showSensitiveDetails
                          ? 'Hide details'
                          : 'Show details'}
                      </button>

                      {/* EXPANDED DETAILS */}
                      {showSensitiveDetails && (
                        <div className="p-4 rounded-xl bg-[#151C28] border border-[#263346] text-xs space-y-3">

                          <div className="flex flex-col gap-1">
                            <span className="text-slate-400">
                               Card Number
                            </span>

                            <span className="text-white font-mono break-all">
                              {formatDemoCardNumber(selectedCard.cardNumber)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">
                              Expiry Date
                            </span>

                            <span className="text-white font-mono">
                              {selectedCard.expiry || '--/--'}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">
                              Cardholder
                            </span>

                            <span className="text-white">
                              {selectedCard.cardholderName}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">
                              Security Code
                            </span>

                            <span className="text-white">
                              190
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-slate-400">
                              Status
                            </span>

                            <span className="text-white uppercase">
                              {selectedCard.status}
                            </span>
                          </div>

                          <p className="text-amber-400 pt-2">
                             PAYMENT CARD.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-10 text-center space-y-3">
                    <CreditCard
                      size={35}
                      className="mx-auto text-[#8B5CF6]"
                    />

                    <h3 className="text-white font-bold">
                      Select an approved card
                    </h3>

                    <p className="text-sm text-slate-400">
                      Pending and rejected requests do not have
                      an approved card preview.
                    </p>
                  </div>
                )}
              </div>

              {/* CARD LIST */}
              <div className="lg:col-span-5">
                <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">
                    Your Cards
                  </h3>

                  <div className="space-y-3">
                    {cards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => {
                          setSelectedCardId(card.id);
                          setShowSensitiveDetails(false);
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                          selectedCardId === card.id
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                            : 'border-[#263346] bg-[#0B0F17]/50 hover:bg-[#1C2638]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-lg bg-[#151C28] border border-[#263346] text-[#8B5CF6]">
                            <CreditCard size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white capitalize">
                              {card.type} Card
                            </p>

                            <p className="text-[11px] text-slate-400 mt-1 truncate">
                              {card.cardholderName}
                            </p>

                            {(card.status === 'active' ||
                              card.status === 'frozen') && (
                              <p className="text-[10px] text-slate-500 mt-1 font-mono break-all">
                                {formatDemoCardNumber(card.cardNumber)}
                              </p>
                            )}

                            {(card.status === 'active' ||
                              card.status === 'frozen') && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                Expires: {card.expiry || '--/--'}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-semibold capitalize shrink-0 ${getStatusStyle(card.status)}`}>
                          {getStatusIcon(card.status)}
                          {card.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* REQUEST CARD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#151C28] border border-[#263346] rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl my-auto">

            <div className="flex items-center justify-between border-b border-[#263346] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Request New Card 💳
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Your request will be reviewed by an administrator.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {purchaseError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                {purchaseError}
              </div>
            )}

            <form
              onSubmit={handlePurchaseSubmit}
              className="space-y-5"
            >

              {/* CARD TYPE */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase">
                  Select Card Tier
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {(['virtual', 'metal'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCardType(type)}
                      className={`text-left p-4 rounded-xl border transition ${
                        cardType === type
                          ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]'
                          : 'bg-[#0B0F17]/50 border-[#263346] hover:bg-[#1C2638]'
                      }`}
                    >
                      <p className="text-xs font-bold text-white capitalize">
                        {type === 'metal'
                          ? 'Physical Metal'
                          : 'Virtual Card'}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-1">
                        {type === 'metal'
                          ? 'Physical card request'
                          : 'Digital card request'}
                      </p>

                      <p className="text-xs font-bold text-[#8B5CF6] mt-3">
                        {selectedVault
                          ? formatMoney(
                              CARD_PRICES[type],
                              selectedVault.currency
                            )
                          : `${CARD_PRICES[type].toFixed(2)} in selected currency`}
                        {' '}displayed estimate
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* VAULT */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase">
                  Select Vault
                </label>

                {eligibleVaults.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                    No eligible vault is available. Card requests
                    support CAD, USD, EUR, GBP, and AUD accounts.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eligibleVaults.map((vault) => (
                      <button
                        key={vault.id}
                        type="button"
                        onClick={() => setSelectedVaultId(vault.id)}
                        className={`w-full p-3 rounded-xl border transition flex items-center justify-between ${
                          selectedVaultId === vault.id
                            ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]'
                            : 'bg-[#0B0F17]/50 border-[#263346] hover:bg-[#1C2638]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Wallet
                            size={16}
                            className="text-slate-400"
                          />

                          <div className="text-left">
                            <p className="text-xs font-bold text-white">
                              {vault.name}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              {vault.currency} account
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-semibold text-slate-200">
                          {formatMoney(
                            vault.balance,
                            vault.currency
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CARDHOLDER NAME */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase">
                  Cardholder Name
                </label>

                <input
                  type="text"
                  placeholder="Enter cardholder name"
                  value={cardholderInput}
                  onChange={(event) =>
                    setCardholderInput(event.target.value)
                  }
                  maxLength={100}
                  required
                  className="w-full bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              {/* DEMO FEE INFORMATION */}
              <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#263346]">
                <p className="text-xs text-slate-300 font-semibold">
                  information
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  This application uses simulated cards. The displayed
                  amount is an estimate for demonstration only.
                </p>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  eligibleVaults.length === 0 ||
                  !selectedVaultId
                }
                className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  'Submit Card Request'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
