import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Définition des routes protégées
  const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/partner');

  // Si l'utilisateur tente d'accéder à une route protégée sans être connecté
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Gestion de l'inactivité de 60 secondes via les cookies de session
  if (isLoggedIn) {
    const lastActivity = req.cookies.get('lastActivity')?.value;
    const now = Date.now();

    // Si le délai est dépassé (60000ms = 60s) et qu'on n'est pas déjà sur /lock
    if (lastActivity && (now - parseInt(lastActivity)) > 60000 && nextUrl.pathname !== '/lock') {
      return NextResponse.redirect(new URL('/lock', nextUrl));
    }

    // Mise à jour du timestamp d'activité
    const response = NextResponse.next();
    response.cookies.set('lastActivity', now.toString(), { path: '/' });
    return response;
  }

  return NextResponse.next();
});

// Exclusion des fichiers statiques et images
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};