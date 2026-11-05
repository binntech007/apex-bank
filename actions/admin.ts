
'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

import {
  users,
  auditLogs,
  siteVisitors,
  ledgerLines,
  journalEntries,
  ledgerAccounts,
  internationalTransfers,
} from '@/lib/db/schema';

import {
  eq,
  desc,
  sql,
  and,
} from 'drizzle-orm';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// ======================================================
// 1. UPDATE CUSTOMER KYC STATUS
// ======================================================

export async function updateKycStatus(
  userId: string,
  status: 'approved' | 'rejected'
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Admin privileges required.',
      };
    }

    await db
      .update(users)
      .set({ kycStatus: status })
      .where(eq(users.id, userId));

    revalidatePath('/admin');

    return { success: true };

  } catch (err: any) {
    console.error('KYC Update Error:', err);

    return {
      success: false,
      error: err.message || 'Failed to update KYC status.',
    };
  }
}

// ======================================================
// 2. GET ADMIN AUDIT LOGS
// ======================================================

export async function getAuditLogs() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return {
        success: false,
        logs: [],
        error: 'Unauthorized: Admin privileges required.',
      };
    }

    const logs = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userEmail: users.email,
        action: auditLogs.action,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(
        users,
        sql`${auditLogs.userId}::text = ${users.id}::text`
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(50);

    return {
      success: true,
      logs,
    };

  } catch (err: any) {
    console.error('Audit Logs Fetch Error:', err);

    return {
      success: false,
      logs: [],
      error: err.message || 'Could not load audit trails.',
    };
  }
}

// ======================================================
// 3. SUSPEND OR ACTIVATE CUSTOMER
// ======================================================

export async function toggleUserSuspension(
  userId: string,
  suspend: boolean
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Admin privileges required.',
      };
    }

    await db
      .update(users)
      .set({ isSuspended: suspend })
      .where(eq(users.id, userId));

    revalidatePath('/admin');

    return { success: true };

  } catch (err: any) {
    console.error('Suspension Error:', err);

    return {
      success: false,
      error: err.message || 'Failed to update account status.',
    };
  }
}

// ======================================================
// 4. TRACK SITE VISITORS
// ======================================================

export async function trackVisitor(path: string) {
  try {
    const headerList = await headers();

    const rawUserAgent =
      headerList.get('user-agent') || '';

    const ipAddress =
      headerList.get('cf-connecting-ip') ||
      headerList.get('x-client-ip') ||
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    await db.insert(siteVisitors).values({
      ipAddress,
      userAgent: rawUserAgent,
      path,
    });

    return { success: true };

  } catch (err) {
    console.error('Visitor Tracking Error:', err);

    return { success: false };
  }
}

// ======================================================
// 5. GET SITE VISITORS
// ======================================================

export async function getSiteVisitors() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return {
        success: false,
        visitors: [],
        error: 'Unauthorized: Admin privileges required.',
      };
    }

    const visitors = await db
      .select()
      .from(siteVisitors)
      .orderBy(desc(siteVisitors.createdAt))
      .limit(50);

    return {
      success: true,
      visitors,
    };

  } catch (err: any) {
    console.error('Visitors Fetch Error:', err);

    return {
      success: false,
      visitors: [],
      error: err.message || 'Could not load visitor analytics.',
    };
  }
}

// ======================================================
// 6. GET ALL SYSTEM TRANSACTIONS
// ======================================================

