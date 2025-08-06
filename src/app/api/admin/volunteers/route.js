import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET - List pending volunteers
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all volunteers pending approval
    const pendingVolunteers = await User.find({
      role: 'volunteer',
      isApproved: false,
      emailVerified: true // Only show email-verified volunteers
    }).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({
      volunteers: pendingVolunteers
    });

  } catch (error) {
    console.error('Get volunteers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Approve or reject volunteer
export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { volunteerId, action } = body; // action: 'approve' or 'reject'

    if (!volunteerId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    await connectDB();

    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return NextResponse.json(
        { error: 'Volunteer not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      volunteer.isApproved = true;
      volunteer.approvedAt = new Date();
      volunteer.approvedBy = session.user.id;
      await volunteer.save();

      return NextResponse.json({
        message: `${volunteer.firstName} ${volunteer.lastName} has been approved as a volunteer.`,
        volunteer: {
          id: volunteer._id,
          firstName: volunteer.firstName,
          lastName: volunteer.lastName,
          email: volunteer.email,
          isApproved: volunteer.isApproved,
          approvedAt: volunteer.approvedAt
        }
      });
    } else {
      // For rejection, we could either delete the user or mark them as rejected
      // For now, let's delete them
      await User.findByIdAndDelete(volunteerId);

      return NextResponse.json({
        message: `${volunteer.firstName} ${volunteer.lastName}'s volunteer application has been rejected.`
      });
    }

  } catch (error) {
    console.error('Volunteer approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
