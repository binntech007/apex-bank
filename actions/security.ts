'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// 🔑 Action 1: Update Account Password
export async function updatePassword(formData: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized session. Please log in again.' };
    }

    const userId = session.user.id;
    const { currentPassword, newPassword } = formData;

    const [user] = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.password) {
      return { success: false, error: 'User record not found or uses external OAuth login.' };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { success: false, error: 'Incorrect current password.' };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    return { success: true, message: 'Password updated successfully!' };
  } catch (err) {
    console.error('Update password error:', err);
    return { success: false, error: 'Failed to update password. Please try again.' };
  }
}

// 📱 Action 2: Fetch Active Sessions for Current User
export async function getActiveSessions() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized session.' };
    }

    const activeSessions = await db
      .select({
        id: sessions.sessionToken,
        userAgent: sessions.userAgent,
        ipAddress: sessions.ipAddress,
        lastActive: sessions.lastActive,
        expires: sessions.expires,
      })
      .from(sessions)
      .where(eq(sessions.userId, session.user.id));

    return { success: true, sessions: activeSessions };
  } catch (err) {
    console.error('Get active sessions error:', err);
    return { success: false, error: 'Failed to retrieve active sessions.' };
  }
}

// 🚫 Action 3: Revoke (Delete) a Specific Session
export async function revokeSession(sessionToken: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized action.' };
    }

    // Ensure users can only delete their own sessions 🛡️
    await db
      .delete(sessions)
      .where(
        and(
          eq(sessions.sessionToken, sessionToken),
          eq(sessions.userId, session.user.id)
        )
      );

    return { success: true, message: 'Session revoked successfully.' };
  } catch (err) {
    console.error('Revoke session error:', err);
    return { success: false, error: 'Failed to revoke session.' };
  }
}