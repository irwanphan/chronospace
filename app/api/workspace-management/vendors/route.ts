import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { VendorService } from '@/services/vendor.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    
    // Log untuk debugging
    // console.log('Request body:', body);

    // Cek apakah email atau vendor code sudah ada
    const [existingEmail, existingCode] = await Promise.all([
      prisma.vendor.findUnique({ where: { email: body.email } }),
      prisma.vendor.findUnique({ where: { vendorCode: body.vendorCode } })
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered to another vendor' },
        { status: 400 }
      );
    }

    if (existingCode) {
      return NextResponse.json(
        { error: 'Vendor code already exists' },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.create({
      data: {
        vendorCode: body.vendorCode,
        vendorName: body.vendorName,
        email: body.email,
        phone: body.phone,
        address: body.address,
      }
    });

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'VENDOR',
        entityId: vendor.vendorCode,
        action: 'CREATE',
        details: {
          vendorCode: vendor.vendorCode,
          vendorName: vendor.vendorName,
          email: vendor.email,
          phone: vendor.phone,
          address: vendor.address
        }
      }
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const vendors = await VendorService.getAll();
    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
} 