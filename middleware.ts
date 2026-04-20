import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Routes protégées : uniquement le dashboard admin
  const isDashboard = nextUrl.pathname.startsWith('/dashboard');

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Gestion inactivité (verrouillage session)
  if (isLoggedIn && isDashboard) {
    const lastActivity = req.cookies.get('lastActivity')?.value;
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    if (
      lastActivity &&
      now - parseInt(lastActivity) > timeout &&
      nextUrl.pathname !== '/lock'
    ) {
      return NextResponse.redirect(new URL('/lock', nextUrl));
    }

    const response = NextResponse.next();
    response.cookies.set('lastActivity', now.toString(), { path: '/' });
    return response;
  }

  return NextResponse.next();
});

export const config = {
  // Exclure : api, _next, fichiers statiques, pages publiques et espace partenaire
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|lock|forgot-password|reset-password|partner|$).*)',
  ],
};
