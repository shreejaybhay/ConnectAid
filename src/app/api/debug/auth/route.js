import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    // Get session using auth()
    const session = await auth();
    
    // Get token using getToken
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token'
    });

    // Get cookies from request
    const cookies = request.cookies.getAll();
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('next-auth') || cookie.name.includes('__Secure-next-auth')
    );

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      token: token ? {
        email: token.email,
        role: token.role,
        id: token.id
      } : null,
      cookies: authCookies.map(cookie => ({
        name: cookie.name,
        hasValue: !!cookie.value,
        valueLength: cookie.value?.length || 0
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV,
      hasSecret: !!process.env.NEXTAUTH_SECRET
    }, { status: 500 });
  }
}
