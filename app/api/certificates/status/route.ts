import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const certificate = await prisma.userCertificate.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        isActive: true,
        issuedAt: true,
        expiresAt: true,
        revokedAt: true
      }
    });

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error('Error in /api/certificates/status:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch certificate status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
} 