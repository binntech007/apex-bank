'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { userLimits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 📥 Fetch user limits or initialize defaults if missing
export async function getUserLimits() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    let [limits] = await db
      .select()
      .from(userLimits)
      .where(eq(userLimits.userId, session.user.id));

    if (!limits) {
      [limits] = await db
        .insert(userLimits)
        .values({ userId: session.user.id })
        .returning();
    }

    return { success: true, limits };
  } catch (err) {
    console.error('Error fetching user limits:', err);
    return { success: false, error: 'Failed to load transfer limits.' };
  }
}

// 💾 Update limit settings
export async function updateUserLimits(data: {
  dailyLimit: string;
  monthlyLimit: string;
  singleTxLimit: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' };
    }

    await db
      .insert(userLimits)
      .values({
        userId: session.user.id,
        ...data,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userLimits.userId,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      });

    revalidatePath('/dashboard/settings/limits');
    return { success: true, message: 'Transfer limits updated successfully.' };
  } catch (err) {
    console.error('Error updating limits:', err);
    return { success: false, error: 'Failed to save transfer limits.' };
  }
}