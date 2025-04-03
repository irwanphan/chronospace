import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { generateUserCertificate } from '@/lib/certificate-generator';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId } = await request.json();

    // Generate certificate
    const certificate = await generateUserCertificate({
      userId,
      commonName: session.user.name || 'Unknown',
      email: session.user.email || '',
      organization: 'Your Organization',
      validityDays: 365
    });

    // Return certificate and password
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
  } catch (error: any) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate certificate'
    }, { status: 500 });
  }
} 