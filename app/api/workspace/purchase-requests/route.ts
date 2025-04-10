import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPurchaseRequestNotifications } from '@/lib/notifications';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { PurchaseRequest, PurchaseRequestApproval } from '@prisma/client';

export const revalidate = 0;

interface ApprovalStep {
  roleId: string;
  specificUserId?: string | null;
  duration: number;
  overtimeAction: string;
  budgetLimit?: number;
}

interface BudgetItem {
  id: string;
  budgetId: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  vendorId: string;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);

    // Validate required fields
    if (!body.budgetId) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    if (!body.code) {
      return NextResponse.json(
        { error: 'Purchase request code is required' },
        { status: 400 }
      );
    }

    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction<PurchaseRequest & { approvalSteps: PurchaseRequestApproval[] }>(async (tx) => {
      // Create purchase request
      const purchaseRequest = await tx.purchaseRequest.create({
        data: {
          code: body.code,
          budgetId: body.budgetId,
          title: body.title,
          description: body.description,
          status: 'Submitted',
          createdBy: session.user.id,
          items: {
            create: body.items.map((item: BudgetItem) => ({
              budgetItemId: item.id,
              description: item.description,
              qty: item.qty,
              unit: item.unit,
              unitPrice: item.unitPrice,
              vendorId: item.vendorId
            }))
          },
          approvalSteps: {
            create: body.steps.map((step: ApprovalStep, index: number) => ({
              roleId: step.roleId,
              specificUserId: step.specificUserId,
              stepOrder: index + 1,
              status: "Pending",
              budgetLimit: step.budgetLimit,
              duration: step.duration,
              overtimeAction: step.overtimeAction
            }))
          }
        },
        include: {
          items: {
            include: {
              budgetItem: true
            }
          },
          approvalSteps: true
        }
      });

      // Update budgeted items to link them to this PR
      await tx.budgetedItem.updateMany({
        where: {
          id: {
            in: body.items.map((item: BudgetItem) => item.id)
          }
        },
        data: {
          purchaseRequestId: purchaseRequest.id
        }
      });

      // Create history
      await tx.purchaseRequestHistory.create({
        data: {
          purchaseRequestId: purchaseRequest.id,
          action: 'Submitted',
          actorId: session.user.id,
          comment: 'Purchase request submitted'
        }
      });

      return purchaseRequest;
    });

    // Create notifications for approvers
    if (result.approvalSteps.length > 0) {
      await createPurchaseRequestNotifications(
        result.id,
        result.code,
        result.approvalSteps.map((step: PurchaseRequestApproval) => ({
          roleId: step.roleId,
          specificUserId: step.specificUserId
        }))
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [purchaseRequestsRes, users] = await Promise.all([
      prisma.purchaseRequest.findMany({
        include: {
          items: true,
          budget: {
            include: {
              workDivision: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          },
          approvalSteps: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true
        }
      })
    ]);

    const purchaseRequests = purchaseRequestsRes.map((request) => ({
      ...request,
      requestorName: users.find((user) => user.id === request.createdBy)?.name || 'Unknown'
    }));

    return NextResponse.json(purchaseRequests);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase requests' },
      { status: 500 }
    );
  }
}