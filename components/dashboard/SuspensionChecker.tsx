// components/dashboard/SuspensionChecker.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from '@/lib/i18n/routing';
import { checkUserSuspension } from '@/actions/auth';
import { signOut } from 'next-auth/react';

export function SuspensionChecker() {
  const pathname = usePathname();

  useEffect(() => {
    async function verifySuspension() {
      try {
        const result = await checkUserSuspension();
        if (result.suspended) {
          // Client-side signOut safely clears cookies and redirects
          await signOut({ callbackUrl: '/login?error=AccountSuspended' });
        }
      } catch (error) {
        // Fail silently on network blips
      }
    }

    verifySuspension();
  }, [pathname]); // 🚀 Triggers instantly whenever the pathname changes (user clicks a link)

  return null;
}