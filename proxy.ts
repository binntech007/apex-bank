
// proxy.ts

import NextAuth from 'next-auth';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

import { authConfig } from '@/auth.config';
import { routing } from '@/lib/i18n/routing';

const { auth } = NextAuth(authConfig);

const handleI18nRouting = createMiddleware(routing);

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // Skip API routes and static assets.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle locale routing first.
  const i18nResponse = handleI18nRouting(req);

  // Return locale redirects or rewrites immediately.
  if (i18nResponse.status !== 200) {
    return i18nResponse;
  }

  const locale = routing.locales.find(
    (item) =>
      pathname === `/${item}` ||
      pathname.startsWith(`/${item}/`)
  );

  const pathnameWithoutLocale = locale
    ? pathname.slice(locale.length + 1) || '/'
    : pathname;

  const currentLocale = locale || routing.defaultLocale;

  const isLoggedIn = Boolean(req.auth?.user);
  const userRole = req.auth?.user?.role;

  const isAdminRoute =
    pathnameWithoutLocale.startsWith('/admin') &&
    !pathnameWithoutLocale.startsWith('/admin/login');

  const isDashboardRoute =
    pathnameWithoutLocale.startsWith('/dashboard');

  if (isAdminRoute && (!isLoggedIn || userRole !== 'admin')) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}/admin/login`, req.url)
    );
  }

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}/login`, req.url)
    );
  }

  return i18nResponse;
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
