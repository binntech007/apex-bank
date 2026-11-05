import { auth } from '@/auth';
import { db } from '@/lib/db';
import { ledgerAccounts, ledgerLines, journalEntries } from '@/lib/db/schema';
import { eq, desc, or } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getKycStatus } from '@/actions/kyc';

// Modular UI Components 🧩
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { VaultSection } from '@/components/dashboard/VaultSection';
import { TransactionTable, Transaction } from '@/components/dashboard/TransactionTable';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default async function DashboardOverviewPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // 1. Fetch live KYC status from kycVerifications table 🛡️
  const kycRecord = await getKycStatus(userId);
  const kycStatus = kycRecord?.status || 'unverified';

  // 2. Fetch multi-currency vaults with balances 🏦
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
    numericBalance: parseFloat(acc.balance || '0'),
  }));

  const userAccountIds = vaults.map((v) => v.id);

  // 3. Fetch recent transaction entries 📊
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
      .innerJoin(journalEntries, eq(ledgerLines.journalEntryId, journalEntries.id))
      .innerJoin(ledgerAccounts, eq(ledgerLines.ledgerAccountId, ledgerAccounts.id))
      .where(or(...userAccountIds.map((id) => eq(ledgerLines.ledgerAccountId, id))))
      .orderBy(desc(ledgerLines.createdAt))
      .limit(10);

    recentTransactions = rawTx.map((tx) => ({
      ...tx,
      type: tx.type as 'debit' | 'credit',
    }));
  }

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Welcome Header Component 👤 */}
      <DashboardHeader
        userName={session.user.name}
        kycStatus={kycStatus}
      />

      {/* Multi-Currency Vault Cards Section 🏦 */}
      <VaultSection userId={userId} vaults={vaults} />

      {/* Quick Actions Component ⚡ */}
       <QuickActions />

      {/* Recent Ledger Transactions Table Component 📑 */}
      <TransactionTable transactions={recentTransactions} />
    </main>
  );
}