export async function getAllSystemTransactions() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return {
        success: false,
        transactions: [],
        error: 'Unauthorized: Admin privileges required.',
      };
    }

    // ------------------------------------------
    // Fetch ledger transactions
    // ------------------------------------------

    const ledgerTransactions = await db
      .select({
        id: ledgerLines.id,
        journalEntryId: journalEntries.id,

        userId: users.id,
        userName: users.name,
        userEmail: users.email,

        accountNumber: ledgerAccounts.accountNumber,
        currency: ledgerAccounts.currency,

        description: journalEntries.description,
        amount: ledgerLines.amount,
        type: ledgerLines.type,

        status: journalEntries.status,

        createdAt: ledgerLines.createdAt,
      })
      .from(ledgerLines)
      .innerJoin(
        journalEntries,
        eq(ledgerLines.journalEntryId, journalEntries.id)
      )
      .innerJoin(
        ledgerAccounts,
        eq(ledgerLines.ledgerAccountId, ledgerAccounts.id)
      )
      .leftJoin(
        users,
        eq(ledgerAccounts.userId, users.id)
      )
      .orderBy(desc(ledgerLines.createdAt));

    // ------------------------------------------
    // Fetch international transfers
    // ------------------------------------------

    const internationalTransactions = await db
      .select({
        id: internationalTransfers.id,
        journalEntryId: internationalTransfers.journalEntryId,

        userId: users.id,
        userName: users.name,
        userEmail: users.email,

        accountNumber: ledgerAccounts.accountNumber,
        currency: ledgerAccounts.currency,

        description: journalEntries.description,

        amount: internationalTransfers.amount,

        recipientName: internationalTransfers.recipientName,
        bankName: internationalTransfers.bankName,
        swiftBic: internationalTransfers.swiftBic,

        status: internationalTransfers.status,

        createdAt: internationalTransfers.createdAt,
      })
      .from(internationalTransfers)
      .innerJoin(
        journalEntries,
        eq(
          internationalTransfers.journalEntryId,
          journalEntries.id
        )
      )
      .innerJoin(
        ledgerAccounts,
        eq(
          internationalTransfers.sourceAccountId,
          ledgerAccounts.id
        )
      )
      .leftJoin(
        users,
        eq(ledgerAccounts.userId, users.id)
      )
      .orderBy(desc(internationalTransfers.createdAt));

    // ------------------------------------------
    // Format ledger transactions
    // ------------------------------------------

    const formattedLedgerTransactions =
      ledgerTransactions.map((tx) => ({
        id: tx.id,
        journalEntryId: tx.journalEntryId,

        userId: tx.userId,
        userName: tx.userName,
        userEmail: tx.userEmail,

        accountNumber: tx.accountNumber,
        currency: tx.currency,

        description:
          tx.description || 'System Transfer',

        amount: tx.amount,

        type: tx.type as 'debit' | 'credit',

        status: tx.status,

        source: 'ledger' as const,

        createdAt: tx.createdAt,
      }));

    // ------------------------------------------
    // Format international transfers
    // ------------------------------------------

    const formattedInternationalTransactions =
      internationalTransactions.map((tx) => ({
        id: tx.id,
        journalEntryId: tx.journalEntryId,

        userId: tx.userId,
        userName: tx.userName,
        userEmail: tx.userEmail,

        accountNumber: tx.accountNumber,
        currency: tx.currency,

        description:
          tx.description ||
          `International Wire to ${tx.recipientName}`,

        amount: tx.amount,

        type: 'debit' as const,

        status:
          tx.status === 'pending'
            ? 'pending'
            : tx.status === 'rejected'
            ? 'failed'
            : tx.status === 'completed'
            ? 'posted'
            : tx.status,

        source: 'international' as const,

        recipientName: tx.recipientName,
        bankName: tx.bankName,
        swiftBic: tx.swiftBic,

        createdAt: tx.createdAt,
      }));

    // ------------------------------------------
    // Prevent duplicate transactions
    // ------------------------------------------

    const ledgerJournalIds = new Set(
      formattedLedgerTransactions.map(
        (tx) => tx.journalEntryId
      )
    );

    const uniqueInternationalTransactions =
      formattedInternationalTransactions.filter(
        (tx) =>
          !ledgerJournalIds.has(tx.journalEntryId)
      );

    // ------------------------------------------
    // Combine transactions
    // ------------------------------------------

    const transactions = [
      ...formattedLedgerTransactions,
      ...uniqueInternationalTransactions,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return {
      success: true,
      transactions,
    };

  } catch (err: any) {
    console.error(
      'Fetch All Transactions Error:',
      err
    );

    return {
      success: false,
      transactions: [],
      error:
        err.message ||
        'Could not load system transactions.',
    };
  }
}

