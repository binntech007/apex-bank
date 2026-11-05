// actions/transfers.ts
'use server';

import { db } from '@/lib/db';
import { ledgerAccounts, journalEntries, ledgerLines, exchangeRates, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

interface TransferParams {
  senderUserId: string;
  senderAccountId: string;
  targetAccountId?: string;
  recipientAccountNumber?: string;
  amount: number;
  description?: string;
  pin: string; // 🔐 Mandatory transaction PIN parameter
}

export type TransferResult =
  | { success: true; message: string; ledgerLineId: string; error?: never }
  | { success: false; error: string; message?: never; ledgerLineId?: never };

export async function executeInternalTransfer({
  senderUserId,
  senderAccountId,
  targetAccountId,
  recipientAccountNumber,
  amount,
  description = 'Transfer',
  pin,
}: TransferParams): Promise<TransferResult> {
  try {
    if (amount <= 0) {
      return { success: false, error: 'Transfer amount must be greater than zero.' };
    }

    if (!pin || pin.length !== 4) {
      return { success: false, error: 'Please enter a valid 4-digit transaction PIN.' };
    }

    // 0. Verify User Transaction PIN First 🔐
    const [senderUser] = await db
      .select({ pin: users.pin })
      .from(users)
      .where(eq(users.id, senderUserId));

    if (!senderUser || !senderUser.pin) {
      return { success: false, error: 'Transaction PIN not configured. Please set your PIN in settings.' };
    }

    const isPinValid = await bcrypt.compare(pin, senderUser.pin);
    if (!isPinValid) {
      return { success: false, error: 'Incorrect transaction PIN.' };
    }

    return await db.transaction(async (tx) => {
      // 1. Fetch Sender Vault 💳
      const [senderAccount] = await tx
        .select()
        .from(ledgerAccounts)
        .where(eq(ledgerAccounts.id, senderAccountId));

      if (!senderAccount || senderAccount.userId !== senderUserId) {
        return { success: false, error: 'Source vault account not found or unauthorized.' };
      }

      const currentSenderBalance = parseFloat(senderAccount.balance || '0');
      if (currentSenderBalance < amount) {
        return { success: false, error: 'Insufficient balance for this transfer.' };
      }

      // 2. Fetch Recipient Vault 🎯
      let recipientAccount;

      if (targetAccountId) {
        [recipientAccount] = await tx
          .select()
          .from(ledgerAccounts)
          .where(eq(ledgerAccounts.id, targetAccountId));
      } else if (recipientAccountNumber) {
        [recipientAccount] = await tx
          .select()
          .from(ledgerAccounts)
          .where(eq(ledgerAccounts.accountNumber, recipientAccountNumber));
      }

      if (!recipientAccount) {
        return { success: false, error: 'Recipient account not found.' };
      }

      if (senderAccount.id === recipientAccount.id) {
        return { success: false, error: 'Cannot transfer funds to the same vault account.' };
      }

      // 3. Determine Exchange Rate 💱
      let effectiveRate = 1;

      if (senderAccount.currency !== recipientAccount.currency) {
        const [rateRecord] = await tx
          .select()
          .from(exchangeRates)
          .where(
            and(
              eq(exchangeRates.fromCurrency, senderAccount.currency),
              eq(exchangeRates.toCurrency, recipientAccount.currency)
            )
          );

        if (!rateRecord) {
          return {
            success: false,
            error: `No exchange rate configured for ${senderAccount.currency} to ${recipientAccount.currency}.`,
          };
        }

        effectiveRate = parseFloat(rateRecord.rate);
      }

      // 4. Calculate Converted Credit Amount 🧮
      const convertedAmount = amount * effectiveRate;

      // 5. Update Sender Balance (Deduct original amount) 📉
      const newSenderBalance = (currentSenderBalance - amount).toFixed(2);
      await tx
        .update(ledgerAccounts)
        .set({ balance: newSenderBalance })
        .where(eq(ledgerAccounts.id, senderAccount.id));

      // 6. Update Recipient Balance (Add converted amount) 📈
      const currentRecipientBalance = parseFloat(recipientAccount.balance || '0');
      const newRecipientBalance = (currentRecipientBalance + convertedAmount).toFixed(2);
      await tx
        .update(ledgerAccounts)
        .set({ balance: newRecipientBalance })
        .where(eq(ledgerAccounts.id, recipientAccount.id));

      // 7. Audit Logging 📝
      const idempotencyKey = `TRF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const [journal] = await tx
        .insert(journalEntries)
        .values({
          idempotencyKey,
          description: `${description} (${amount.toFixed(2)} ${senderAccount.currency} -> ${convertedAmount.toFixed(2)} ${recipientAccount.currency} @ rate ${effectiveRate})`,
          status: 'posted',
        })
        .returning();

      const [senderLine] = await tx
        .insert(ledgerLines)
        .values({
          journalEntryId: journal.id,
          ledgerAccountId: senderAccount.id,
          type: 'debit',
          amount: amount.toFixed(4),
        })
        .returning();

      await tx.insert(ledgerLines).values({
        journalEntryId: journal.id,
        ledgerAccountId: recipientAccount.id,
        type: 'credit',
        amount: convertedAmount.toFixed(4),
      });

      revalidatePath('/dashboard');
      revalidatePath('/dashboard/transactions');

      return {
        success: true,
        message: `Transferred ${amount.toFixed(2)} ${senderAccount.currency} to ${recipientAccount.name} (${convertedAmount.toFixed(2)} ${recipientAccount.currency} received)`,
        ledgerLineId: senderLine.id,
      };
    });
  } catch (error: any) {
    console.error('Transfer Error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during transfer.',
    };
  }
}