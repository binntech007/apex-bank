
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  ChevronRight,
  Clock3,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

// =====================================================
// TRANSACTION INTERFACE
// =====================================================

export interface Transaction {
  id: string;
  description: string;
  createdAt: Date;
  amount: string;
  type: 'debit' | 'credit';
  currency: string;

  status?:
    | 'pending'
    | 'posted'
    | 'completed'
    | 'failed'
    | 'rejected'
    | 'reversed';
}

interface TransactionTableProps {
  transactions: Transaction[];
}

// =====================================================
// FORMAT CURRENCY
// =====================================================

function formatCurrency(
  amount: number,
  currency: string
) {
  const symbolMap: Record<string, string> = {
    USD: '$',
    NGN: '₦',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    ZAR: 'R',
  };

  const symbol = symbolMap[currency] || currency;

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// =====================================================
// STATUS BADGE
// =====================================================

function TransactionStatus({
  status,
}: {
  status?: Transaction['status'];
}) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock3 size={12} />
          Pending
        </span>
      );

    case 'completed':
    case 'posted':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={12} />
          Completed
        </span>
      );

    case 'rejected':
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle size={12} />
          {status === 'rejected' ? 'Rejected' : 'Failed'}
        </span>
      );

    case 'reversed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <RotateCcw size={12} />
          Reversed
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
          Unknown
        </span>
      );
  }
}

// =====================================================
// TRANSACTION TABLE
// =====================================================

export function TransactionTable({
  transactions,
}: TransactionTableProps) {
  const t = useTranslations('TransactionTable');

  return (
    <div className="space-y-4">

      {/* TABLE HEADER */}

      <div className="flex items-center justify-between">

        <h2 className="text-lg font-bold text-white">
          {t('title')}
        </h2>

        <Link
          href="/dashboard/transactions"
          className="text-xs font-semibold text-[#A78BFA] hover:underline"
        >
          {t('viewAll')}
        </Link>

      </div>

      {/* TABLE CONTAINER */}

      <div className="rounded-2xl border border-[#263346] bg-[#151C28] shadow-sm overflow-hidden">

        {transactions.length === 0 ? (

          // EMPTY STATE

          <div className="p-12 text-center text-slate-500">

            <CreditCard
              size={32}
              className="mx-auto mb-3 text-slate-600"
            />

            <p className="font-semibold text-slate-300 text-sm">
              {t('emptyState.title')}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {t('emptyState.description')}
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              {/* TABLE HEADERS */}

              <thead className="bg-[#0B0F17] text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#263346]">

                <tr>

                  <th className="px-6 py-4">
                    {t('headers.description')}
                  </th>

                  <th className="px-6 py-4">
                    {t('headers.type')}
                  </th>

                  <th className="px-6 py-4">
                    {t('headers.date')}
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    {t('headers.amount')}
                  </th>

                  <th className="px-4 py-4 w-10"></th>

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody className="divide-y divide-[#263346]">

                {transactions.map((tx) => {

                  const isCredit =
                    tx.type === 'credit';

                  const isPending =
                    tx.status === 'pending';

                  const isRejected =
                    tx.status === 'rejected' ||
                    tx.status === 'failed';

                  const isReversed =
                    tx.status === 'reversed';

                  const amountVal =
                    Number(tx.amount);

                  const transactionUrl =
                    `/dashboard/transactions/${tx.id}`;

                  return (

                    <tr
                      key={tx.id}
                      className="group hover:bg-[#263346]/40 transition"
                    >

                      {/* DESCRIPTION */}

                      <td className="px-6 py-4 font-semibold text-white">

                        <Link
                          href={transactionUrl}
                          className="flex items-center gap-3"
                        >

                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isPending
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : isRejected
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : isReversed
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : isCredit
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >

                            {isPending ? (
                              <Clock3 size={16} />
                            ) : isRejected ? (
                              <XCircle size={16} />
                            ) : isReversed ? (
                              <RotateCcw size={16} />
                            ) : isCredit ? (
                              <ArrowDownLeft size={16} />
                            ) : (
                              <ArrowUpRight size={16} />
                            )}

                          </div>

                          <span className="group-hover:text-[#A78BFA] transition">
                            {tx.description}
                          </span>

                        </Link>

                      </td>

                      {/* TRANSACTION TYPE */}

                      <td className="px-6 py-4">

                        <Link href={transactionUrl}>

                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                              isCredit
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >

                            {isCredit
                              ? t('types.credit')
                              : t('types.debit')}

                          </span>

                        </Link>

                      </td>

                      {/* DATE */}

                      <td className="px-6 py-4 text-slate-400 text-xs font-mono">

                        <Link href={transactionUrl}>

                          {new Date(
                            tx.createdAt
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}

                        </Link>

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <Link href={transactionUrl}>
                          <TransactionStatus
                            status={tx.status}
                          />
                        </Link>

                      </td>

                      {/* AMOUNT */}

                      <td
                        className={`px-6 py-4 font-bold text-right font-mono whitespace-nowrap ${
                          isPending
                            ? 'text-amber-400'
                            : isRejected
                            ? 'text-red-400'
                            : isCredit
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}
                      >

                        <Link href={transactionUrl}>

                          {isCredit ? '+' : '-'}{' '}

                          {formatCurrency(
                            amountVal,
                            tx.currency
                          )}

                        </Link>

                      </td>

                      {/* ARROW */}

                      <td className="px-4 py-4 text-right text-slate-500 group-hover:text-white transition">

                        <Link href={transactionUrl}>
                          <ChevronRight size={16} />
                        </Link>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}
