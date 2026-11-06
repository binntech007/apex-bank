
// auth.config.ts

import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
  },

  providers: [],

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

        session.user.role =
          (token.role as 'customer' | 'admin') || 'customer';
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
