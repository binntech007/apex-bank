
import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
  ledgerAccounts,
  ledgerLines,
  journalEntries,
  internationalTransfers,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import { DownloadTransactionPdf } from '@/components/dashboard/DownloadTransactionPdf';

interface TransactionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'posted'
  | 'rejected'
  | 'failed'
  | 'reversed';

interface TransactionDetails {
  id: string;
  amount: string;
  type: 'debit' | 'credit';
  createdAt: Date;
  description: string;
  journalId: string | null;
  currency: string;
  accountName: string;
  accountNumber: string;
  status: TransactionStatus;
  source: 'ledger' | 'international';
}

// --------------------------------------------------
// APEX VAULT LOGO
// --------------------------------------------------

function ApexLogo() {
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="apexGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        <linearGradient
          id="vaultGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>

      <path
        d="M100 15 L165 45 V105 C165 150 100 180 100 180 C100 180 35 150 35 105 V45 L100 15 Z"
        stroke="url(#apexGrad)"
        strokeWidth="8"
        fill="#151C28"
      />

      <path
        d="M100 45 L135 125 H116 L100 88 L84 125 H65 L100 45 Z"
        fill="url(#apexGrad)"
      />

      <path
        d="M75 100 L100 150 L125 100 L112 100 L100 124 L88 100 H75 Z"
        fill="url(#vaultGrad)"
      />
    </svg>
  );
}

// --------------------------------------------------
// TRANSACTION STATUS BADGE
// --------------------------------------------------

function StatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400">
          <Clock3 size={15} />
          Pending Approval
        </span>
      );

    case 'rejected':
    case 'failed':
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400">
          <XCircle size={15} />
          {status === 'rejected' ? 'Rejected' : 'Failed'}
        </span>
      );

    case 'reversed':
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-400">
          <XCircle size={15} />
          Reversed
        </span>
      );

    case 'completed':
    case 'posted':
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
          <CheckCircle2 size={15} />
          Completed
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-500/20 bg-slate-500/10 px-4 py-2 text-xs font-semibold text-slate-400">
          Unknown Status
        </span>
      );
  }
}