// ======================================================
// 7. REVERSE A SYSTEM TRANSACTION
// ======================================================

export async function reverseTransaction(
  ledgerLineId: string
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Admin privileges required.',
      };
    }

    await db.transaction(async (tx) => {

      const [targetLine] = await tx
        .select()
        .from(ledgerLines)
        .where(eq(ledgerLines.id, ledgerLineId))
        .for('update');

      if (!targetLine) {
        throw new Error('Transaction record not found.');
      }

      const reversalType =
        targetLine.type === 'credit'
          ? 'debit'
          : 'credit';

      const [account] = await tx
        .select()
        .from(ledgerAccounts)
        .where(
          eq(
            ledgerAccounts.id,
            targetLine.ledgerAccountId
          )
        )
        .for('update');

      if (!account) {
        throw new Error('Ledger account not found.');
      }

      const currentBalance =
        Number(account.balance || 0);

      const amount =
        Number(targetLine.amount);

      const newBalance =
        reversalType === 'credit'
          ? currentBalance + amount
          : currentBalance - amount;

      if (newBalance < 0) {
        throw new Error(
          'Insufficient balance to reverse this transaction.'
        );
      }

      const [newJournal] = await tx
        .insert(journalEntries)
        .values({
          description:
            `Reversal of transaction ${targetLine.id.slice(0, 8)}`,
          idempotencyKey: crypto.randomUUID(),
          status: 'posted',
        })
        .returning({
          id: journalEntries.id,
        });

      await tx.insert(ledgerLines).values({
        journalEntryId: newJournal.id,
        ledgerAccountId: targetLine.ledgerAccountId,
        amount: targetLine.amount,
        type: reversalType,
      });

      await tx
        .update(ledgerAccounts)
        .set({
          balance: newBalance.toFixed(2),
        })
        .where(
          eq(
            ledgerAccounts.id,
            targetLine.ledgerAccountId
          )
        );

      await tx
        .update(journalEntries)
        .set({ status: 'reversed' })
        .where(
          eq(
            journalEntries.id,
            targetLine.journalEntryId
          )
        );
    });

    revalidatePath('/admin/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');

    return {
      success: true,
      message: 'Transaction reversed successfully.',
    };

  } catch (err: any) {
    console.error('Transaction Reversal Error:', err);

    return {
      success: false,
      error:
        err.message ||
        'Failed to reverse transaction.',
    };
  }
}

// ======================================================
// 8. APPROVE OR REJECT INTERNATIONAL TRANSFERS
// ======================================================

