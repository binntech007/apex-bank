// actions/payment-methods.ts
'use server';

import { db } from '@/lib/db';
import { linkedBankAccounts, linkedCards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 1. Fetch all linked payment methods for a user 📥
export async function getPaymentMethods(userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID is missing.');
    }

    const banks = await db
      .select()
      .from(linkedBankAccounts)
      .where(eq(linkedBankAccounts.userId, userId));

    const cards = await db
      .select()
      .from(linkedCards)
      .where(eq(linkedCards.userId, userId));

    return { success: true, banks, cards };
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return { success: false, error: error.message || 'Failed to load payment methods.' };
  }
}

// 2. Link a new Bank Account 🏦
export async function addBankAccount(params: {
  userId: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
}) {
  try {
    if (!params.userId) {
      throw new Error('User ID is required to link a bank account.');
    }

    // Check if user already has accounts to determine default status
    const existing = await db
      .select()
      .from(linkedBankAccounts)
      .where(eq(linkedBankAccounts.userId, params.userId));

    await db.insert(linkedBankAccounts).values({
      userId: params.userId,
      bankName: params.bankName,
      accountType: params.accountType,
      accountNumber: params.accountNumber, // 🟢 Stores full account number
      routingNumber: params.routingNumber,
      isDefault: existing.length === 0,
    });

    revalidatePath('/dashboard/settings/payment');
    return { success: true, message: 'Bank account linked successfully!' };
  } catch (error: any) {
    console.error('Error in addBankAccount:', error);
    return { success: false, error: error.message || 'Failed to link bank account.' };
  }
}

// 3. Link a new Card 💳
export async function addCard(params: {
  userId: string;
  cardholderName: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string; // 🟢 Added CVC field parameter
  brand: string;
}) {
  try {
    if (!params.userId) {
      throw new Error('User ID is required to link a card.');
    }

    const last4 = params.cardNumber.slice(-4);

    const existing = await db
      .select()
      .from(linkedCards)
      .where(eq(linkedCards.userId, params.userId));

    await db.insert(linkedCards).values({
      userId: params.userId,
      cardholderName: params.cardholderName,
      brand: params.brand,
      last4,
      expMonth: params.expMonth,
      expYear: params.expYear,
      cvc: params.cvc, // 🟢 Stores CVC
      isDefault: existing.length === 0,
    });

    revalidatePath('/dashboard/settings/payment');
    return { success: true, message: 'Card linked successfully!' };
  } catch (error: any) {
    console.error('Error in addCard:', error);
    return { success: false, error: error.message || 'Failed to link card.' };
  }
}