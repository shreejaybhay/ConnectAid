import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/public/')) {
    return NextResponse.next();
  }

  let token = null;

  try {
    // Try primary cookie name first
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'
    });

    // If no token found and in production, try alternative cookie name
    if (!token && process.env.NODE_ENV === 'production') {
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: 'next-auth.session-token'
      });
    }
  } catch (error) {
    console.error('Error getting token in middleware:', error);

    // Try without specifying cookieName as fallback
    try {
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      });
    } catch (fallbackError) {
      console.error('Fallback token retrieval also failed:', fallbackError);
    }
  }

  // Enhanced debug logging for production issues
  console.log('Middleware Debug:', {
    path: pathname,
    hasToken: !!token,
    userRole: token?.role,
    userEmail: token?.email,
    environment: process.env.NODE_ENV,
    hasSecret: !!process.env.NEXTAUTH_SECRET
  });

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/admin'];
  const adminRoutes = ['/admin'];
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If it's a protected route and user is not authenticated
  if (isProtectedRoute && !token) {
    console.log('Redirecting to login - no token for protected route:', pathname);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If it's an admin route and user is not admin
  if (isAdminRoute && token?.role !== 'admin') {
    console.log('Redirecting to dashboard - non-admin accessing admin route:', pathname, 'Role:', token?.role);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (token && isAuthRoute) {
    const redirectUrl = token.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    console.log('Redirecting authenticated user from auth page to:', redirectUrl);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
