import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email (include password for verification if provided)
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select(password ? '+password' : '-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If password is provided, verify it
    let passwordValid = true;
    if (password) {
      passwordValid = await user.comparePassword(password);
      if (!passwordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    }

    // Check if user can login
    const loginCheck = user.canLogin();

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        isApproved: user.isApproved,
        isActive: user.isActive
      },
      canLogin: loginCheck.canLogin,
      reason: loginCheck.reason
    });

  } catch (error) {
    console.error('Check user status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
