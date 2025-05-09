import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Only allow users to update their own profile picture
    if (session.user.id !== params.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new NextResponse('File must be an image', { status: 400 });
    }

    // Upload to Vercel Blob
    const { url } = await put(`profile-pictures/${params.id}-${Date.now()}.${file.name.split('.').pop()}`, file, {
      access: 'public',
      contentType: file.type
    });

    // Update user's profile picture in database
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { image: url }
    });

    // Log activity
    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'USER',
        entityId: params.id,
        entityCode: null,
        details: {
          type: 'profile_picture_update',
          newImageUrl: url
        }
      }
    });

    return NextResponse.json({ success: true, imageUrl: url });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to upload profile picture',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
} 