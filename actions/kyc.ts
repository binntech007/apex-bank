// actions/kyc.ts
'use server';

import { db } from '@/lib/db';
import { kycVerifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface KycSubmissionInput {
  userId: string;
  fullName: string;
  idType: string;
  idNumber: string;
  documentUrl: string;
  userImageUrl: string;
}

// 🔍 Fetch existing KYC record for a user
export async function getKycStatus(userId: string) {
  try {
    if (!userId) return null;

    const [record] = await db
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.userId, userId));

    return record || null;
  } catch (err) {
    console.error('Fetch KYC Error:', err);
    return null;
  }
}

export async function submitKyc(data: KycSubmissionInput) {
  try {
    if (!data.userId || !data.fullName || !data.idNumber || !data.documentUrl || !data.userImageUrl) {
      return { success: false, error: 'All fields, document scans, and selfies are required.' };
    }

    await db
      .insert(kycVerifications)
      .values({
        userId: data.userId,
        fullName: data.fullName,
        idType: data.idType,
        idNumber: data.idNumber,
        documentUrl: data.documentUrl,
        userImageUrl: data.userImageUrl,
        status: 'pending',
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: kycVerifications.userId,
        set: {
          fullName: data.fullName,
          idType: data.idType,
          idNumber: data.idNumber,
          documentUrl: data.documentUrl,
          userImageUrl: data.userImageUrl,
          status: 'pending',
          rejectionReason: null,
          updatedAt: new Date(),
        },
      });

    revalidatePath('/dashboard/kyc');
    revalidatePath('/admin');

    return { success: true, message: 'KYC documents submitted successfully. Pending admin review.' };
  } catch (err: any) {
    console.error('KYC Submission Error:', err);
    return { success: false, error: err.message || 'Failed to submit KYC data.' };
  }
}