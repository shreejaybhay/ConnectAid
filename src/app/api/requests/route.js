import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Request from '@/models/Request';
import { uploadMultipleImages } from '@/lib/cloudinary';

// GET - Fetch requests based on user role and query parameters
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
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    let requests;

    // Build query based on filters
    if (status) query.status = status;
    if (type) query.type = type;

    // Role-based access control
    if (session.user.role === 'citizen') {
      // Citizens can only see their own requests
      query.createdBy = session.user.id;
      
      requests = await Request.find(query)
        .populate('assignedTo', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else if (session.user.role === 'volunteer') {
      // Volunteers can see open requests and their assigned requests
      if (status === 'assigned' || status === 'in_progress' || status === 'completed' || status === 'accepted') {
        query.assignedTo = session.user.id;
      } else if (status === 'open') {
        // For open requests, only show truly open requests (not assigned to anyone)
        query.status = 'open';
        query.assignedTo = { $exists: false };
        query.createdBy = { $ne: session.user.id }; // Exclude their own requests
      } else {
        // Default: show open requests and their assigned requests
        query.$or = [
          { status: 'open', assignedTo: { $exists: false }, createdBy: { $ne: session.user.id } },
          { assignedTo: session.user.id }
        ];
        delete query.status; // Remove status filter for $or query
      }

      requests = await Request.find(query)
        .populate('createdBy', 'firstName lastName email phone')
        .populate('assignedTo', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else if (session.user.role === 'admin') {
      // Admins can see all requests
      requests = await Request.find(query)
        .populate('createdBy', 'firstName lastName email phone')
        .populate('assignedTo', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    // Get total count for pagination
    const total = await Request.countDocuments(query);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new request (Citizens only)
export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only citizens can create requests
    if (session.user.role !== 'citizen') {
      return NextResponse.json(
        { error: 'Only citizens can create service requests' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { 
      title, 
      description, 
      type, 
      location, 
      priority = 'medium',
      contactInfo = {},
      images = []
    } = body;

    // Validate required fields
    if (!title || !description || !type || !location) {
      return NextResponse.json(
        { error: 'Title, description, type, and location are required' },
        { status: 400 }
      );
    }

    // Upload images if provided
    let uploadedImages = [];
    if (images && images.length > 0) {
      try {
        const uploadResult = await uploadMultipleImages(images, {
          folder: 'connectaid/requests'
        });

        if (uploadResult.success) {
          uploadedImages = uploadResult.successful.map(img => ({
            url: img.url,
            publicId: img.publicId
          }));
        } else {
          console.error('Image upload failed:', uploadResult.error);
          // Continue without images rather than failing the request
        }
      } catch (error) {
        console.error('Image upload error:', error);
        // Continue without images rather than failing the request
      }
    }

    // Create new request
    const newRequest = new Request({
      title: title.trim(),
      description: description.trim(),
      type,
      location: location.trim(),
      priority,
      contactInfo: {
        phone: contactInfo.phone?.trim(),
        email: contactInfo.email?.trim() || session.user.email,
        preferredContact: contactInfo.preferredContact || 'both'
      },
      images: uploadedImages,
      createdBy: session.user.id,
      status: 'open'
    });

    await newRequest.save();

    // Populate the created request
    const populatedRequest = await Request.findById(newRequest._id)
      .populate('createdBy', 'firstName lastName email phone');

    return NextResponse.json({
      message: 'Request created successfully',
      request: populatedRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Create request error:', error);
    
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
