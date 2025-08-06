import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Request from '@/models/Request';
import { deleteMultipleImages, uploadMultipleImages } from '@/lib/cloudinary';

// GET - Get a specific request
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const requestDoc = await Request.findById(id)
      .populate('createdBy', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email phone');

    if (!requestDoc) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const canView = 
      session.user.role === 'admin' ||
      requestDoc.createdBy._id.toString() === session.user.id ||
      (session.user.role === 'volunteer' && (
        requestDoc.status === 'open' || 
        requestDoc.assignedTo?._id.toString() === session.user.id
      ));

    if (!canView) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ request: requestDoc });

  } catch (error) {
    console.error('Get request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a request
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const requestDoc = await Request.findById(id);

    if (!requestDoc) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action, ...updateData } = body;

    // Handle different types of updates
    if (action === 'accept') {
      // Volunteer accepting a request
      if (session.user.role !== 'volunteer') {
        return NextResponse.json(
          { error: 'Only volunteers can accept requests' },
          { status: 403 }
        );
      }

      if (requestDoc.status !== 'open') {
        return NextResponse.json(
          { error: 'Request is not available for acceptance' },
          { status: 400 }
        );
      }

      if (requestDoc.createdBy.toString() === session.user.id) {
        return NextResponse.json(
          { error: 'Cannot accept your own request' },
          { status: 400 }
        );
      }

      requestDoc.status = 'accepted';
      requestDoc.assignedTo = session.user.id;
      requestDoc.acceptedAt = new Date();

    } else if (action === 'update_status') {
      // Update request status (volunteers and admins)
      const { status } = updateData;

      if (!requestDoc.canUpdateStatus(session.user.id, session.user.role)) {
        return NextResponse.json(
          { error: 'Not authorized to update this request status' },
          { status: 403 }
        );
      }

      if (!['accepted', 'in_progress', 'completed'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }

      requestDoc.status = status;
      if (status === 'completed') {
        requestDoc.completedAt = new Date();
      }

    } else {
      // Regular update (citizens updating their own requests)
      if (!requestDoc.canEdit(session.user.id)) {
        return NextResponse.json(
          { error: 'Not authorized to edit this request' },
          { status: 403 }
        );
      }

      // Only allow updates if request is still open
      if (requestDoc.status !== 'open') {
        return NextResponse.json(
          { error: 'Cannot edit request that has been accepted' },
          { status: 400 }
        );
      }

      // Handle image updates
      let finalImages = [];

      // Keep existing images that weren't removed
      if (updateData.existingImages && Array.isArray(updateData.existingImages)) {
        finalImages = [...updateData.existingImages];
      }

      // Upload new images if provided
      if (updateData.images && Array.isArray(updateData.images) && updateData.images.length > 0) {
        try {
          const uploadResult = await uploadMultipleImages(updateData.images, {
            folder: 'connectaid/requests'
          });

          if (uploadResult.success) {
            const newUploadedImages = uploadResult.successful.map(img => ({
              url: img.url,
              publicId: img.publicId
            }));
            finalImages = [...finalImages, ...newUploadedImages];
          } else {
            console.error('Image upload failed:', uploadResult.error);
          }
        } catch (error) {
          console.error('Image upload error:', error);
        }
      }

      // Update allowed fields
      const allowedFields = ['title', 'description', 'type', 'location', 'priority', 'contactInfo'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          requestDoc[field] = updateData[field];
        }
      });

      // Update images
      requestDoc.images = finalImages;
    }

    await requestDoc.save();

    // Populate and return updated request
    const updatedRequest = await Request.findById(requestDoc._id)
      .populate('createdBy', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email phone');

    return NextResponse.json({
      message: 'Request updated successfully',
      request: updatedRequest
    });

  } catch (error) {
    console.error('Update request error:', error);
    
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

// DELETE - Delete a request
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const requestDoc = await Request.findById(id);

    if (!requestDoc) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const canDelete = 
      session.user.role === 'admin' ||
      (requestDoc.canEdit(session.user.id) && requestDoc.status === 'open');

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Not authorized to delete this request' },
        { status: 403 }
      );
    }

    // Delete associated images from Cloudinary
    if (requestDoc.images && requestDoc.images.length > 0) {
      const publicIds = requestDoc.images.map(img => img.publicId);
      await deleteMultipleImages(publicIds);
    }

    // Soft delete - mark as inactive
    requestDoc.isActive = false;
    await requestDoc.save();

    return NextResponse.json({
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
