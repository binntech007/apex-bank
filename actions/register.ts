// actions/register.ts
'use server';

import crypto from 'crypto';
import { db } from '@/lib/db';
import { users, ledgerAccounts, verificationCodes } from '@/lib/db/schema';
import { CustomerRegisterSchema, CustomerRegisterInput, CurrencyCode } from '@/lib/validations/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mail';

function generateAccountNumber(): string {
  const prefix = '3';
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
  return `${prefix}${randomDigits.slice(0, 9)}`;
}

// 📝 Step 1: Validate input, save temporary code, and send verification email
export async function initiateRegistration(formData: CustomerRegisterInput) {
  try {
    const validated = CustomerRegisterSchema.parse(formData);

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, validated.email));

    if (existing.length > 0) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    await db.insert(verificationCodes).values({
      email: validated.email,
      code,
      password: hashedPassword,
      expiresAt,
    }).onConflictDoUpdate({
      target: verificationCodes.email,
      set: { code, password: hashedPassword, expiresAt },
    });

    // 📧 Send verification email via Gmail SMTP
    await sendEmail({
      to: validated.email,
      subject: 'Verify Your Apex Vault Account 🛡️',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0B0F17; color: #E2E8F0; padding: 24px; border-radius: 12px;">
          <h2 style="color: #8B5CF6;">Email Verification</h2>
          <p>Your 6-digit verification code is:</p>
          <h1 style="color: #FFFFFF; letter-spacing: 4px;">${code}</h1>
          <p style="color: #94A3B8; font-size: 12px;">This code expires in 15 minutes.</p>
        </div>
      `,
    });

    return { success: true, requiresVerification: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, fieldErrors: err.flatten().fieldErrors };
    }
    return { success: false, error: err.message || 'Registration initiation failed.' };
  }
}

// 🛡️ Step 2: Verify code, create user, initialize ledger account, and send success notification
export async function verifyAndRegister(email: string, code: string, primaryCurrency: CurrencyCode) {
  try {
    const [record] = await db
      .select()
      .from(verificationCodes)
      .where(eq(verificationCodes.email, email));

    if (!record || record.code !== code || new Date() > record.expiresAt) {
      return { success: false, error: 'Invalid or expired verification code.' };
    }

    let accountNumber = generateAccountNumber();
    let isUnique = false;

    while (!isUnique) {
      const checkNumber = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.accountNumber, accountNumber));

      if (checkNumber.length === 0) {
        isUnique = true;
      } else {
        accountNumber = generateAccountNumber();
      }
    }

    const [newUser] = await db
      .insert(users)
      .values({
        name: email.split('@')[0],
        email: record.email,
        password: record.password,
        accountNumber,
        role: 'customer',
        kycStatus: 'pending',
      })
      .returning();

    // 🏦 Create primary vault ledger account with the selected currency
    await db.insert(ledgerAccounts).values({
      userId: newUser.id,
      accountNumber: newUser.accountNumber,
      name: `Primary Vault (${primaryCurrency})`,
      category: 'liability',
      currency: primaryCurrency,
    });

    // 📧 Send success confirmation email
    await sendEmail({
      to: newUser.email,
      subject: 'Welcome to Apex Vault — Registration Successful 👑',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0B0F17; color: #E2E8F0; padding: 24px; border-radius: 12px;">
          <h2 style="color: #8B5CF6;">Account Activated Successfully!</h2>
          <p>Hello ${newUser.name},</p>
          <p>Your private wealth account and primary ${primaryCurrency} vault are now active.</p>
          <p><strong>Account Number:</strong> ${accountNumber}</p>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 20px;">If you have any questions, please contact our security team.</p>
        </div>
      `,
    });

    await db.delete(verificationCodes).where(eq(verificationCodes.email, email));

    return { success: true, user: newUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'Account creation failed.' };
  }
}