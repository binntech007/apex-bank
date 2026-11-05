'use server';

import { db } from '@/lib/db';
import { exchangeRates } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function setExchangeRate(fromCurrency: string, toCurrency: string, rate: string) {
  try {
    const from = fromCurrency.trim().toUpperCase();
    const to = toCurrency.trim().toUpperCase();

    const existing = await db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, from),
          eq(exchangeRates.toCurrency, to)
        )
      );

    if (existing.length > 0) {
      await db
        .update(exchangeRates)
        .set({ rate, updatedAt: new Date() })
        .where(eq(exchangeRates.id, existing[0].id));
    } else {
      await db.insert(exchangeRates).values({
        fromCurrency: from,
        toCurrency: to,
        rate,
      });
    }

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAllExchangeRates() {
  try {
    const rates = await db
      .select()
      .from(exchangeRates)
      .orderBy(desc(exchangeRates.updatedAt));
    return { success: true, data: rates };
  } catch (err: any) {
    return { success: false, data: [] };
  }
}