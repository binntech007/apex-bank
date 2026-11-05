'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs'; 

// 🔢 Helper function to generate a 10-digit account number starting with '3'
function generateAccountNumber(): string {
  const prefix = '3';
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
  return `${prefix}${randomDigits.slice(0, 9)}`;
}

// 🛡️ Admin Registration Action
export async function registerAdmin(formData: {
  fullName: string;
  email: string;
  password: string; // 👈 Added password field
  adminSecret: string;
}) {
  try {
    const { fullName, email, password, adminSecret } = formData;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    // Optional: Check adminSecret here if you have an environment secret
    // if (adminSecret !== process.env.ADMIN_SECRET) {
    //   return { success: false, error: 'Invalid admin secret key.' };
    // }

    // 1. Ensure generated account number is unique in DB 
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

    // 2. Hash the password before saving 🔑
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Insert Admin Record into Neon DB 🐘
    const [newAdmin] = await db
      .insert(users)
      .values({
        name: fullName,
        email: email.toLowerCase().trim(),
        password: hashedPassword, // 👈 Storing hashed password
        accountNumber,
        role: 'admin',
        kycStatus: 'approved',
      })
      .returning();

    return { success: true, user: newAdmin };
  } catch (err: any) {
    console.error('Admin Registration Error:', err);
    return { success: false, error: err.message || 'Admin registration failed.' };
  }
}

// 🔐 Admin Login Verification Action
export async function verifyAdminLogin(formData: {
  email: string;
  password: string;
}) {
  try {
    const { email, password } = formData;

    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // 1. Retrieve the user by email and admin role 🛡️
    const [adminUser] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email.toLowerCase().trim()), 
          eq(users.role, 'admin')
        )
      );

    if (!adminUser) {
      return { success: false, error: 'Admin account not found or unauthorized.' };
    }

    if (!adminUser.password) {
      return { success: false, error: 'Password is not configured for this account.' };
    }

    // 2. Compare entered password with stored hash 🔑
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid admin password.' };
    }

    return { success: true, user: adminUser };
  } catch (err: any) {
    console.error('Admin Login Error:', err);
    return { success: false, error: err.message || 'Login verification failed.' };
  }
}