export async function updateInternationalWireStatus(
  wireId: string,
  newStatus: 'completed' | 'pending' | 'rejected'
) {
  try {
    // ------------------------------------------
    // Verify admin
    // ------------------------------------------

    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Admin privileges required.',
      };
    }

    if (newStatus === 'pending') {
      return {
        success: false,
        error: 'A transaction cannot be reset to pending.',
      };
    }

    // ------------------------------------------
    // Process inside atomic database transaction
    // ------------------------------------------

    await db.transaction(async (tx) => {

      // Lock transfer record.
      const [wire] = await tx
        .select()
        .from(internationalTransfers)
        .where(
          eq(internationalTransfers.id, wireId)
        )
        .for('update');

      if (!wire) {
        throw new Error(
          'International wire transfer record not found.'
        );
      }

      // Prevent duplicate approval/rejection.
      if (wire.status !== 'pending') {
        throw new Error(
          `This transfer has already been ${wire.status}.`
        );
      }

      // Lock journal entry.
      const [journal] = await tx
        .select()
        .from(journalEntries)
        .where(
          eq(journalEntries.id, wire.journalEntryId)
        )
        .for('update');

      if (!journal || journal.status !== 'pending') {
        throw new Error(
          'The associated journal entry is not pending.'
        );
      }

      // ------------------------------------------
      // APPROVE TRANSFER
      // ------------------------------------------

      if (newStatus === 'completed') {

        // Lock customer's account.
        const [sourceAccount] = await tx
          .select()
          .from(ledgerAccounts)
          .where(
            eq(
              ledgerAccounts.id,
              wire.sourceAccountId
            )
          )
          .for('update');

        if (!sourceAccount) {
          throw new Error(
            'Source account not found.'
          );
        }

        const transferAmount = Number(wire.amount);

        if (
          !Number.isFinite(transferAmount) ||
          transferAmount <= 0
        ) {
          throw new Error(
            'Invalid transfer amount.'
          );
        }

        // Prevent duplicate ledger posting.
        const existingLines = await tx
          .select({
            id: ledgerLines.id,
          })
          .from(ledgerLines)
          .where(
            eq(
              ledgerLines.journalEntryId,
              wire.journalEntryId
            )
          )
          .limit(1);

        if (existingLines.length > 0) {
          throw new Error(
            'A ledger entry already exists for this transfer.'
          );
        }

        // Deduct the simulated balance only if sufficient.
        const updatedAccount = await tx
          .update(ledgerAccounts)
          .set({
            balance: sql`
              ${ledgerAccounts.balance} -
              ${wire.amount}::numeric
            `,
          })
          .where(
            and(
              eq(
                ledgerAccounts.id,
                wire.sourceAccountId
              ),
              sql`
                ${ledgerAccounts.balance} >=
                ${wire.amount}::numeric
              `
            )
          )
          .returning({
            id: ledgerAccounts.id,
          });

        if (updatedAccount.length === 0) {
          throw new Error(
            'Insufficient account balance to approve this transfer.'
          );
        }

        // Create debit ledger entry.
        await tx.insert(ledgerLines).values({
          journalEntryId: wire.journalEntryId,
          ledgerAccountId: wire.sourceAccountId,
          amount: wire.amount,
          type: 'debit',
        });

        // Update journal status.
        const updatedJournal = await tx
          .update(journalEntries)
          .set({
            status: 'posted',
          })
          .where(
            and(
              eq(
                journalEntries.id,
                wire.journalEntryId
              ),
              eq(
                journalEntries.status,
                'pending'
              )
            )
          )
          .returning({
            id: journalEntries.id,
          });

        if (updatedJournal.length === 0) {
          throw new Error(
            'Could not post journal entry.'
          );
        }
      }

      // ------------------------------------------
      // REJECT TRANSFER
      // ------------------------------------------

      if (newStatus === 'rejected') {

        await tx
          .update(journalEntries)
          .set({
            status: 'failed',
          })
          .where(
            and(
              eq(
                journalEntries.id,
                wire.journalEntryId
              ),
              eq(
                journalEntries.status,
                'pending'
              )
            )
          );
      }

      // ------------------------------------------
      // Update international transfer status
      // ------------------------------------------

      const updatedWire = await tx
        .update(internationalTransfers)
        .set({
          status: newStatus,
        })
        .where(
          and(
            eq(
              internationalTransfers.id,
              wireId
            ),
            eq(
              internationalTransfers.status,
              'pending'
            )
          )
        )
        .returning({
          id: internationalTransfers.id,
        });

      if (updatedWire.length === 0) {
        throw new Error(
          'Could not update transfer status.'
        );
      }
    });

    // ------------------------------------------
    // Refresh pages
    // ------------------------------------------

    revalidatePath('/admin');
    revalidatePath('/admin/transactions');
    revalidatePath('/admin/transfers');

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');

    return {
      success: true,
      message:
        newStatus === 'completed'
          ? 'Transfer approved successfully.'
          : 'Transfer rejected successfully.',
    };

  } catch (err: any) {
    console.error(
      'Wire Approval Error:',
      err
    );

    return {
      success: false,
      error:
        err.message ||
        'Failed to process transfer.',
    };
  }
}
