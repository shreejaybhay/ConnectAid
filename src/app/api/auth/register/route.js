import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, phone, location, userType } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Determine role based on userType and admin email
    let role = 'citizen'; // default
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    
    if (email.toLowerCase() === adminEmail) {
      role = 'admin';
    } else if (userType === 'volunteer') {
      role = 'volunteer';
    }

    // Create new user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim(),
      location: location?.trim(),
      role,
      emailVerified: false,
      isApproved: role === 'citizen' || role === 'admin' // Auto-approve citizens and admin
    });

    await user.save();

    // Create email verification token
    const verificationToken = await VerificationToken.createToken(
      user._id,
      user.email,
      'email_verification'
    );

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.firstName, verificationToken.token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    // Send admin notification for volunteer registration
    if (role === 'volunteer') {
      try {
        const { sendVolunteerNotificationEmail } = await import('@/lib/email');
        await sendVolunteerNotificationEmail({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          location: user.location
        });
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail registration if email fails
      }
    }

    return NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        isApproved: user.isApproved
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
