import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { 
  User, 
  CreditCard, 
  KeyRound, 
  Bell, 
  ShieldCheck, 
  ChevronRight, 
  Lock,
  Sliders,
  Code2,
  Users,
  Globe,
  ShieldAlert
} from 'lucide-react';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Initialize server-side translations 🌐
  const t = await getTranslations('SettingsPage');

  // Fetch full user record from database to get country/residency info 🌍
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  const user = dbUser || session.user;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header ⚙️ */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {t('title')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Read-Only Profile Card 👤 */}
      <section className="bg-[#151C28] border border-[#263346] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#263346] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30 flex items-center justify-center font-bold text-lg">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{user.name || t('profile.defaultName')}</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-[#0B0F17] px-3 py-1 rounded-lg border border-[#263346]">
            <Lock size={12} className="text-[#8B5CF6]" /> {t('profile.readOnlyBadge')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div>
            <label className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">
              {t('profile.fullNameLabel')}
            </label>
            <div className="bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-slate-200 font-medium">
              {user.name || t('profile.notProvided')}
            </div>
          </div>

          <div>
            <label className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">
              {t('profile.emailLabel')}
            </label>
            <div className="bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-slate-200 font-medium">
              {user.email || t('profile.notProvided')}
            </div>
          </div>

          <div>
            <label className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">
              {t('profile.countryLabel')} 🌍
            </label>
            <div className="bg-[#0B0F17] border border-[#263346] rounded-xl px-4 py-2.5 text-slate-200 font-medium flex items-center gap-2">
              <Globe size={14} className="text-[#8B5CF6]" />
              <span>{(user as any).country || t('profile.notSpecified')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Navigation Grid 🧭 */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          {t('navSectionTitle')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Transaction PIN Setup 🔐 */}
          <Link
            href="/dashboard/settings/pin"
            className="flex items-center justify-between p-5 rounded-2xl bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Transaction PIN</h4>
                <p className="text-xs text-slate-400">Set or update your 4-digit transfer security PIN</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Payment Methods 💳 */}
          <Link
            href="/dashboard/settings/payment"
            className="flex items-center justify-between p-5 rounded-2xl bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <CreditCard size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('items.paymentMethods.title')}</h4>
                <p className="text-xs text-slate-400">{t('items.paymentMethods.desc')}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Security & Password 🔑 */}
          <Link
            href="/dashboard/settings/security"
            className="flex items-center justify-between p-5 rounded-2xl bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <KeyRound size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('items.security.title')}</h4>
                <p className="text-xs text-slate-400">{t('items.security.desc')}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Notifications 🔔 */}
          <Link
            href="/dashboard/settings/notifications"
            className="flex items-center justify-between p-5 rounded-2xl bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <Bell size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('items.notifications.title')}</h4>
                <p className="text-xs text-slate-400">{t('items.notifications.desc')}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Identity Verification & Limits 🛡️ */}
          <Link
            href="/dashboard/kyc"
            className="flex items-center justify-between p-5 rounded-2xl bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('items.kyc.title')}</h4>
                <p className="text-xs text-slate-400">{t('items.kyc.desc')}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Spending & Transfer Limits 📊 */}
          <Link
            href="/dashboard/settings/limits"
            className="flex items-center justify-between p-5 rounded-2xl bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <Sliders size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('items.limits.title')}</h4>
                <p className="text-xs text-slate-400">{t('items.limits.desc')}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Granular Card Controls 💳 */}
          <Link
            href="/dashboard/settings/card-controls"
            className="flex items-center justify-between p-5 rounded-2xl bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <CreditCard size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('items.cardControls.title')}</h4>
                <p className="text-xs text-slate-400">{t('items.cardControls.desc')}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Beneficiaries & Estate Transfer 📜 */}
          <Link
            href="/dashboard/settings/beneficiaries"
            className="flex items-center justify-between p-5 rounded-2xl bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <Users size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('items.beneficiaries.title')}</h4>
                <p className="text-xs text-slate-400">{t('items.beneficiaries.desc')}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Tax & Compliance Hub 🌍 */}
          <Link
            href="/dashboard/settings/tax"
            className="flex items-center justify-between p-5 rounded-2xl bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <Globe size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('items.tax.title')}</h4>
                <p className="text-xs text-slate-400">{t('items.tax.desc')}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </Link>

          {/* API Keys & Developer Access 🔑 */}
          <Link
            href="/dashboard/settings/api-keys"
            className="flex items-center justify-between p-5 rounded-2xl bg-[#151C28] border border-[#263346] hover:border-[#8B5CF6]/50 transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition">
                <Code2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('items.apiKeys.title')}</h4>
                <p className="text-xs text-slate-400">{t('items.apiKeys.desc')}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </section>
    </div>
  );
}