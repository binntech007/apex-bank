// actions/2fa.ts
'use server';
import { authenticator } from '@otplib/preset-default';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Rest of your functions remain the same...
// 🔑 Generate 2FA Secret and QR Code
export async function generate2FASecret(email: string) {
  try {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, 'Apex Vault', secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    await db.update(users)
      .set({ twoFactorSecret: secret })
      .where(eq(users.email, email));

    return { success: true, secret, qrCodeUrl };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to generate 2FA secret.' };
  }
}

// 🛡️ Verify and Enable 2FA
export async function verifyAndEnable2FA(email: string, token: string) {
  try {
    const [user] = await db
      .select({ twoFactorSecret: users.twoFactorSecret })
      .from(users)
      .where(eq(users.email, email));

    if (!user || !user.twoFactorSecret) {
      return { success: false, error: 'No 2FA secret found. Please restart setup.' };
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });

    if (!isValid) {
      return { success: false, error: 'Invalid authenticator code. Please try again.' };
    }

    await db.update(users)
      .set({ twoFactorEnabled: true })
      .where(eq(users.email, email));

    return { success: true, message: 'Two-Factor Authentication enabled successfully!' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to enable 2FA.' };
  }
}

// 🔓 Disable 2FA
export async function disable2FA(email: string) {
  try {
    await db.update(users)
      .set({ twoFactorEnabled: false, twoFactorSecret: null })
      .where(eq(users.email, email));

    return { success: true, message: 'Two-Factor Authentication has been disabled.' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to disable 2FA.' };
  }
}