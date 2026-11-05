import { auth } from '@/auth';
import { db } from '@/lib/db';
import { bills } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Receipt, Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { AddBillModal } from '@/components/dashboard/AddBillModal';

export default async function BillsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Initialize server-side translations 🌐
  const t = await getTranslations('BillsPage');

  const userBills = await db
    .select()
    .from(bills)
    .where(eq(bills.userId, session.user.id))
    .orderBy(desc(bills.dueDate));

  return (
    <main className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Back Link & Header Navigation 🔙 */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={16} />
          <span>{t('backToDashboard')}</span>
        </Link>
        <AddBillModal />
      </div>

      {/* Page Title 📄 */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">{t('title')}</h1>
        <p className="text-xs text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Bills Overview Card 📊 */}
      <div className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t('activeObligations')}
        </h3>

        {userBills.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <Receipt size={24} />
            </div>
            <p className="text-sm font-semibold text-white">{t('empty.title')}</p>
            <p className="text-xs text-slate-400">{t('empty.description')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#263346]">
            {userBills.map((bill) => {
              const isPaid = bill.status === 'paid';
              const isOverdue = bill.status === 'overdue';

              return (
                <div key={bill.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                      isPaid 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : isOverdue 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                    }`}>
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{bill.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {t('dueDate')}: {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">
                      {bill.currency} {parseFloat(bill.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 mt-1">
                        <CheckCircle2 size={10} /> {t('status.paid')}
                      </span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 mt-1">
                        <AlertCircle size={10} /> {t('status.overdue')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mt-1">
                        <Clock size={10} /> {t('status.pending')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}