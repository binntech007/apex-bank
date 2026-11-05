'use server';

import { db } from '@/lib/db';
import { ledgerAccounts, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Helper to generate a 10-digit account number 🔢
function generate10DigitAccountNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export async function createNewVault(userId: string, currency: string) {
  try {
    const cleanCurrency = currency.trim().toUpperCase();

    // 1. Check if user already has a vault in this currency 🛡️
    const [existingVault] = await db
      .select()
      .from(ledgerAccounts)
      .where(
        and(
          eq(ledgerAccounts.userId, userId),
          eq(ledgerAccounts.currency, cleanCurrency as any)
        )
      );

    if (existingVault) {
      return {
        success: false,
        error: `You already have an active ${cleanCurrency} Vault.`,
      };
    }

    // 2. Fetch user details 👤
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return { success: false, error: 'User not found.' };

    // 3. Generate a dedicated 10-digit account number 🏦
    const newAccountNumber = generate10DigitAccountNumber();

    // 4. Create the new vault account 🏦
    await db.insert(ledgerAccounts).values({
      userId,
      accountNumber: newAccountNumber,
      name: `${cleanCurrency} Vault`,
      category: 'liability',
      currency: cleanCurrency as any,
      balance: '0.00',
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('Error creating vault:', err);
    return { success: false, error: err.message || 'Failed to create vault.' };
  }
}