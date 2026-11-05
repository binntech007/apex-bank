'use server';

import { db } from '@/lib/db';
import { journalEntries, ledgerLines, ledgerAccounts, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addFundsToUserAccount(formData: {
  userId: string;
  vaultId: string;
  amount: string;
  description?: string;
}) {
  try {
    const numericAmount = parseFloat(formData.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return { success: false, error: 'Please enter a valid amount greater than zero.' };
    }

    if (!formData.vaultId) {
      return { success: false, error: 'Please select a target vault account.' };
    }

    // Locate the specific vault/ledger account directly using vaultId
    let [targetLedgerAccount] = await db
      .select()
      .from(ledgerAccounts)
      .where(eq(ledgerAccounts.id, formData.vaultId));

    if (!targetLedgerAccount) {
      return { success: false, error: 'Target vault ledger account does not exist.' };
    }

    // Perform atomic transaction: Add journal entry, ledger line, AND update balance 🛡️
    await db.transaction(async (tx) => {
      // Create journal entry 📝
      const [entry] = await tx
        .insert(journalEntries)
        .values({
          idempotencyKey: `admin-credit-${formData.userId}-${formData.vaultId}-${Date.now()}`,
          description: formData.description || 'Admin Balance Adjustment',
          status: 'posted',
        })
        .returning();

      // Record credit ledger line 📈
      await tx.insert(ledgerLines).values({
        journalEntryId: entry.id,
        ledgerAccountId: targetLedgerAccount.id,
        type: 'credit',
        amount: formData.amount,
      });

      // Increment cached balance on the specific ledger_account 💰
      await tx
        .update(ledgerAccounts)
        .set({
          balance: sql`${ledgerAccounts.balance} + ${formData.amount}::numeric`,
        })
        .where(eq(ledgerAccounts.id, targetLedgerAccount.id));
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    console.error('Error adding funds:', err);
    return { success: false, error: err.message || 'Failed to deposit funds.' };
  }
}