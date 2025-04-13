import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        user: true,
        budget: {
          include: {
            project: true
          }
        },
        purchaseRequest: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ purchaseOrders });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
} 