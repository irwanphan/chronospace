import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { generateUserCertificate } from '@/lib/certificate-generator';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId } = await request.json();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission to generate certificate
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized to generate certificate for this user' }, { status: 403 });
    }

    // Revoke any existing active certificates
    await prisma.userCertificate.updateMany({
      where: {
        userId,
        isActive: true,
        revokedAt: null
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revocationReason: 'New certificate generated'
      }
    });

    // Generate new certificate
    const certificate = await generateUserCertificate({
      userId,
      commonName: user.name || 'Unknown',
      email: user.email || '',
      organization: 'ChronoSpace',
      validityDays: 365
    });

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.certificateId,
        serialNumber: certificate.serialNumber,
        expiresAt: certificate.expiresAt,
        p12: certificate.p12Buffer.toString('base64'),
        password: certificate.p12Password
      }
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate certificate' 
    }, { status: 500 });
  }
} 