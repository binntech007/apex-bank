
import { auth } from '@/auth';
import { db } from '@/lib/db';

import {
  ledgerAccounts,
  ledgerLines,
  journalEntries,
  internationalTransfers,
} from '@/lib/db/schema';

import {
  eq,
  desc,
  inArray,
} from 'drizzle-orm';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { ArrowLeft, Download } from 'lucide-react';

import {
  TransactionTable,
  Transaction,
} from '@/components/dashboard/TransactionTable';

// =====================================================
// TRANSACTION STATUS MAPPING
// =====================================================

function getTransactionStatus(
  status: string
): Transaction['status'] {

  switch (status) {
    case 'pending':
      return 'pending';

    case 'completed':
      return 'completed';

    case 'posted':
      return 'completed';

    case 'rejected':
      return 'rejected';

    case 'failed':
      return 'failed';

    case 'reversed':
      return 'reversed';

    default:
      return 'pending';
  }
}

// =====================================================
// CUSTOMER TRANSACTIONS PAGE
// =====================================================

export default async function TransactionsPage() {

  // =====================================================
  // 1. AUTHENTICATION
  // =====================================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Initialize translations
  const t = await getTranslations('TransactionsPage');

  // =====================================================
  // 2. FETCH CUSTOMER ACCOUNTS
  // =====================================================

  const accounts = await db
    .select({
      id: ledgerAccounts.id,
    })
    .from(ledgerAccounts)
    .where(
      eq(ledgerAccounts.userId, userId)
    );

  const userAccountIds = accounts.map(
    (account) => account.id
  );

  let transactions: Transaction[] = [];

  if (userAccountIds.length > 0) {

    // =====================================================
    // 3. FETCH POSTED LEDGER TRANSACTIONS
    // =====================================================

    const rawLedgerTransactions = await db
      .select({
        id: ledgerLines.id,

        journalEntryId: journalEntries.id,

        description: journalEntries.description,

        createdAt: ledgerLines.createdAt,

        amount: ledgerLines.amount,

        type: ledgerLines.type,

        currency: ledgerAccounts.currency,

        status: journalEntries.status,
      })
      .from(ledgerLines)
      .innerJoin(
        journalEntries,
        eq(
          ledgerLines.journalEntryId,
          journalEntries.id
        )
      )
      .innerJoin(
        ledgerAccounts,
        eq(
          ledgerLines.ledgerAccountId,
          ledgerAccounts.id
        )
      )
      .where(
        inArray(
          ledgerLines.ledgerAccountId,
          userAccountIds
        )
      )
      .orderBy(
        desc(ledgerLines.createdAt)
      );

    // =====================================================
    // 4. FORMAT LEDGER TRANSACTIONS
    // =====================================================

    const postedTransactions: Transaction[] =
      rawLedgerTransactions.map((tx) => ({
        id: tx.id,

        description:
          tx.description ||
          'Account Transaction',

        createdAt: tx.createdAt,

        amount: tx.amount,

        type: tx.type as 'debit' | 'credit',

        currency: tx.currency,

        status: getTransactionStatus(tx.status),
      }));

    // =====================================================
    // 5. FETCH INTERNATIONAL TRANSFERS
    // =====================================================

    // We fetch all statuses, not just pending.
    // This allows customers to see rejected and completed
    // international transfers as well.

    const rawInternationalTransfers = await db
      .select({
        id: internationalTransfers.id,

        journalEntryId:
          internationalTransfers.journalEntryId,

        description:
          journalEntries.description,

        createdAt:
          internationalTransfers.createdAt,

        amount:
          internationalTransfers.amount,

        currency:
          ledgerAccounts.currency,

        status:
          internationalTransfers.status,

      })
      .from(internationalTransfers)
      .innerJoin(
        journalEntries,
        eq(
          internationalTransfers.journalEntryId,
          journalEntries.id
        )
      )
      .innerJoin(
        ledgerAccounts,
        eq(
          internationalTransfers.sourceAccountId,
          ledgerAccounts.id
        )
      )
      .where(
        inArray(
          internationalTransfers.sourceAccountId,
          userAccountIds
        )
      )
      .orderBy(
        desc(internationalTransfers.createdAt)
      );

    // =====================================================
    // 6. PREVENT DUPLICATE COMPLETED TRANSFERS
    // =====================================================

    // Once an international transfer is approved,
    // a ledger debit is created using the same journal ID.
    //
    // We remove the international transfer from the
    // separate list when that ledger entry exists.

    const ledgerJournalIds = new Set(
      rawLedgerTransactions.map(
        (tx) => tx.journalEntryId
      )
    );

    const uniqueInternationalTransfers =
      rawInternationalTransfers.filter(
        (tx) =>
          !ledgerJournalIds.has(
            tx.journalEntryId
          )
      );

    // =====================================================
    // 7. FORMAT INTERNATIONAL TRANSFERS
    // =====================================================

    const internationalTransactions: Transaction[] =
      uniqueInternationalTransfers.map((tx) => {

        // Explicitly type the status.
        // This fixes the TypeScript TS2322 error.

        const status: Transaction['status'] =
          getTransactionStatus(tx.status);

        return {
          id: tx.id,

          description:
            tx.description ||
            'International Wire Transfer',

          createdAt: tx.createdAt,

          amount: tx.amount,

          type: 'debit' as const,

          currency: tx.currency,

          status,
        };
      });

    // =====================================================
    // 8. COMBINE ALL TRANSACTIONS
    // =====================================================

    transactions = [
      ...postedTransactions,
      ...internationalTransactions,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }

  // =====================================================
  // 9. CUSTOMER TRANSACTIONS PAGE UI
  // =====================================================

  return (

    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

      {/* NAVIGATION */}

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >

        <ArrowLeft size={16} />

        <span>
          {t('backToOverview')}
        </span>

      </Link>

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-white flex items-center gap-2">

            {t('title')} 📜

          </h1>

          <p className="text-xs text-slate-400 mt-1">

            {t('description')}

          </p>

        </div>

        <button
          type="button"
          className="self-start sm:self-auto px-4 py-2.5 bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/40 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition flex items-center gap-2"
        >

          <Download
            size={14}
            className="text-[#8B5CF6]"
          />

          <span>
            {t('exportCsv')}
          </span>

        </button>

      </div>

      {/* TRANSACTION SUMMARY */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-[#151C28] border border-[#263346] rounded-xl p-4">

          <p className="text-xs text-slate-400">
            Total Transactions
          </p>

          <h2 className="text-2xl font-bold text-white mt-2">
            {transactions.length}
          </h2>

        </div>

        <div className="bg-[#151C28] border border-amber-500/20 rounded-xl p-4">

          <p className="text-xs text-amber-400">
            Pending Transactions
          </p>

          <h2 className="text-2xl font-bold text-amber-400 mt-2">

            {
              transactions.filter(
                (tx) => tx.status === 'pending'
              ).length
            }

          </h2>

        </div>

        <div className="bg-[#151C28] border border-emerald-500/20 rounded-xl p-4">

          <p className="text-xs text-emerald-400">
            Completed Transactions
          </p>

          <h2 className="text-2xl font-bold text-emerald-400 mt-2">

            {
              transactions.filter(
                (tx) => tx.status === 'completed'
              ).length
            }

          </h2>

        </div>

      </div>

      {/* TRANSACTIONS TABLE */}

      <TransactionTable
        transactions={transactions}
      />

    </main>

  );
}
