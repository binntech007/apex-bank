
'use server';

import { createHash } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { sendEmail } from '@/lib/mail';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function resetPassword(input: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    const { token, password, confirmPassword } = input;

    if (
      typeof token !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      return { success: false, message: 'This reset link is invalid or has expired.' };
    }

    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 128
    ) {
      return {
        success: false,
        message: 'Your password must be between 8 and 128 characters.',
      };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Your passwords do not match.' };
    }

    const tokenHash = hashToken(token);
    const now = new Date();

    const [existingToken] = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ),
      )
      .limit(1);

    if (!existingToken) {
      return {
        success: false,
        message: 'This reset link is invalid or has expired.',
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Consume the token and update the password atomically.
    const result = await db.transaction(async (tx) => {
      const [consumedToken] = await tx
        .update(passwordResetTokens)
        .set({ usedAt: now })
        .where(
          and(
            eq(passwordResetTokens.id, existingToken.id),
            isNull(passwordResetTokens.usedAt),
            gt(passwordResetTokens.expiresAt, now),
          ),
        )
        .returning({ userId: passwordResetTokens.userId });

      if (!consumedToken) return null;

      const [updatedUser] = await tx
        .update(users)
        .set({ password: passwordHash })
        .where(eq(users.id, consumedToken.userId))
        .returning({
          email: users.email,
          name: users.name,
        });

      if (!updatedUser) {
        throw new Error('User account was not found.');
      }

      return updatedUser;
    });

    if (!result) {
      return {
        success: false,
        message: 'This reset link is invalid or has expired.',
      };
    }

    // Send a notification, not the new password.
    const emailResult = await sendEmail({
      to: result.email,
      subject: 'Your Apex Vault password was changed',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#1f2937;">
          <h2>Password changed successfully</h2>
          <p>Hello ${result.name || 'Customer'},</p>
          <p>Your Apex Vault password has been changed successfully.</p>
          <p>If you did not make this change, contact our support team immediately.</p>
          <p>Apex Vault Security Team</p>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.error('Password changed, but notification email failed.');
    }

    return {
      success: true,
      message: 'Your password has been changed successfully.',
    };
  } catch (error) {
    console.error('Password reset failed:', error);
    return {
      success: false,
      message: 'Unable to reset your password right now. Please try again.',
    };
  }
}
