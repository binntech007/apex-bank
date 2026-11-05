'use server';

import { db } from '@/lib/db';
import { kycVerifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 1. Fetch all pending KYC submissions for admin review 📥
export async function getPendingKycSubmissions() {
  try {
    const submissions = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.status, 'pending'));

    return { success: true, submissions };
  } catch (error: any) {
    console.error('Error fetching KYC submissions:', error);
    return { success: false, error: error.message || 'Failed to fetch submissions.' };
  }
}

// 2. Approve a user's KYC submission ✅
export async function approveKyc(kycId: string) {
  try {
    if (!kycId) throw new Error('KYC ID is required.');

    await db
      .update(kycVerifications)
      .set({
        status: 'approved',
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(kycVerifications.id, kycId));

    revalidatePath('/admin/kyc');
    return { success: true, message: 'KYC submission approved successfully!' };
  } catch (error: any) {
    console.error('Error approving KYC:', error);
    return { success: false, error: error.message || 'Failed to approve KYC.' };
  }
}

// 3. Reject a user's KYC submission with a reason ❌
export async function rejectKyc(params: { kycId: string; reason: string }) {
  try {
    if (!params.kycId) throw new Error('KYC ID is required.');
    if (!params.reason) throw new Error('A rejection reason is required.');

    await db
      .update(kycVerifications)
      .set({
        status: 'rejected',
        rejectionReason: params.reason,
        updatedAt: new Date(),
      })
      .where(eq(kycVerifications.id, params.kycId));

    revalidatePath('/admin/kyc');
    return { success: true, message: 'KYC submission rejected.' };
  } catch (error: any) {
    console.error('Error rejecting KYC:', error);
    return { success: false, error: error.message || 'Failed to reject KYC.' };
  }
}