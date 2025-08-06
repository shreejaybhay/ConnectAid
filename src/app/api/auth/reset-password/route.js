import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify the token
    const verification = await VerificationToken.verifyToken(token, 'password_reset');
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.reason },
        { status: 400 }
      );
    }

    const user = verification.user;

    // Update user's password
    user.password = password; // Will be hashed by the pre-save middleware
    await user.save();

    return NextResponse.json({
      message: 'Password reset successfully! You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET route to verify reset token (for the reset password page)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if token is valid without using it
    const isValid = await VerificationToken.isValidToken(token, 'password_reset');
    
    return NextResponse.json({
      valid: isValid
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
