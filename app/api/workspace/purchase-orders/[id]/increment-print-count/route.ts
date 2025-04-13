import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Increment print count and create history
    const updatedPO = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.update({
        where: { id: params.id },
        data: {
          printCount: {
            increment: 1
          }
        }
      });

      await tx.purchaseOrderHistory.create({
        data: {
          purchaseOrderId: params.id,
          action: 'Printed',
          actorId: session.user.id,
          comment: `Document printed/downloaded (Print count: ${po.printCount})`
        }
      });

      return po;
    });

    return NextResponse.json({ purchaseOrder: updatedPO });
  } catch (error) {
    console.error('Error incrementing print count:', error);
    return NextResponse.json(
      { error: 'Failed to increment print count' },
      { status: 500 }
    );
  }
} 