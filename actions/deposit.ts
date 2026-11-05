'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { ledgerAccounts, journalEntries, ledgerLines } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function depositUserFunds(
  targetAccountNumber: string,
  currency: string,
  amount: number
) {
  try {
    const session = await auth();

    // 1. Check if the user is authenticated and has admin rights 🛡️
    if (!session?.user?.id || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required.' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Deposit amount must be greater than zero.' };
    }

    // 2. Execute double-entry ledger posting inside a transaction ⚡
    await db.transaction(async (tx) => {
      // Find target user vault
      const [userVault] = await tx
        .select()
        .from(ledgerAccounts)
        .where(
          and(
            eq(ledgerAccounts.accountNumber, targetAccountNumber),
            eq(ledgerAccounts.currency, currency as any)
          )
        );

      if (!userVault) {
        throw new Error(`Vault not found for account ${targetAccountNumber} (${currency})`);
      }

      // Find or create System Treasury Account
      let [treasury] = await tx
        .select()
        .from(ledgerAccounts)
        .where(eq(ledgerAccounts.accountNumber, `TREASURY_${currency}`));

      if (!treasury) {
        const [newTreasury] = await tx
          .insert(ledgerAccounts)
          .values({
            userId: session.user.id, // 👈 Added: Links the system treasury account to the acting admin
            accountNumber: `TREASURY_${currency}`,
            name: `System Treasury (${currency})`,
            category: 'asset',
            currency: currency as any,
          })
          .returning();
        treasury = newTreasury;
      }

      // Create Journal Entry 📑
      const idempotencyKey = `admin_deposit_${crypto.randomUUID()}`;
      const [entry] = await tx
        .insert(journalEntries)
        .values({
          idempotencyKey,
          description: `Admin Deposit: Credited ${amount} ${currency} to ${targetAccountNumber}`,
          status: 'posted',
        })
        .returning();

      // Post Double-Entry Lines: Debit Treasury (-), Credit User Vault (+) 💰
      await tx.insert(ledgerLines).values([
        {
          journalEntryId: entry.id,
          ledgerAccountId: treasury.id,
          amount: amount.toFixed(4),
          type: 'debit',
        },
        {
          journalEntryId: entry.id,
          ledgerAccountId: userVault.id,
          amount: amount.toFixed(4),
          type: 'credit',
        },
      ]);
    });

    revalidatePath('/dashboard');
    revalidatePath('/admin');

    return { success: true, message: `Successfully deposited ${amount} ${currency}.` };
  } catch (err: any) {
    return { success: false, error: err.message || 'Deposit failed.' };
  }
}