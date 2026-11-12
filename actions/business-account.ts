
'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
  businessAccountApplications,
  ledgerAccounts,
} from '@/lib/db/schema';
import {
  and,
  desc,
  eq,
  gte,
  inArray,
} from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type BusinessApplicationInput = {
  ledgerAccountId: string;
  occupation: string;
  employerName?: string;
  incomeSource: string;
  monthlyIncomeRange: string;
  accountPurpose: string;
};

/**
 * Get eligible savings accounts and their latest application status.
 *
 * Pending and under-review applications remain visible.
 * Rejected applications remain visible for resubmission.
 * Approved applications are hidden only after the account is
 * actually upgraded to a business account.
 */
export async function getBusinessUpgradeAccounts() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const accounts = await db
    .select({
      id: ledgerAccounts.id,
      accountNumber: ledgerAccounts.accountNumber,
      name: ledgerAccounts.name,
      currency: ledgerAccounts.currency,
      balance: ledgerAccounts.balance,
      accountType: ledgerAccounts.accountType,
    })
    .from(ledgerAccounts)
    .where(
      and(
        eq(ledgerAccounts.userId, session.user.id),
        eq(ledgerAccounts.accountType, 'savings'),
        gte(ledgerAccounts.balance, '50000')
      )
    );

  if (!accounts.length) {
    return [];
  }

  const accountIds = accounts.map((account) => account.id);

  const applications = await db
    .select({
      ledgerAccountId:
        businessAccountApplications.ledgerAccountId,
      status: businessAccountApplications.status,
      rejectionReason:
        businessAccountApplications.rejectionReason,
      createdAt: businessAccountApplications.createdAt,
    })
    .from(businessAccountApplications)
    .where(
      and(
        eq(businessAccountApplications.userId, session.user.id),
        inArray(
          businessAccountApplications.ledgerAccountId,
          accountIds
        )
      )
    )
    .orderBy(desc(businessAccountApplications.createdAt));

  // Keep the latest application for each account.
  const latestApplications = new Map<
    string,
    (typeof applications)[number]
  >();

  for (const application of applications) {
    if (!latestApplications.has(application.ledgerAccountId)) {
      latestApplications.set(
        application.ledgerAccountId,
        application
      );
    }
  }

  return accounts.map((account) => {
    const application = latestApplications.get(account.id);

    return {
      ...account,
      balance: account.balance ?? '0.00',
      applicationStatus: application?.status ?? null,
      rejectionReason: application?.rejectionReason ?? null,
    };
  });
}

/**
 * Submit a business account upgrade application.
 */
export async function submitBusinessApplication(
  input: BusinessApplicationInput
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: 'Please log in again.',
    };
  }

  const occupation = input.occupation?.trim();
  const employerName = input.employerName?.trim() || null;
  const incomeSource = input.incomeSource?.trim();
  const monthlyIncomeRange =
    input.monthlyIncomeRange?.trim();
  const accountPurpose = input.accountPurpose?.trim();

  if (
    !input.ledgerAccountId ||
    !occupation ||
    !incomeSource ||
    !monthlyIncomeRange ||
    !accountPurpose
  ) {
    return {
      success: false,
      message: 'Please complete all required fields.',
    };
  }

  try {
    // Verify account ownership, account type and eligibility.
    const [account] = await db
      .select({
        id: ledgerAccounts.id,
      })
      .from(ledgerAccounts)
      .where(
        and(
          eq(ledgerAccounts.id, input.ledgerAccountId),
          eq(ledgerAccounts.userId, session.user.id),
          eq(ledgerAccounts.accountType, 'savings'),
          gte(ledgerAccounts.balance, '50000')
        )
      )
      .limit(1);

    if (!account) {
      return {
        success: false,
        message:
          'This account does not currently meet the upgrade criteria.',
      };
    }

    // Check whether an active application already exists.
    const [existing] = await db
      .select({
        id: businessAccountApplications.id,
      })
      .from(businessAccountApplications)
      .where(
        and(
          eq(
            businessAccountApplications.userId,
            session.user.id
          ),
          eq(
            businessAccountApplications.ledgerAccountId,
            account.id
          ),
          inArray(businessAccountApplications.status, [
            'pending',
            'under_review',
            'approved',
          ])
        )
      )
      .limit(1);

    if (existing) {
      return {
        success: false,
        message:
          'An application already exists for this account.',
      };
    }

    // Create the application.
    await db.insert(businessAccountApplications).values({
      userId: session.user.id,
      ledgerAccountId: account.id,
      occupation,
      employerName,
      incomeSource,
      monthlyIncomeRange,
      accountPurpose,
      status: 'pending',
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      message:
        'Your application has been submitted successfully and is awaiting admin review.',
    };
  } catch (error) {
    console.error('BUSINESS APPLICATION ERROR:', error);

    return {
      success: false,
      message:
        'Unable to submit your application. Please try again.',
    };
  }
}
