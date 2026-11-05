'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { loans, ledgerAccounts, users, journalEntries, ledgerLines } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 1. Fetch ALL loans for Admin Review 👑
export async function getAllLoansForAdmin() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return [];
    }

    const allLoans = await db
      .select({
        id: loans.id,
        userId: loans.userId,
        userName: users.name,
        userEmail: users.email,
        ledgerAccountId: loans.ledgerAccountId,
        amount: loans.amount,
        interestRate: loans.interestRate,
        termMonths: loans.termMonths,
        monthlyPayment: loans.monthlyPayment,
        purpose: loans.purpose,
        status: loans.status,
        createdAt: loans.createdAt,
      })
      .from(loans)
      .innerJoin(users, eq(loans.userId, users.id));

    return allLoans.map((loan) => ({
      ...loan,
      amount: parseFloat(loan.amount),
      interestRate: parseFloat(loan.interestRate),
      monthlyPayment: parseFloat(loan.monthlyPayment),
      status: loan.status as 'pending' | 'approved' | 'rejected' | 'paid',
      createdAt: loan.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('Failed to fetch admin loans:', err);
    return [];
  }
}

// 2. Approve or Reject a Loan ⚡
export async function updateLoanStatus(formData: {
  loanId: string;
  action: 'approve' | 'reject';
}) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Admin permissions required.' };
    }

    const { loanId, action } = formData;

    const [existingLoan] = await db
      .select()
      .from(loans)
      .where(eq(loans.id, loanId));

    if (!existingLoan) {
      return { success: false, error: 'Loan application not found.' };
    }

    if (existingLoan.status !== 'pending') {
      return { success: false, error: `Loan is already ${existingLoan.status}.` };
    }

    if (action === 'reject') {
      await db
        .update(loans)
        .set({ status: 'rejected', updatedAt: new Date() })
        .where(eq(loans.id, loanId));

      revalidatePath('/admin/loans');
      return { success: true, message: 'Loan application rejected.' };
    }

    const loanAmount = parseFloat(existingLoan.amount);

    // Atomic transaction for approval and fund disbursal 🔄
    await db.transaction(async (tx) => {
      // Update loan status 🟢
      await tx
        .update(loans)
        .set({ status: 'approved', updatedAt: new Date() })
        .where(eq(loans.id, loanId));

      // Disburse funds into target vault 💰
      await tx
        .update(ledgerAccounts)
        .set({
          balance: sql`${ledgerAccounts.balance} + ${loanAmount}`
        })
        .where(eq(ledgerAccounts.id, existingLoan.ledgerAccountId));

      // Log journal entry 📝
      const [journal] = await tx
        .insert(journalEntries)
        .values({
          idempotencyKey: crypto.randomUUID(),
          description: `Loan Disbursal - ${existingLoan.purpose}`,
          status: 'posted',
        })
        .returning();

      // Log ledger line 📊
      await tx.insert(ledgerLines).values({
        journalEntryId: journal.id,
        ledgerAccountId: existingLoan.ledgerAccountId,
        type: 'credit',
        amount: loanAmount.toFixed(4),
      });
    });

    revalidatePath('/admin/loans');
    return { success: true, message: `Loan approved and $${loanAmount.toLocaleString()} disbursed!` };
  } catch (err) {
    console.error('Update loan status error:', err);
    return { success: false, error: 'Failed to update loan status.' };
  }
}