'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { beneficiaries } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 📥 Fetch all beneficiaries for the current user
export async function getBeneficiaries() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    const list = await db
      .select()
      .from(beneficiaries)
      .where(eq(beneficiaries.userId, session.user.id));

    return { success: true, beneficiaries: list };
  } catch (err) {
    console.error('Error fetching beneficiaries:', err);
    return { success: false, error: 'Failed to load beneficiaries.' };
  }
}

// ➕ Add a new beneficiary
export async function addBeneficiary(data: {
  fullName: string;
  email: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'trust' | 'other';
  allocationPercentage: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    // Insert new record
    await db.insert(beneficiaries).values({
      userId: session.user.id,
      fullName: data.fullName,
      email: data.email,
      relationship: data.relationship,
      allocationPercentage: data.allocationPercentage,
    });

    revalidatePath('/dashboard/settings/beneficiaries');
    return { success: true, message: 'Beneficiary added successfully.' };
  } catch (err) {
    console.error('Error adding beneficiary:', err);
    return { success: false, error: 'Failed to add beneficiary.' };
  }
}

// 🗑️ Delete a beneficiary
export async function deleteBeneficiary(beneficiaryId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    await db
      .delete(beneficiaries)
      .where(and(eq(beneficiaries.id, beneficiaryId), eq(beneficiaries.userId, session.user.id)));

    revalidatePath('/dashboard/settings/beneficiaries');
    return { success: true, message: 'Beneficiary removed.' };
  } catch (err) {
    console.error('Error deleting beneficiary:', err);
    return { success: false, error: 'Failed to delete beneficiary.' };
  }
}