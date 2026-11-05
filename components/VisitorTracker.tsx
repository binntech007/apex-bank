// components/VisitorTracker.tsx
'use client';

import { useEffect } from 'react';
import { trackVisitor } from '@/actions/admin';
import { usePathname } from 'next/navigation';

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Record visit on route change
    trackVisitor(pathname);
  }, [pathname]);

  return null;
}