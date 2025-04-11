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

    // Fetch the PR with all its related data
    const pr = await prisma.purchaseRequest.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            budgetItem: true,
            vendor: true
          }
        },
        budget: {
          include: {
            project: true,
            workDivision: true
          }
        },
        user: true,
        histories: true
      }
    });

    if (!pr) {
      return NextResponse.json(
        { error: 'Purchase request not found' },
        { status: 404 }
      );
    }

    // Check if a PO already exists for this PR
    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { purchaseRequestId: pr.id }
    });

    if (existingPO) {
      return NextResponse.json(
        { error: 'A purchase order already exists for this purchase request' },
        { status: 400 }
      );
    }

    // Generate PO Code
    const today = new Date();
    const poCount = await prisma.purchaseOrder.count({
      where: {
        createdAt: {
          gte: new Date(today.getFullYear(), 0, 1), // Start of current year
          lt: new Date(today.getFullYear() + 1, 0, 1) // Start of next year
        }
      }
    }) + 1;
    
    const poCode = `PO/${pr.budget.workDivision.code}/${today.getFullYear()}/${String(poCount).padStart(4, '0')}`;

    // Create PO with PR data
    const po = await prisma.purchaseOrder.create({
      data: {
        code: poCode,
        title: pr.title,
        description: pr.description,
        status: 'Draft',
        userId: session.user.id,
        budgetId: pr.budgetId,
        purchaseRequestId: pr.id,
        items: {
          create: pr.items.map(item => ({
            description: item.description,
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            vendorId: item.vendorId,
            budgetItemId: item.budgetItemId
          }))
        },
        histories: {
          create: {
            action: 'Created',
            actorId: session.user.id,
            comment: `Created from Purchase Request ${pr.code}`
          }
        }
      },
      include: {
        items: true,
        histories: true
      }
    });

    return NextResponse.json({ purchaseOrder: po });
  } catch (error) {
    console.error('Error converting PR to PO:', error);
    return NextResponse.json(
      { error: 'Failed to convert PR to PO: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 