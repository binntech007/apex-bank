'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { loans, ledgerAccounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Fetch user's existing loans 📄
export async function getUserLoans() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userLoans = await db
      .select()
      .from(loans)
      .where(eq(loans.userId, session.user.id));

    return userLoans.map((loan) => ({
      id: loan.id,
      amount: parseFloat(loan.amount),
      interestRate: parseFloat(loan.interestRate),
      termMonths: loan.termMonths,
      monthlyPayment: parseFloat(loan.monthlyPayment),
      remainingBalance: parseFloat(loan.remainingBalance),
      purpose: loan.purpose,
      status: loan.status as 'pending' | 'approved' | 'rejected' | 'paid',
      createdAt: loan.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('Failed to fetch user loans:', err);
    return [];
  }
}

// Submit a new loan request 📝
export async function applyForLoan(formData: {
  ledgerAccountId: string;
  amount: number;
  termMonths: number;
  purpose: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized session. Please log in.' };
    }

    const userId = session.user.id;
    const { ledgerAccountId, amount, termMonths, purpose } = formData;

    // Validate selected vault ownership
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
      return { success: false, error: 'Selected destination vault was not found.' };
    }

    // Fixed interest rate calculation (e.g., 8.5% annual rate) 📊
    const annualInterestRate = 8.5;
    const monthlyRate = annualInterestRate / 100 / 12;
    const calculatedMonthly = 
      (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    const totalRepayable = calculatedMonthly * termMonths;

    // Insert loan with 'pending' status ⏳
    await db.insert(loans).values({
      userId,
      ledgerAccountId,
      amount: amount.toFixed(2),
      interestRate: annualInterestRate.toFixed(2),
      termMonths,
      monthlyPayment: calculatedMonthly.toFixed(2),
      remainingBalance: totalRepayable.toFixed(2),
      purpose,
      status: 'pending',
    });

    revalidatePath('/dashboard/loans');
    return { success: true, message: 'Loan application submitted for admin review!' };
  } catch (err) {
    console.error('Apply for loan error:', err);
    return { success: false, error: 'Failed to submit loan application.' };
  }
}