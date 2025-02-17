import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id }
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Cek apakah email atau vendor code sudah digunakan vendor lain
    const [existingEmail, existingCode] = await Promise.all([
      prisma.vendor.findFirst({
        where: {
          email: body.email,
          id: { not: params.id }  // Exclude current vendor
        }
      }),
      prisma.vendor.findFirst({
        where: {
          vendorCode: body.vendorCode,
          id: { not: params.id }  // Exclude current vendor
        }
      })
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

    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: {
        vendorCode: body.vendorCode,
        vendorName: body.vendorName,
        email: body.email,
        phone: body.phone,
        address: body.address,
      },
    });
    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.vendor.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    );
  }
} 