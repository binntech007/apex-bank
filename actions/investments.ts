'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { investments, ledgerAccounts, journalEntries, ledgerLines } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Fetch all active investments for the logged-in user 📈
export async function getUserInvestments() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userInvestments = await db
      .select()
      .from(investments)
      .where(and(
        eq(investments.userId, session.user.id),
        eq(investments.status, 'active')
      ));

    return userInvestments.map((inv) => ({
      id: inv.id,
      assetName: inv.assetName,
      symbol: inv.symbol,
      category: inv.category as 'stocks' | 'crypto' | 'bonds' | 'commodities',
      quantity: parseFloat(inv.quantity),
      purchasePrice: parseFloat(inv.purchasePrice),
      currentPrice: parseFloat(inv.currentPrice),
      totalAmount: parseFloat(inv.totalAmount),
      status: inv.status as 'active' | 'sold',
      createdAt: inv.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('Failed to fetch investments:', err);
    return [];
  }
}

// Purchase an investment asset 💰
export async function buyInvestment(formData: {
  ledgerAccountId: string;
  assetName: string;
  symbol: string;
  category: 'stocks' | 'crypto' | 'bonds' | 'commodities';
  quantity: number;
  unitPrice: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized session. Please log in.' };
    }

    const userId = session.user.id;
    const { ledgerAccountId, assetName, symbol, category, quantity, unitPrice } = formData;
    const totalCost = quantity * unitPrice;

    // 1. Check vault ownership & balance
    const [account] = await db
      .select()
      .from(ledgerAccounts)
      .where(
        and(
          eq(ledgerAccounts.id, ledgerAccountId),
          eq(ledgerAccounts.userId, userId)
        )
      );

    if (!account) {
      return { success: false, error: 'Selected funding vault was not found.' };
    }

    const currentBalance = parseFloat(account.balance);
    if (currentBalance < totalCost) {
      return {
        success: false,
        error: `Insufficient balance in ${account.currency} vault. Required: $${totalCost.toFixed(2)}, Available: $${currentBalance.toFixed(2)}.`,
      };
    }

    // 2. Perform atomic transaction 🔄
    await db.transaction(async (tx) => {
      // Deduct balance from selected vault 🏦
      await tx
        .update(ledgerAccounts)
        .set({
          balance: sql`${ledgerAccounts.balance} - ${totalCost}`,
        })
        .where(eq(ledgerAccounts.id, ledgerAccountId));

      // Log Journal Entry 📝
      const [journal] = await tx
        .insert(journalEntries)
        .values({
          idempotencyKey: crypto.randomUUID(),
          description: `Investment Purchase - ${symbol.toUpperCase()} (${assetName})`,
          status: 'posted',
        })
        .returning();

      // Log Ledger Line 📊
      await tx.insert(ledgerLines).values({
        journalEntryId: journal.id,
        ledgerAccountId: ledgerAccountId,
        type: 'debit',
        amount: totalCost.toFixed(4),
      });

      // Insert new investment record 📈
      await tx.insert(investments).values({
        userId,
        ledgerAccountId,
        assetName,
        symbol: symbol.toUpperCase(),
        category,
        quantity: quantity.toString(),
        purchasePrice: unitPrice.toFixed(2),
        currentPrice: unitPrice.toFixed(2),
        totalAmount: totalCost.toFixed(2),
        status: 'active',
      });
    });

    revalidatePath('/dashboard/investments');
    return {
      success: true,
      message: `Successfully invested $${totalCost.toFixed(2)} in ${assetName} (${symbol.toUpperCase()})!`,
    };
  } catch (err) {
    console.error('Investment purchase error:', err);
    return { success: false, error: 'Failed to complete investment purchase.' };
  }
}