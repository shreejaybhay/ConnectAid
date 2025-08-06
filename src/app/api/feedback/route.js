import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import Request from '@/models/Request';

// GET - Get feedback (for a user or request)
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const requestId = searchParams.get('requestId');
    const limit = parseInt(searchParams.get('limit')) || 10;

    let feedback;

    if (requestId) {
      // Get feedback for a specific request
      feedback = await Feedback.getRequestFeedback(requestId);
      return NextResponse.json({ feedback });
    } else if (userId) {
      // Get feedback for a specific user
      feedback = await Feedback.getUserFeedback(userId, { limit });
      const stats = await Feedback.getUserAverageRating(userId);
      
      return NextResponse.json({ 
        feedback, 
        stats 
      });
    } else {
      // Get feedback given by the current user
      feedback = await Feedback.find({ 
        fromUser: session.user.id,
        isActive: true 
      })
      .populate('toUser', 'firstName lastName')
      .populate('requestId', 'title type')
      .sort({ createdAt: -1 })
      .limit(limit);

      return NextResponse.json({ feedback });
    }

  } catch (error) {
    console.error('Get feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create feedback
export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { requestId, toUserId, rating, comment, isPublic = true } = body;

    // Validate required fields
    if (!requestId || !toUserId || !rating) {
      return NextResponse.json(
        { error: 'Request ID, recipient user ID, and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if the request exists and is completed
    const requestDoc = await Request.findById(requestId);
    if (!requestDoc) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (requestDoc.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only leave feedback for completed requests' },
        { status: 400 }
      );
    }

    // Check if user is authorized to leave feedback for this request
    const canLeaveFeedback = 
      requestDoc.createdBy.toString() === session.user.id ||
      requestDoc.assignedTo?.toString() === session.user.id;

    if (!canLeaveFeedback) {
      return NextResponse.json(
        { error: 'Not authorized to leave feedback for this request' },
        { status: 403 }
      );
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.feedbackExists(requestId, session.user.id);
    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback already exists for this request' },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = new Feedback({
      requestId,
      fromUser: session.user.id,
      toUser: toUserId,
      rating,
      comment: comment?.trim(),
      isPublic
    });

    await feedback.save();

    // Populate and return the created feedback
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('fromUser', 'firstName lastName')
      .populate('toUser', 'firstName lastName')
      .populate('requestId', 'title type');

    return NextResponse.json({
      message: 'Feedback submitted successfully',
      feedback: populatedFeedback
    }, { status: 201 });

  } catch (error) {
    console.error('Create feedback error:', error);
    
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
