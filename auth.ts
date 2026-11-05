// auth.ts
import NextAuth, { type DefaultSession, CredentialsSignin } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users, accounts, sessions, auditLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import { authenticator } from '@otplib/preset-default';

// 🛡️ Custom error classes
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

// Extend NextAuth types 🏷️
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        twoFactorToken: { label: '2FA Token', type: 'text' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const plainPassword = credentials.password as string;
        const twoFactorToken = credentials.twoFactorToken as string | undefined;

        // 1. Fetch user from database 🔍
        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user || !user.password) {
          throw new InvalidPasswordError();
        }

        // 🚫 2. Check if account is suspended by an admin
        if (user.isSuspended) {
          throw new AccountSuspendedError();
        }

        // 3. Verify password hash 🔑
        const isPasswordValid = await bcrypt.compare(plainPassword, user.password);
        if (!isPasswordValid) {
          throw new InvalidPasswordError();
        }

        // 4. Verify 2FA if enabled 🛡️
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

        // 5. Capture metadata & parse device information safely 🕵️‍♂️
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
        } catch (e) {
          // Fallback if headers context is unavailable
        }

        const parser = new UAParser(rawUserAgent);
        const device = parser.getDevice();
        const os = parser.getOS();
        const browser = parser.getBrowser();

        let deviceLabel = 'Unknown Device';
        if (device.vendor || device.model) {
          deviceLabel = `${device.vendor || ''} ${device.model || ''}`.trim();
        } else if (os.name) {
          deviceLabel = `${browser.name || 'Browser'} on ${os.name}`;
        }

        // Save session entry to database 💾
        await db.insert(sessions).values({
          sessionToken: crypto.randomUUID(),
          userId: user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          userAgent: deviceLabel,
          ipAddress,
          lastActive: new Date(),
        });

        // 📝 Record security audit log entry
        await db.insert(auditLogs).values({
          userId: user.id,
          action: 'USER_SIGNIN',
          ipAddress,
          userAgent: rawUserAgent,
        });

        // 6. Return user object cleanly ✅
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'customer' | 'admin',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as 'customer' | 'admin';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as 'customer' | 'admin') || 'customer';
      }
      return session;
    },
  },
});