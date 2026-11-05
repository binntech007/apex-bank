
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ArrowLeft,
  Search,
  Lock,
  Unlock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

import {
  getAllCardsForAdmin,
  approveCardRequest,
  rejectCardRequest,
  toggleCardFreezeAdmin,
} from '@/actions/card-admin';

interface AdminCard {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ledgerAccountId: string;
  ledgerAccountName: string;
  type: 'metal' | 'virtual';
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  status: 'pending' | 'active' | 'frozen' | 'rejected';
  spendLimit: number;
  spentThisMonth: number;
  createdAt: string;
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<AdminCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCards() {
    setLoading(true);
    const data = await getAllCardsForAdmin();
    setCards(data as AdminCard[]);
    setLoading(false);
  }

  useEffect(() => {
    loadCards();
  }, []);

  async function handleApprove(cardId: string) {
    setProcessingId(cardId);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await approveCardRequest(cardId);

    if (result.success) {
      setSuccessMessage(result.message || 'Card approved.');
      await loadCards();
    } else {
      setErrorMessage(result.error || 'Unable to approve card.');
    }

    setProcessingId(null);
  }

  async function handleReject(cardId: string) {
    setProcessingId(cardId);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await rejectCardRequest(cardId);

    if (result.success) {
      setSuccessMessage(result.message || 'Request rejected.');
      await loadCards();
    } else {
      setErrorMessage(result.error || 'Unable to reject request.');
    }

    setProcessingId(null);
  }

  async function handleToggleFreeze(cardId: string) {
    setProcessingId(cardId);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await toggleCardFreezeAdmin(cardId);

    if (result.success) {
      setSuccessMessage(result.message || 'Card status updated.');
      await loadCards();
    } else {
      setErrorMessage(result.error || 'Unable to update card.');
    }

    setProcessingId(null);
  }

  const matchesSearch = (card: AdminCard) => {
    const query = searchQuery.toLowerCase();

    return (
      card.userName.toLowerCase().includes(query) ||
      card.userEmail.toLowerCase().includes(query) ||
      card.cardholderName.toLowerCase().includes(query) ||
      card.cardNumber.toLowerCase().includes(query)
    );
  };

  const pendingCards = cards.filter(
    (card) =>
      card.status === 'pending' &&
      (filterType === 'all' || card.type === filterType) &&
      matchesSearch(card)
  );

  const issuedCards = cards.filter(
    (card) =>
      ['active', 'frozen'].includes(card.status) &&
      (filterType === 'all' || card.type === filterType) &&
      matchesSearch(card)
  );

  const rejectedCount = cards.filter(
    (card) => card.status === 'rejected'
  ).length;

  const pendingCount = cards.filter(
    (card) => card.status === 'pending'
  ).length;

  const statusStyle = (status: AdminCard['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'frozen':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'rejected':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-3"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="text-purple-400" />
          Card Management
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Review card requests and manage approved demo cards.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex gap-2">
          <AlertCircle size={17} />
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex gap-2">
          <CheckCircle size={17} />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-5">
          <Clock className="text-amber-400 mb-3" size={21} />
          <p className="text-xs text-slate-400">Pending Requests</p>
          <p className="text-2xl font-bold text-white mt-1">{pendingCount}</p>
        </div>

        <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-5">
          <CreditCard className="text-emerald-400 mb-3" size={21} />
          <p className="text-xs text-slate-400">Issued Cards</p>
          <p className="text-2xl font-bold text-white mt-1">{issuedCards.length}</p>
        </div>

        <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-5">
          <XCircle className="text-slate-400 mb-3" size={21} />
          <p className="text-xs text-slate-400">Rejected Requests</p>
          <p className="text-2xl font-bold text-white mt-1">{rejectedCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search customer or card..."
            className="w-full bg-[#151C28] border border-[#263346] rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(event) => setFilterType(event.target.value)}
          className="bg-[#151C28] border border-[#263346] rounded-xl px-4 py-3 text-xs text-white outline-none"
        >
          <option value="all">All Card Types</option>
          <option value="virtual">Virtual</option>
          <option value="metal">Metal</option>
        </select>
      </div>

      {/* Pending card requests */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">
            Pending Card Requests
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review customer requests before approving or rejecting them.
          </p>
        </div>

        <div className="bg-[#151C28] border border-[#263346] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center text-purple-400">
              <Loader2 className="animate-spin" />
            </div>
          ) : pendingCards.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              No pending card requests.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0F17] text-slate-400 uppercase">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Cardholder</th>
                    <th className="p-4">Card Type</th>
                    <th className="p-4">Vault</th>
                    <th className="p-4">Request Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#263346] text-slate-200">
                  {pendingCards.map((card) => (
                    <tr key={card.id} className="hover:bg-[#1C2638]/50">
                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <User size={14} className="text-purple-400" />
                          {card.userName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {card.userEmail}
                        </div>
                      </td>

                      <td className="p-4 uppercase">{card.cardholderName}</td>

                      <td className="p-4 capitalize">{card.type}</td>

                      <td className="p-4">{card.ledgerAccountName}</td>

                      <td className="p-4 text-slate-400">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(card.id)}
                            disabled={processingId === card.id}
                            className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 flex items-center gap-1"
                          >
                            {processingId === card.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                            Approve
                          </button>

                          <button
                            onClick={() => handleReject(card.id)}
                            disabled={processingId === card.id}
                            className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Issued cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Issued Cards Directory</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage approved cards and their freeze status.
          </p>
        </div>

        <div className="bg-[#151C28] border border-[#263346] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0F17] text-slate-400 uppercase">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Cardholder</th>
                  <th className="p-4">Demo Identifier</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Monthly Spend</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#263346] text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center">
                      <Loader2 className="animate-spin mx-auto text-purple-400" />
                    </td>
                  </tr>
                ) : issuedCards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400">
                      No issued cards found.
                    </td>
                  </tr>
                ) : (
                  issuedCards.map((card) => (
                    <tr key={card.id} className="hover:bg-[#1C2638]/50">
                      <td className="p-4">
                        <div className="font-bold text-white">{card.userName}</div>
                        <div className="text-[10px] text-slate-400">
                          {card.userEmail}
                        </div>
                      </td>

                      <td className="p-4 uppercase">{card.cardholderName}</td>

                      <td className="p-4 font-mono text-white">
                        {card.cardNumber}
                      </td>

                      <td className="p-4 capitalize">{card.type}</td>

                      <td className="p-4 font-mono">
                        ${card.spentThisMonth.toFixed(2)} / $
                        {card.spendLimit.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-semibold capitalize ${statusStyle(card.status)}`}
                        >
                          {card.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleFreeze(card.id)}
                          disabled={processingId === card.id}
                          className={`px-3 py-2 rounded-lg border text-[11px] font-semibold disabled:opacity-50 inline-flex items-center gap-1 ${
                            card.status === 'active'
                              ? 'bg-red-500/10 border-red-500/30 text-red-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}
                        >
                          {processingId === card.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : card.status === 'active' ? (
                            <>
                              <Lock size={12} /> Freeze
                            </>
                          ) : (
                            <>
                              <Unlock size={12} /> Unfreeze
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
