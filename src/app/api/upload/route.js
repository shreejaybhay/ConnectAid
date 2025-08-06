import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadImage, uploadMultipleImages } from '@/lib/cloudinary';

// POST - Upload images
export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { images, folder = 'connectaid/general' } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Validate image count (max 5 images)
    if (images.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed' },
        { status: 400 }
      );
    }

    // Upload images
    const uploadResult = await uploadMultipleImages(images, {
      folder,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: 'Failed to upload images', details: uploadResult.error },
        { status: 500 }
      );
    }

    // Return successful uploads
    const uploadedImages = uploadResult.successful.map(img => ({
      url: img.url,
      publicId: img.publicId,
      width: img.width,
      height: img.height,
      format: img.format,
      bytes: img.bytes
    }));

    return NextResponse.json({
      message: 'Images uploaded successfully',
      images: uploadedImages,
      stats: {
        total: uploadResult.total,
        successful: uploadResult.successCount,
        failed: uploadResult.failCount
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