// --------------------------------------------------
// TRANSACTION DETAIL PAGE
// --------------------------------------------------

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;

  let tx: TransactionDetails | undefined;

  // 1. CHECK LEDGER TRANSACTIONS

  const [ledgerTransaction] = await db
    .select({
      id: ledgerLines.id,
      amount: ledgerLines.amount,
      type: ledgerLines.type,
      createdAt: ledgerLines.createdAt,
      description: journalEntries.description,
      journalId: journalEntries.id,
      currency: ledgerAccounts.currency,
      accountName: ledgerAccounts.name,
      accountNumber: ledgerAccounts.accountNumber,
      status: journalEntries.status,
    })
    .from(ledgerLines)
    .innerJoin(
      journalEntries,
      eq(ledgerLines.journalEntryId, journalEntries.id)
    )
    .innerJoin(
      ledgerAccounts,
      eq(ledgerLines.ledgerAccountId, ledgerAccounts.id)
    )
    .where(
      and(
        eq(ledgerLines.id, id),
        eq(ledgerAccounts.userId, session.user.id)
      )
    )
    .limit(1);

  if (ledgerTransaction) {
    tx = {
      id: ledgerTransaction.id,
      amount: ledgerTransaction.amount ?? '0',
      type: ledgerTransaction.type as 'debit' | 'credit',
      createdAt: ledgerTransaction.createdAt,
      description:
        ledgerTransaction.description ?? 'Account transaction',
      journalId: ledgerTransaction.journalId,
      currency: ledgerTransaction.currency,
      accountName: ledgerTransaction.accountName,
      accountNumber: ledgerTransaction.accountNumber,
      status: ledgerTransaction.status as TransactionStatus,
      source: 'ledger',
    };
  }

  // 2. CHECK INTERNATIONAL TRANSFERS
  // Pending and rejected transfers may not have ledger lines.

  if (!tx) {
    const [transfer] = await db
      .select({
        id: internationalTransfers.id,
        amount: internationalTransfers.amount,
        createdAt: internationalTransfers.createdAt,
        recipientName: internationalTransfers.recipientName,
        bankName: internationalTransfers.bankName,
        status: internationalTransfers.status,
        journalId: internationalTransfers.journalEntryId,
        currency: ledgerAccounts.currency,
        accountName: ledgerAccounts.name,
        accountNumber: ledgerAccounts.accountNumber,
      })
      .from(internationalTransfers)
      .innerJoin(
        ledgerAccounts,
        eq(
          internationalTransfers.sourceAccountId,
          ledgerAccounts.id
        )
      )
      .where(
        and(
          eq(internationalTransfers.id, id),
          eq(ledgerAccounts.userId, session.user.id)
        )
      )
      .limit(1);

    if (transfer) {
      tx = {
        id: transfer.id,
        amount: transfer.amount ?? '0',
        type: 'debit',
        createdAt: transfer.createdAt,
        description: `International transfer to ${transfer.recipientName} - ${transfer.bankName}`,
        journalId: transfer.journalId,
        currency: transfer.currency,
        accountName: transfer.accountName,
        accountNumber: transfer.accountNumber,
        status: transfer.status as TransactionStatus,
        source: 'international',
      };
    }
  }

  // 3. TRANSACTION NOT FOUND

  if (!tx) {
    notFound();
  }

  // 4. FORMAT VALUES

  const isCredit = tx.type === 'credit';

  const numericAmount = Number.parseFloat(tx.amount || '0');

  const formattedAmount = `${
    isCredit ? '+' : '-'
  }${tx.currency} ${numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedDate = new Date(tx.createdAt).toLocaleString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const maskedAccountNumber = tx.accountNumber
    ? `****${tx.accountNumber.slice(-4)}`
    : 'Not available';

  const isPending = tx.status === 'pending';

  const isSuccessful =
    tx.status === 'completed' || tx.status === 'posted';

  const isRejected =
    tx.status === 'rejected' || tx.status === 'failed';

  // 5. PAGE UI

  return (
    <main className="min-h-screen w-full bg-[#080d19] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">

        {/* NAVIGATION AND DOWNLOAD */}

        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Transactions
          </Link>

          <DownloadTransactionPdf
            reference={tx.id}
            amount={tx.amount}
            currency={tx.currency}
            description={tx.description}
            accountName={tx.accountName}
            accountNumber={maskedAccountNumber}
            transactionType={
              tx.source === 'international'
                ? 'International Transfer'
                : tx.type
            }
            status={tx.status}
            createdAt={formattedDate}
          />
        </div>

        {/* MAIN RECEIPT CARD */}

        <div className="overflow-hidden rounded-2xl border border-[#263346] bg-[#151C28] shadow-2xl">

          {/* HEADER */}

          <div className="border-b border-[#263346] px-6 py-6 sm:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4">

              <div className="flex items-center gap-3">
                <ApexLogo />

                <div>
                  <h1 className="text-lg font-bold tracking-wide text-white">
                    Apex Vault
                  </h1>

                  <p className="text-xs font-medium uppercase tracking-wider text-[#A78BFA]">
                    Private Wealth 
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                  Transaction Receipt
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Customer transaction record
                </p>
              </div>
            </div>
          </div>

          {/* DEMO NOTICE */}

          <div className="mx-6 mt-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 sm:mx-10">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-amber-400">
              transaction receipt
            </p>

            <p className="mt-1 text-center text-xs leading-5 text-amber-300">
              This document represents simulated activity in this
              application. It is a bank statement
              or proof of payment.
            </p>
          </div>

          {/* AMOUNT AND STATUS */}

          <div className="px-6 py-10 text-center sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Transaction Amount
            </p>

            <h2
              className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${
                isCredit ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {formattedAmount}
            </h2>

            <div className="mt-5 flex justify-center">
              <StatusBadge status={tx.status} />
            </div>

            {isPending && (
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-amber-400">
                This transfer has been submitted and is awaiting
                banking review. Its status will update
                when the review is complete.
              </p>
            )}

            {isSuccessful && (
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-emerald-400">
                This transaction has been processed in the
                demo application.
              </p>
            )}

            {isRejected && (
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-red-400">
                This transaction was not completed. Please refer
                to the transaction status for its current outcome.
              </p>
            )}

            {tx.status === 'reversed' && (
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-purple-400">
                This transaction has been marked as reversed.
              </p>
            )}
          </div>

          {/* TRANSACTION INFORMATION */}

          <div className="border-t border-[#263346] px-6 py-7 sm:px-10">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-white">
                Transaction Information
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Details associated with this transaction.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#263346]">

              <DetailRow
                label="Transaction Reference"
                value={tx.id}
                mono
              />

              <DetailRow
                label="Transaction Type"
                value={
                  tx.source === 'international'
                    ? 'International Transfer'
                    : isCredit
                      ? 'Credit'
                      : 'Debit'
                }
              />

              <DetailRow
                label="Description / Memo"
                value={tx.description}
              />

              <DetailRow
                label="Account Name"
                value={tx.accountName}
              />

              <DetailRow
                label="Account Number"
                value={maskedAccountNumber}
              />

              <DetailRow
                label="Currency"
                value={tx.currency}
              />

              <DetailRow
                label="Transaction Date"
                value={formattedDate}
              />

              <DetailRow
                label="Transaction Status"
                value={tx.status.toUpperCase()}
                last
              />

            </div>
          </div>

          {/* SECURITY FOOTER */}

          <div className="border-t border-[#263346] bg-[#0B0F17] px-6 py-5 sm:px-10">
            <div className="flex flex-wrap items-center justify-between gap-3">

              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck
                  size={18}
                  className="text-[#A78BFA]"
                />

                <span className="text-xs font-semibold">
                  Transaction Record
                </span>
              </div>

              <span className="text-xs text-slate-400">
                {tx.journalId
                  ? `Journal reference: ${tx.journalId.slice(0, 8)}`
                  : 'Journal posting pending'}
              </span>
            </div>

            <p className="mt-4 text-center text-[10px] leading-5 text-slate-500">
               
            financial transaction Receipt.
            </p>
          </div>
        </div>

        {/* BOTTOM DOWNLOAD ACTION */}

        <div className="flex flex-col items-center gap-3 pb-6 text-center print:hidden">
          <p className="text-xs text-slate-400">
            Download a PDF copy of this transaction record.
          </p>

          <DownloadTransactionPdf
            reference={tx.id}
            amount={tx.amount}
            currency={tx.currency}
            description={tx.description}
            accountName={tx.accountName}
            accountNumber={maskedAccountNumber}
            transactionType={
              tx.source === 'international'
                ? 'International Transfer'
                : tx.type
            }
            status={tx.status}
            createdAt={formattedDate}
          />
        </div>
      </div>
    </main>
  );
}

// --------------------------------------------------
// REUSABLE TRANSACTION DETAIL ROW
// --------------------------------------------------

function DetailRow({
  label,
  value,
  mono = false,
  last = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-[220px_1fr] sm:items-center ${
        !last ? 'border-b border-[#263346]' : ''
      }`}
    >
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p
        className={`break-all text-sm font-semibold text-slate-200 ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value || 'Not available'}
      </p>
    </div>
  );
}
