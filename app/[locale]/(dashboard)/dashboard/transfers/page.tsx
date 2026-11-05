// app/dashboard/transfers/page.tsx
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { ledgerAccounts, exchangeRates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { TransferTabs } from '@/components/dashboard/TransferTabs';
import { getTranslations } from 'next-intl/server';

export default async function TransfersPage() {
  const session = await auth();

  // Protect the route 🔒
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;
  
  // 1. Initialize server-side translations 🌐
  const t = await getTranslations('TransfersPage');

  // 2. Fetch user accounts/vaults 🏦
  const accounts = await db
    .select({
      id: ledgerAccounts.id,
      name: ledgerAccounts.name,
      currency: ledgerAccounts.currency,
      balance: ledgerAccounts.balance,
    })
    .from(ledgerAccounts)
    .where(eq(ledgerAccounts.userId, userId));

  const vaults = accounts.map((acc) => ({
    ...acc,
    balance: acc.balance ?? '0.00',
  }));

  // 3. Fetch configured exchange rates 💱
  const ratesData = await db
    .select({
      fromCurrency: exchangeRates.fromCurrency,
      toCurrency: exchangeRates.toCurrency,
      rate: exchangeRates.rate,
    })
    .from(exchangeRates);

  return (
    <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('description')}
        </p>
      </div>

      {/* Pass vaults, userId, and rates down 📑 */}
      <TransferTabs vaults={vaults} userId={userId} rates={ratesData} />
    </main>
  );
}