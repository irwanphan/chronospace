import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ApprovalStep {
  roleId: string;
  specificUserId?: string;
  stepOrder: number;
  budgetLimit?: number;
  duration: number;
  overtimeAction: string;
}

interface RequestItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  vendorId: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const result = await prisma.purchaseRequest.create({
      data: {
        code: body.code,
        budgetId: body.budgetId,
        title: body.title,
        description: body.description,
        status: "Submitted",
        createdBy: body.createdBy,
        items: {
          create: body.items.map((item: RequestItem) => ({
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
        items: true,
        approvalSteps: true
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating purchase request:', error);
    return NextResponse.json(
      { error: 'Failed to create request: ' + (error as Error).message },
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