'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { taxProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 📥 Fetch user tax profile or initialize default settings
export async function getTaxProfile() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    let [profile] = await db
      .select()
      .from(taxProfiles)
      .where(eq(taxProfiles.userId, session.user.id));

    if (!profile) {
      [profile] = await db
        .insert(taxProfiles)
        .values({ userId: session.user.id })
        .returning();
    }

    return { success: true, profile };
  } catch (err) {
    console.error('Error fetching tax profile:', err);
    return { success: false, error: 'Failed to load tax profile.' };
  }
}

// 💾 Update tax profile details
export async function updateTaxProfile(data: {
  taxResidency: string;
  tin?: string;
  fatcaStatus: string;
  isUsPerson: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    // Prepare update payload
    const updateData: Record<string, any> = {
      taxResidency: data.taxResidency,
      fatcaStatus: data.fatcaStatus,
      isUsPerson: data.isUsPerson,
      updatedAt: new Date(),
    };

    // Only update TIN if a new unmasked value was provided
    if (data.tin && !data.tin.includes('***')) {
      // Mask for display (e.g. show only last 4 digits)
      const lastFour = data.tin.slice(-4);
      updateData.tin = `***-**-${lastFour}`;
    }

    await db
      .insert(taxProfiles)
      .values({
        userId: session.user.id,
        taxResidency: data.taxResidency,
        tin: updateData.tin || '***-**-****',
        fatcaStatus: data.fatcaStatus,
        isUsPerson: data.isUsPerson,
      })
      .onConflictDoUpdate({
        target: taxProfiles.userId,
        set: updateData,
      });

    revalidatePath('/dashboard/settings/tax');
    return { success: true, message: 'Tax profile updated successfully.' };
  } catch (err) {
    console.error('Error updating tax profile:', err);
    return { success: false, error: 'Failed to update tax profile.' };
  }
}