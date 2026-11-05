// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// 1. Create the next-intl middleware 🌐
const handleI18nRouting = createMiddleware(routing);

export default auth((req) => {
  const { nextUrl } = req;

  // 2. Bypass middleware entirely for static files, API routes, and assets to protect styling 🛡️
  if (
    nextUrl.pathname.startsWith('/api') ||
    nextUrl.pathname.startsWith('/_next') ||
    nextUrl.pathname.includes('.') // Catches file extensions like .css, .js, .ico, .png
  ) {
    return NextResponse.next();
  }

  // 3. Run next-intl routing 🗺️
  const i18nResponse = handleI18nRouting(req);
  if (i18nResponse && i18nResponse.status !== 200) {
    return i18nResponse;
  }

  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  // Strip locale prefix to check route protection accurately (e.g., /en/dashboard -> /dashboard)
  const pathnameWithoutLocale = nextUrl.pathname.replace(/^\/(en|es|fr)/, '') || '/';
  
  // FIX: Removed `pathnameWithoutLocale === '/'` so the landing page stays public 🔓
  const isDashboardRoute = pathnameWithoutLocale.startsWith('/dashboard');
  const isAdminRoute = pathnameWithoutLocale.startsWith('/admin') && !pathnameWithoutLocale.startsWith('/admin/login');
  
  const currentLocale = nextUrl.pathname.split('/')[1] || 'en';

  if (isAdminRoute && (!isLoggedIn || userRole !== 'admin')) {
    return NextResponse.redirect(new URL(`/${currentLocale}/admin/login`, nextUrl));
  }

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/${currentLocale}/login`, nextUrl));
  }

  return i18nResponse || NextResponse.next();
});

export const config = {
  // Exclude API, static paths, and any file with an extension (like CSS/JS chunks)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};