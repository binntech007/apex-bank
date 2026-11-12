
'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

import {
  businessAccountApplications,
  ledgerAccounts,
  users,
} from '@/lib/db/schema';

import { and, desc, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ======================================================
// ADMIN AUTHORIZATION
// ======================================================

async function verifyAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  return session;
}

// ======================================================
// GET ALL BUSINESS UPGRADE APPLICATIONS
// ======================================================

export async function getBusinessUpgradeApplications() {
  try {
    const session = await verifyAdmin();

    if (!session) {
      return {
        success: false,
        applications: [],
        error: 'Unauthorized: Admin privileges required.',
      };
    }

    const applications = await db
      .select({
        id: businessAccountApplications.id,
        userId: businessAccountApplications.userId,
        ledgerAccountId: businessAccountApplications.ledgerAccountId,

        customerName: users.name,
        customerEmail: users.email,

        accountNumber: ledgerAccounts.accountNumber,
        accountName: ledgerAccounts.name,
        currency: ledgerAccounts.currency,
        balance: ledgerAccounts.balance,
        accountType: ledgerAccounts.accountType,

        occupation: businessAccountApplications.occupation,
        employerName: businessAccountApplications.employerName,
        incomeSource: businessAccountApplications.incomeSource,
        monthlyIncomeRange:
          businessAccountApplications.monthlyIncomeRange,
        accountPurpose: businessAccountApplications.accountPurpose,

        businessName: businessAccountApplications.businessName,
        businessType: businessAccountApplications.businessType,
        businessDescription:
          businessAccountApplications.businessDescription,

        status: businessAccountApplications.status,
        adminNotes: businessAccountApplications.adminNotes,
        rejectionReason: businessAccountApplications.rejectionReason,

        reviewedBy: businessAccountApplications.reviewedBy,
        reviewedAt: businessAccountApplications.reviewedAt,
        createdAt: businessAccountApplications.createdAt,
        updatedAt: businessAccountApplications.updatedAt,
      })
      .from(businessAccountApplications)
      .innerJoin(
        users,
        eq(businessAccountApplications.userId, users.id)
      )
      .innerJoin(
        ledgerAccounts,
        eq(
          businessAccountApplications.ledgerAccountId,
          ledgerAccounts.id
        )
      )
      .orderBy(desc(businessAccountApplications.createdAt));

    return {
      success: true,
      applications,
    };
  } catch (error: any) {
    console.error('Business Applications Fetch Error:', error);

    return {
      success: false,
      applications: [],
      error:
        error.message ||
        'Could not load business upgrade applications.',
    };
  }
}

// ======================================================
// UPDATE BUSINESS APPLICATION STATUS
// ======================================================

export async function updateBusinessApplicationStatus(
  applicationId: string,
  newStatus: 'under_review' | 'approved' | 'rejected',
  rejectionReason?: string
) {
  try {
    const session = await verifyAdmin();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized: Admin privileges required.',
      };
    }

    if (!applicationId) {
      return {
        success: false,
        error: 'Application ID is required.',
      };
    }

    const cleanReason = rejectionReason?.trim();

    if (newStatus === 'rejected' && !cleanReason) {
      return {
        success: false,
        error: 'Please provide a reason for rejecting this application.',
      };
    }

    await db.transaction(async (tx) => {
      // Lock the application to prevent simultaneous admin decisions.
      const [application] = await tx
        .select()
        .from(businessAccountApplications)
        .where(eq(businessAccountApplications.id, applicationId))
        .for('update');

      if (!application) {
        throw new Error('Business upgrade application not found.');
      }

      if (
        application.status !== 'pending' &&
        application.status !== 'under_review'
      ) {
        throw new Error(
          `This application has already been ${application.status}.`
        );
      }

      // Mark the application as under review.
      if (newStatus === 'under_review') {
        if (application.status === 'under_review') {
          throw new Error('This application is already under review.');
        }

        await tx
          .update(businessAccountApplications)
          .set({
            status: 'under_review',
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(businessAccountApplications.id, applicationId),
              eq(businessAccountApplications.status, 'pending')
            )
          );

        return;
      }

      // Lock the associated account before making a decision.
      const [account] = await tx
        .select()
        .from(ledgerAccounts)
        .where(
          eq(ledgerAccounts.id, application.ledgerAccountId)
        )
        .for('update');

      if (!account || account.userId !== application.userId) {
        throw new Error(
          'The associated customer account could not be verified.'
        );
      }

      if (newStatus === 'approved') {
        if (account.accountType !== 'savings') {
          throw new Error(
            'Only a savings account can be upgraded.'
          );
        }

        // Update the account type.
        const updatedAccount = await tx
          .update(ledgerAccounts)
          .set({
            accountType: 'business',
          })
          .where(
            and(
              eq(ledgerAccounts.id, application.ledgerAccountId),
              eq(ledgerAccounts.userId, application.userId),
              eq(ledgerAccounts.accountType, 'savings')
            )
          )
          .returning({
            id: ledgerAccounts.id,
          });

        if (updatedAccount.length === 0) {
          throw new Error(
            'Could not upgrade the savings account.'
          );
        }
      }

      // Record the final admin decision.
      const updatedApplication = await tx
        .update(businessAccountApplications)
        .set({
          status: newStatus,
          rejectionReason:
            newStatus === 'rejected' ? cleanReason : null,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(businessAccountApplications.id, applicationId),
            inArray(businessAccountApplications.status, [
              'pending',
              'under_review',
            ])
          )
        )
        .returning({
          id: businessAccountApplications.id,
        });

      if (updatedApplication.length === 0) {
        throw new Error(
          'The application could not be updated. Please refresh and try again.'
        );
      }
    });

    revalidatePath('/admin/business-upgrades');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/business-upgrade');

    return {
      success: true,
      message:
        newStatus === 'approved'
          ? 'Business account upgrade approved successfully.'
          : 'Business upgrade application rejected successfully.',
    };
  } catch (error: any) {
    console.error('Business Application Update Error:', error);

    return {
      success: false,
      error:
        error.message ||
        'Failed to update business upgrade application.',
    };
  }
}
