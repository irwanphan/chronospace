import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    if (!fileUrl) {
      return new NextResponse('Missing file URL', { status: 400 });
    }

    // Get document and its signatures
    const document = await prisma.document.findFirst({
      where: {
        OR: [
          { fileUrl: fileUrl },
          { signedFileUrl: fileUrl }
        ]
      },
      include: {
        signatures: {
          include: {
            user: {
              include: {
                role: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ signatures: [] });
    }

    return NextResponse.json({
      signatures: document.signatures
    });
  } catch (error) {
    console.error('Error in /api/documents/signatures:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch signatures',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
} 