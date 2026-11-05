import { auth } from '@/auth';
import { db } from '@/lib/db';
import { currencies, ledgerAccounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { SwapForm } from '@/components/dashboard/SwapForm';
import { RefreshCw } from 'lucide-react';

export default async function CurrencySwapPage() {
  // 1. Get the authenticated user session 👤
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  const userId = session.user.id;

  // 2. Fetch the user's active vaults from database 🏦
  const userVaults = await db
    .select({
      id: ledgerAccounts.id,
      name: ledgerAccounts.name,
      currency: ledgerAccounts.currency,
      balance: ledgerAccounts.balance,
    })
    .from(ledgerAccounts)
    .where(eq(ledgerAccounts.userId, userId));

  // 3. Fetch active currencies added by the Admin 💱
  let activeCurrencies = await db
    .select()
    .from(currencies)
    .where(eq(currencies.isActive, true));

  // 4. Seed default currencies if database table is empty 🗄️
  if (activeCurrencies.length === 0) {
    await db
      .insert(currencies)
      .values([
        { code: 'USD', name: 'US Dollar', symbol: '$', rateToUsd: '1.0' },
        { code: 'EUR', name: 'Euro', symbol: '€', rateToUsd: '0.92' },
        { code: 'GBP', name: 'British Pound', symbol: '£', rateToUsd: '0.78' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateToUsd: '1.50' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rateToUsd: '1.35' },
      ])
      .onConflictDoNothing();

    activeCurrencies = await db
      .select()
      .from(currencies)
      .where(eq(currencies.isActive, true));
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30">
          <RefreshCw size={24} />
        </div>
        <h1 className="text-2xl font-bold text-white">Instant Currency Swap</h1>
        <p className="text-xs text-slate-400">
          Convert cash balances seamlessly across multi-currency vaults.
        </p>
      </div>

      <div className="rounded-2xl border border-[#263346] bg-[#151C28] p-6 shadow-2xl">
        <SwapForm userId={userId} vaults={userVaults} activeCurrencies={activeCurrencies} />
      </div>
    </div>
  );
}