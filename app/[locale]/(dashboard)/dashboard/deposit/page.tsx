import { auth } from '@/auth';
import { db } from '@/lib/db';
import { ledgerAccounts, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { DepositForm } from '@/components/dashboard/DepositForm';

export default async function DepositPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const t = await getTranslations('DepositPage');

  // Fetch user vaults from database
  const userVaults = await db
    .select()
    .from(ledgerAccounts)
    .where(eq(ledgerAccounts.userId, session.user.id));

  return (
    <main className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Back Link */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        <span>{t('backToDashboard')}</span>
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">{t('title')}</h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Renders the interactive layout */}
      <DepositForm vaults={userVaults} userId={session.user.id} />
    </main>
  );
}