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

    // Get document info from database
    const document = await prisma.document.findFirst({
      where: {
        signedFileUrl: fileUrl
      },
      include: {
        signedByUser: true
      }
    });

    if (!document) {
      return NextResponse.json({
        isDigitallySigned: false
      });
    }

    // If document is signed, get the certificate used
    if (document.signedAt && document.signedByUser?.id) {
      const certificate = await prisma.userCertificate.findFirst({
        where: {
          userId: document.signedByUser.id,
          isActive: true,
          revokedAt: null,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      return NextResponse.json({
        isDigitallySigned: true,
        signedBy: document.signedByUser?.name,
        signedAt: document.signedAt,
        certificateInfo: certificate ? {
          isValid: true,
          expiresAt: certificate.expiresAt
        } : undefined
      });
    }

    return NextResponse.json({
      isDigitallySigned: false
    });
  } catch (error) {
    console.error('Error in /api/documents/verify:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to verify signature',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
} 