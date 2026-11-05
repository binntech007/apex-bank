// actions/auth.ts
'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function checkUserSuspension() {
  const session = await auth();
  if (!session?.user?.id) return { suspended: false };

  const [dbUser] = await db
    .select({ isSuspended: users.isSuspended })
    .from(users)
    .where(eq(users.id, session.user.id));

  return { suspended: !!dbUser?.isSuspended };
}