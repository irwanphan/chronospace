import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

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

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'VENDOR',
        entityId: vendor.vendorCode,
        action: 'UPDATE',
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if vendor is being used in any purchase request
    const purchaseRequestsWithVendor = await prisma.purchaseRequestItem.findMany({
      where: { vendorId: params.id }
    });

    if (purchaseRequestsWithVendor.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vendor that is used in purchase requests' },
        { status: 400 }
      );
    }

    // Check if vendor is being used in any budget
    const budgetItemsWithVendor = await prisma.budgetedItem.findMany({
      where: { vendorId: params.id }
    });

    if (budgetItemsWithVendor.length > 0) { 
      return NextResponse.json(
        { error: 'Cannot delete vendor that is used in budgets' },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.delete({
      where: { id: params.id },
    });

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'VENDOR',
        entityId: vendor.vendorCode,
        action: 'DELETE',
        details: {
          vendorCode: vendor.vendorCode,
          vendorName: vendor.vendorName,
          email: vendor.email,
          phone: vendor.phone,
          address: vendor.address
        }
      }
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