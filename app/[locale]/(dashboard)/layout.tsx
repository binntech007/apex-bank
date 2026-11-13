
// app/[locale]/(dashboard)/layout.tsx

import { auth } from '@/auth';

import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { SuspensionChecker } from '@/components/dashboard/SuspensionChecker';
import { BusinessUpgradePopup } from '@/components/dashboard/BusinessUpgradePopup';

import { getBusinessUpgradeAccounts } from '@/actions/business-account';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user || {};

  // Check whether the customer needs a business account upgrade.
  const upgradeAccounts = session?.user?.id
    ? await getBusinessUpgradeAccounts()
    : [];

  const requiresUpgrade = upgradeAccounts.length > 0;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col lg:flex-row">

      {/* Real-time suspension watcher */}
      <SuspensionChecker />

      {requiresUpgrade ? (
        /*
         * UPGRADE REQUIRED
         *
         * Do not render the normal dashboard navigation
         * or dashboard page content while upgrade is required.
         */
        <BusinessUpgradePopup accounts={upgradeAccounts} />
      ) : (
        <>
          {/* Mobile Navigation */}
          <MobileNav user={user} />

          {/* Desktop Sidebar */}
          <Sidebar user={user} />

          {/* Dashboard Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </>
      )}
    </div>
  );
}
