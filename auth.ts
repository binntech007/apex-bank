
// auth.ts

import NextAuth, {
  type DefaultSession,
  CredentialsSignin,
} from 'next-auth';

import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from '@/auth.config';
import { db } from '@/lib/db';

import {
  users,
  accounts,
  sessions,
  auditLogs,
} from '@/lib/db/schema';

import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import { authenticator } from '@otplib/preset-default';
import { randomUUID } from 'node:crypto';

// ============================================
// CUSTOM AUTHENTICATION ERRORS
// ============================================

class TwoFactorRequiredError extends CredentialsSignin {
  constructor() {
    super();
    this.code = '2FA_REQUIRED';
  }
}

class InvalidTwoFactorError extends CredentialsSignin {
  constructor() {
    super();
    this.code = 'INVALID_2FA_TOKEN';
  }
}

class AccountSuspendedError extends CredentialsSignin {
  constructor() {
    super();
    this.code = 'ACCOUNT_SUSPENDED';
  }
}

class InvalidPasswordError extends CredentialsSignin {
  constructor() {
    super();
    this.code = 'INVALID_PASSWORD';
  }
}

// ============================================
// NEXTAUTH TYPE AUGMENTATION
// ============================================

declare module 'next-auth' {
  interface User {
    role?: 'customer' | 'admin';
  }

  interface Session {
    user: {
      id: string;
      role: 'customer' | 'admin';
    } & DefaultSession['user'];
  }
}

// ============================================
// NEXTAUTH CONFIGURATION
// ============================================

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }) as any,

  session: {
    strategy: 'jwt',
  },

  providers: [
    Credentials({
      name: 'Credentials',

      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },

        password: {
          label: 'Password',
          type: 'password',
        },

        twoFactorToken: {
          label: '2FA Token',
          type: 'text',
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const plainPassword = String(credentials.password);

        const twoFactorToken = credentials.twoFactorToken
          ? String(credentials.twoFactorToken)
          : undefined;

        // 1. Retrieve user
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.password) {
          throw new InvalidPasswordError();
        }

        // 2. Check suspended account
        if (user.isSuspended) {
          throw new AccountSuspendedError();
        }

        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(
          plainPassword,
          user.password
        );

        if (!isPasswordValid) {
          throw new InvalidPasswordError();
        }

        // 4. Verify two-factor authentication
        if (user.twoFactorEnabled) {
          if (!twoFactorToken) {
            throw new TwoFactorRequiredError();
          }

          const isTokenValid = authenticator.verify({
            token: twoFactorToken,
            secret: user.twoFactorSecret || '',
          });

          if (!isTokenValid) {
            throw new InvalidTwoFactorError();
          }
        }

        // 5. Capture request information
        let ipAddress = '127.0.0.1';
        let rawUserAgent = '';

        try {
          const headerList = await headers();

          rawUserAgent = headerList.get('user-agent') || '';

          ipAddress =
            headerList.get('cf-connecting-ip') ||
            headerList.get('x-client-ip') ||
            headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
            headerList.get('x-real-ip') ||
            '127.0.0.1';
        } catch {
          // Use fallback values if request headers are unavailable.
        }

        // 6. Parse device information
        const parser = new UAParser(rawUserAgent);

        const device = parser.getDevice();
        const os = parser.getOS();
        const browser = parser.getBrowser();

        let deviceLabel = 'Unknown Device';

        if (device.vendor || device.model) {
          deviceLabel = `${device.vendor || ''} ${
            device.model || ''
          }`.trim();
        } else if (os.name) {
          deviceLabel = `${browser.name || 'Browser'} on ${os.name}`;
        }

        // 7. Save custom session record
        await db.insert(sessions).values({
          sessionToken: randomUUID(),
          userId: user.id,
          expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ),
          userAgent: deviceLabel,
          ipAddress,
          lastActive: new Date(),
        });

        // 8. Save security audit log
        await db.insert(auditLogs).values({
          userId: user.id,
          action: 'USER_SIGNIN',
          ipAddress,
          userAgent: rawUserAgent,
        });

        // 9. Return authenticated user
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'customer' | 'admin',
        };
      },
    }),
  ],
});
