import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify the token
    const verification = await VerificationToken.verifyToken(token, 'email_verification');
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.reason },
        { status: 400 }
      );
    }

    const user = verification.user;

    // Update user's email verification status
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    return NextResponse.json({
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        isApproved: user.isApproved
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET route for email verification via URL (when user clicks link in email)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=missing-token', request.url));
    }

    await connectDB();

    // Verify the token
    const verification = await VerificationToken.verifyToken(token, 'email_verification');
    
    if (!verification.valid) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url));
    }

    const user = verification.user;

    // Update user's email verification status
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    // Redirect to login with success message
    return NextResponse.redirect(new URL('/login?verified=true', request.url));

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/login?error=verification-failed', request.url));
  }
}
