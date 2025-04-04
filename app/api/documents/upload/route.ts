import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Upload ke Vercel Blob
    const { url } = await put(`documents/${file.name}`, file, {
      access: 'public',
      contentType: 'application/pdf'
    });

    // Simpan ke database dengan informasi uploader
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileUrl: url,
        uploadedAt: new Date(),
        uploader: {
          connect: {
            id: session.user.id
          }
        }
      }
    });

    return NextResponse.json({ success: true, document });

  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
} 