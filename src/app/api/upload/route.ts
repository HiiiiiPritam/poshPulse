import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();

    // Generate a unique public ID (excluding extension is often safer for Cloudinary)
    // Previous logic: `${Date.now()}-${filename}`
    // New logic: `${Date.now()}-${filename_without_ext}`
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
    const publicId = `${Date.now()}-${nameWithoutExt}`;

    const timestamp = Math.round((new Date).getTime() / 1000);

    // Parameters to sign
    const paramsToSign = {
      timestamp: timestamp,
      public_id: publicId,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      publicId,
      postUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
