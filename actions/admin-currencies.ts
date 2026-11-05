// actions/admin-currencies.ts
'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { currencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addCurrency(code: string, name: string, symbol: string, rateToUsd: number) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  await db.insert(currencies).values({
    code: code.toUpperCase(),
    name,
    symbol,
    rateToUsd: rateToUsd.toString(),
    isActive: true,
  }).onConflictDoUpdate({
    target: currencies.code,
    set: { name, symbol, rateToUsd: rateToUsd.toString(), isActive: true }
  });

  revalidatePath('/admin/currencies');
  revalidatePath('/dashboard/transfers/swap');
  return { success: true };
}

export async function toggleCurrencyStatus(code: string, isActive: boolean) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  await db.update(currencies).set({ isActive }).where(eq(currencies.code, code));
  revalidatePath('/admin/currencies');
  revalidatePath('/dashboard/transfers/swap');
  return { success: true };
}