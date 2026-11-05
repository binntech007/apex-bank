// actions/pin.ts
'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Set or Update User PIN
export async function setupUserPin(pin: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    if (!pin || pin.length !== 4) {
      return { success: false, error: 'PIN must be a 4-digit number.' };
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    await db
      .update(users)
      .set({ pin: hashedPin })
      .where(eq(users.id, session.user.id));

    return { success: true, message: 'Transaction PIN set successfully.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to set PIN.' };
  }
}

// Verify User PIN
export async function verifyUserPin(pin: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const [user] = await db
      .select({ pin: users.pin })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user?.pin) {
      return { success: false, error: 'Transaction PIN not configured. Please set your PIN first.' };
    }

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      return { success: false, error: 'Incorrect transaction PIN.' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'PIN verification failed.' };
  }
}