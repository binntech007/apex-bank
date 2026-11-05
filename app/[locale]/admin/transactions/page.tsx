
// app/admin/transactions/page.tsx

import { auth } from '@/auth';
import { getAllSystemTransactions } from '@/actions/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Clock3,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Landmark,
} from 'lucide-react';

import ReverseButton from './ReverseButton';
import ApproveRejectTransactionButton from './ApproveRejectTransactionButton';

export default async function AdminTransactionsPage() {
  const session = await auth();

  if (
    !session?.user ||
    session.user.role !== 'admin'
  ) {
    redirect('/dashboard');
  }

  const { transactions, success } =
    await getAllSystemTransactions();

  const pendingCount = transactions.filter(
    (tx: any) =>
      tx.status === 'pending' &&
      tx.source === 'international'
  ).length;

  return (
    <div className="min-h-screen bg-obsidian text-[#E2E8F0] p-6 lg:p-10 font-sans">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263346] pb-6">

          <div>

            <div className="inline-flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-2">

              <ShieldAlert size={14} />

              Global Financial Ledger

            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              All System Transactions
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Monitor posted, pending, failed and reversed
              transactions across all customer vaults.
            </p>

          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl border border-[#263346] bg-[#151C28] px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#263346] transition w-fit"
          >
            <ArrowLeft size={14} />

            Back to Admin Dashboard
          </Link>

        </div>

        {/* Summary Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="rounded-xl border border-[#263346] bg-[#151C28] p-5">

            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Total Transactions
            </p>

            <h2 className="text-2xl font-bold text-white mt-2">
              {transactions.length}
            </h2>

          </div>

          <div className="rounded-xl border border-amber-500/20 bg-[#151C28] p-5">

            <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold">
              Pending Reviews
            </p>

            <h2 className="text-2xl font-bold text-amber-400 mt-2">
              {pendingCount}
            </h2>

          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-[#151C28] p-5">

            <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">
              Posted Transactions
            </p>

            <h2 className="text-2xl font-bold text-emerald-400 mt-2">
              {transactions.filter(
                (tx: any) => tx.status === 'posted'
              ).length}
            </h2>

          </div>

        </div>

        {/* Transactions Table */}

        <div className="rounded-2xl border border-[#263346] bg-[#151C28] shadow-sm overflow-hidden">

          <div className="p-6 border-b border-[#263346] flex items-center justify-between gap-4">

            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">
              Transaction History
            </h2>

            <span className="text-xs text-slate-400 font-mono">
              {transactions.length} Records Loaded
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs text-slate-300">

              <thead className="bg-[#0B0F17] uppercase font-bold text-slate-400 tracking-wider border-b border-[#263346]">

                <tr>

                  <th className="px-6 py-4">
                    User
                  </th>

                  <th className="px-6 py-4">
                    Account / Vault
                  </th>

                  <th className="px-6 py-4">
                    Description
                  </th>

                  <th className="px-6 py-4">
                    Type
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Amount
                  </th>

                  <th className="px-6 py-4">
                    Timestamp
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-[#263346]/60">

                {!success || transactions.length === 0 ? (

                  <tr>

                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No system transactions recorded yet.
                    </td>

                  </tr>

                ) : (

                  transactions.map((tx: any) => {

                    const isCredit =
                      tx.type === 'credit';

                    const isPending =
                      tx.status === 'pending';

                    const isFailed =
                      tx.status === 'failed';

                    const isReversed =
                      tx.status === 'reversed';

                    const isPosted =
                      tx.status === 'posted';

                    const isInternational =
                      tx.source === 'international';

                    const isCompleted =
                      tx.status === 'completed';

                    return (

                      <tr
                        key={`${tx.source}-${tx.id}`}
                        className="hover:bg-[#263346]/40 transition"
                      >

                        {/* User */}

                        <td className="px-6 py-4">

                          <div className="font-bold text-white">
                            {tx.userName || 'Unknown Name'}
                          </div>

                          <div className="font-mono text-[11px] text-slate-400">
                            {tx.userEmail || 'Unknown Email'}
                          </div>

                        </td>

                        {/* Account */}

                        <td className="px-6 py-4">

                          <div className="font-mono text-slate-300">
                            {tx.accountNumber || 'N/A'}
                          </div>

                          {isInternational && (

                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-violet-400">

                              <Landmark size={11} />

                              International Wire

                            </div>

                          )}

                        </td>

                        {/* Description */}

                        <td className="px-6 py-4 text-white font-medium max-w-xs">

                          <div
                            className="truncate"
                            title={tx.description}
                          >
                            {tx.description || 'System Transfer'}
                          </div>

                          {isInternational && tx.recipientName && (

                            <div className="text-[10px] text-slate-500 mt-1">
                              Recipient: {tx.recipientName}
                            </div>

                          )}

                          {isInternational && tx.bankName && (

                            <div className="text-[10px] text-slate-500 mt-1">
                              Bank: {tx.bankName}
                            </div>

                          )}

                        </td>

                        {/* Type */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              isCredit
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >

                            {isCredit ? (

                              <ArrowDownLeft size={12} />

                            ) : (

                              <ArrowUpRight size={12} />

                            )}

                            {tx.type}

                          </span>

                        </td>

                        {/* Status */}

                        <td className="px-6 py-4">

                          {isPending ? (

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">

                              <Clock3 size={12} />

                              Pending

                            </span>

                          ) : isFailed ? (

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">

                              <XCircle size={12} />

                              {isInternational ? 'Rejected' : 'Failed'}

                            </span>

                          ) : isReversed ? (

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">

                              <RotateCcw size={12} />

                              Reversed

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">

                              <CheckCircle2 size={12} />

                              {isCompleted || isPosted ? 'Completed' : tx.status}

                            </span>

                          )}

                        </td>

                        {/* Amount */}

                        <td
                          className={`px-6 py-4 font-mono font-bold whitespace-nowrap ${
                            isPending
                              ? 'text-amber-400'
                              : isCredit
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >

                          {isCredit ? '+' : '-'}

                          {Number(tx.amount).toFixed(2)}{' '}

                          {tx.currency}

                        </td>

                        {/* Timestamp */}

                        <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap">

                          <span className="inline-flex items-center gap-1.5">

                            <Clock
                              size={13}
                              className="text-slate-500"
                            />

                            {new Date(
                              tx.createdAt
                            ).toLocaleString()}

                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-6 py-4 text-right">

                          {isPending && isInternational ? (

                            <ApproveRejectTransactionButton
                              wireId={tx.id}
                            />

                          ) : isPosted && tx.source === 'ledger' ? (

                            <ReverseButton
                              transactionId={tx.id}
                            />

                          ) : isPending ? (

                            <span className="text-[10px] font-semibold text-amber-400">
                              Awaiting Review
                            </span>

                          ) : isReversed ? (

                            <span className="text-[10px] font-semibold text-purple-400">
                              Reversed
                            </span>

                          ) : isFailed ? (

                            <span className="text-[10px] font-semibold text-red-400">
                              Failed
                            </span>

                          ) : (

                            <span className="text-[10px] text-slate-500">
                              —
                            </span>

                          )}

                        </td>

                      </tr>

                    );

                  })

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}
