
import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
  ledgerAccounts,
  ledgerLines,
  journalEntries,
} from '@/lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getKycStatus } from '@/actions/kyc';
import { getBusinessUpgradeAccounts } from '@/actions/business-account';

// Dashboard Components
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { VaultSection } from '@/components/dashboard/VaultSection';
import {
  TransactionTable,
  Transaction,
} from '@/components/dashboard/TransactionTable';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { BusinessUpgradePopup } from '@/components/dashboard/BusinessUpgradePopup';

export default async function DashboardOverviewPage() {
  // 1. Authenticate customer
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // 2. Fetch live KYC status
  const kycRecord = await getKycStatus(userId);
  const kycStatus = kycRecord?.status || 'unverified';

  // 3. Fetch customer's multi-currency accounts
  const accounts = await db
    .select({
      id: ledgerAccounts.id,
      accountNumber: ledgerAccounts.accountNumber,
      name: ledgerAccounts.name,
      currency: ledgerAccounts.currency,
      balance: ledgerAccounts.balance,
    })
    .from(ledgerAccounts)
    .where(eq(ledgerAccounts.userId, userId));

  const vaults = accounts.map((acc) => ({
    ...acc,
    balance: acc.balance ?? '0.00',
    numericBalance: Number(acc.balance || '0'),
  }));

  const userAccountIds = vaults.map((account) => account.id);

  // 4. Fetch recent transaction entries
  let recentTransactions: Transaction[] = [];

  if (userAccountIds.length > 0) {
    const rawTx = await db
      .select({
        id: ledgerLines.id,
        description: journalEntries.description,
        createdAt: ledgerLines.createdAt,
        amount: ledgerLines.amount,
        type: ledgerLines.type,
        currency: ledgerAccounts.currency,
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
      .where(inArray(ledgerLines.ledgerAccountId, userAccountIds))
      .orderBy(desc(ledgerLines.createdAt))
      .limit(10);

    recentTransactions = rawTx.map((tx) => ({
      ...tx,
      type: tx.type as 'debit' | 'credit',
    }));
  }

  // 5. Check eligible Savings Accounts for Business Account upgrade
  const accountsNeedingUpgrade =
    await getBusinessUpgradeAccounts();

  // 6. Render dashboard
  return (
    <main className="relative mx-auto w-full max-w-7xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">

      {/* Welcome Header */}
      <DashboardHeader
        userName={session.user.name}
        kycStatus={kycStatus}
      />

      {/* Multi-Currency Vault Cards */}
      <VaultSection
        userId={userId}
        vaults={vaults}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Ledger Transactions */}
      <TransactionTable
        transactions={recentTransactions}
      />

      {/* Business Account Upgrade Popup */}
      <BusinessUpgradePopup
        accounts={accountsNeedingUpgrade}
      />

    </main>
  );
}
