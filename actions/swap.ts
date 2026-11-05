'use server';

import { db } from '@/lib/db';
import { ledgerAccounts, journalEntries, ledgerLines, exchangeRates, users } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function executeCurrencySwap(params: {
  userId: string;
  fromAccountId: string;
  toCurrency: string;
  fromAmount: string;
}) {
  try {
    const amountToDeduct = parseFloat(params.fromAmount);
    if (isNaN(amountToDeduct) || amountToDeduct <= 0) {
      return { success: false, error: 'Please enter a valid amount.' };
    }

    // 1. Fetch Source Vault & Verify Balance 💳
    const [fromAccount] = await db
      .select()
      .from(ledgerAccounts)
      .where(and(eq(ledgerAccounts.id, params.fromAccountId), eq(ledgerAccounts.userId, params.userId)));

    if (!fromAccount) return { success: false, error: 'Source vault not found.' };

    const currentBalance = parseFloat(fromAccount.balance || '0');
    if (currentBalance < amountToDeduct) {
      return { success: false, error: `Insufficient balance. You have $${currentBalance.toFixed(2)} available.` };
    }

    if (fromAccount.currency === params.toCurrency) {
      return { success: false, error: 'Source and destination currencies must be different.' };
    }

    // 2. Look up Exchange Rate configured by Admin 📊
    const [rateRecord] = await db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, fromAccount.currency),
          eq(exchangeRates.toCurrency, params.toCurrency)
        )
      );

    if (!rateRecord) {
      return { 
        success: false, 
        error: `No exchange rate configured for ${fromAccount.currency} ➔ ${params.toCurrency}. Please set one up in Admin Settings.` 
      };
    }

    const rate = parseFloat(rateRecord.rate);
    const convertedAmount = (amountToDeduct * rate).toFixed(2);

    // 3. Find or Auto-Create Destination Vault 🏦
    let [toAccount] = await db
      .select()
      .from(ledgerAccounts)
      .where(and(eq(ledgerAccounts.userId, params.userId), eq(ledgerAccounts.currency, params.toCurrency as any)));

    if (!toAccount) {
      const [user] = await db.select().from(users).where(eq(users.id, params.userId));
      if (!user) return { success: false, error: 'User record not found.' };

      [toAccount] = await db
        .insert(ledgerAccounts)
        .values({
          userId: params.userId,
          accountNumber: `${user.accountNumber || 'ACC'}-${params.toCurrency}`,
          name: `${params.toCurrency} Vault`,
          category: 'liability',
          currency: params.toCurrency as any,
          balance: '0.00',
        })
        .returning();
    }

    // 4. Atomic Double-Entry Database Transaction 🛡️
    await db.transaction(async (tx) => {
      const [entry] = await tx
        .insert(journalEntries)
        .values({
          idempotencyKey: `swap-${params.userId}-${Date.now()}`,
          description: `Currency Swap: ${params.fromAmount} ${fromAccount.currency} to ${convertedAmount} ${params.toCurrency}`,
          status: 'posted',
        })
        .returning();

      // Ledger lines 📝
      await tx.insert(ledgerLines).values([
        {
          journalEntryId: entry.id,
          ledgerAccountId: fromAccount.id,
          type: 'debit',
          amount: params.fromAmount,
        },
        {
          journalEntryId: entry.id,
          ledgerAccountId: toAccount.id,
          type: 'credit',
          amount: convertedAmount,
        },
      ]);

      // Deduct from Source Balance ➖
      await tx
        .update(ledgerAccounts)
        .set({
          balance: sql`${ledgerAccounts.balance} - ${params.fromAmount}::numeric`,
        })
        .where(eq(ledgerAccounts.id, fromAccount.id));

      // Credit Target Balance ➕
      await tx
        .update(ledgerAccounts)
        .set({
          balance: sql`${ledgerAccounts.balance} + ${convertedAmount}::numeric`,
        })
        .where(eq(ledgerAccounts.id, toAccount.id));
    });

    revalidatePath('/dashboard');
    return { success: true, convertedAmount, targetCurrency: params.toCurrency };
  } catch (err: any) {
    console.error('Swap execution error:', err);
    return { success: false, error: err.message || 'Currency swap failed.' };
  }
}