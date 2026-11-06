
'use server';

import { randomBytes, createHash } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { sendEmail } from '@/lib/mail';

const SUPPORTED_LOCALES = ['en', 'de', 'es', 'fi', 'fr', 'it', 'th'];

const GENERIC_RESPONSE = {
  success: true,
  message: 'If an account exists with that email, a password-reset link will be sent.',
};

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]!);
}

export async function requestPasswordReset(input: {
  email: string;
  locale?: string;
}) {
  try {
    const email = input.email?.trim().toLowerCase();
    const locale = SUPPORTED_LOCALES.includes(input.locale || '')
      ? input.locale!
      : 'en';

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always use the same public response for unknown accounts.
    if (!user) return GENERIC_RESPONSE;

    // Allow at most one reset email per account every 60 seconds.
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const [recentToken] = await db
      .select({ id: passwordResetTokens.id })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          gt(passwordResetTokens.createdAt, oneMinuteAgo),
        ),
      )
      .limit(1);

    if (recentToken) return GENERIC_RESPONSE;

    const baseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.AUTH_URL;

    if (!baseUrl) {
      console.error('Password reset: APP_URL is not configured.');
      return {
        success: false,
        message: 'Unable to process your request right now.',
      };
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const now = new Date();

    // Invalidate any previous reset links for this account.
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
    });

    const resetUrl = new URL(`/${locale}/reset-password`, baseUrl);
    resetUrl.searchParams.set('token', rawToken);

    const safeName = escapeHtml(user.name || 'Customer');

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Reset your Apex Vault password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#1f2937;">
          <h2>Password reset request</h2>
          <p>Hello ${safeName},</p>
          <p>We received a request to reset your Apex Vault password.</p>
          <p>
            <a href="${resetUrl.toString()}"
              style="display:inline-block;padding:13px 22px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:6px;">
              Reset Password
            </a>
          </p>
          <p>This link expires in 30 minutes and can only be used once.</p>
          <p>If you did not request this change, you can ignore this email.</p>
          <p>Apex Vault Security Team</p>
        </div>
      `,
    });

    if (!emailResult.success) {
      // Do not leave a token active when email delivery fails.
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.tokenHash, tokenHash));

      console.error('Password reset email delivery failed.');
    }

    return GENERIC_RESPONSE;
  } catch (error) {
    console.error('Password reset request failed:', error);
    return {
      success: false,
      message: 'Unable to process your request right now.',
    };
  }
}
