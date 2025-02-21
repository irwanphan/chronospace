import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ApprovalStep {
  role: string;
  specificUser?: string;
  stepOrder: number;
  limit?: number;
  duration: number;
  overtime: string;
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
    const { 
      code,
      budgetId,
      title,
      description,
      createdBy,
      items = [],
      approvalSteps = []
    } = body;

    // Debug log
    console.log('Received request body:', body);

    // Validasi input
    if (!budgetId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create purchase request dengan items dan approval steps
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        code,
        budgetId,
        title,
        description,
        status: 'Submitted',
        createdBy,
        items: {
          create: items.map((item: RequestItem) => ({
            budgetItemId: item.id,
            description: item.description,
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            vendorId: item.vendorId
          }))
        },
        approvalSteps: {
          create: approvalSteps.map((step: ApprovalStep, index: number) => ({
            role: step.role,
            specificUser: step.specificUser,
            stepOrder: index + 1,
            status: 'Pending',
            limit: step.limit,
            duration: step.duration,
            overtime: step.overtime
          }))
        }
      },
      include: {
        items: true,
        approvalSteps: true
      }
    });

    // Update budget status
    await prisma.budget.update({
      where: { id: budgetId },
      data: {
        purchaseRequestStatus: 'SUBMITTED'
      }
    });

    return NextResponse.json(purchaseRequest);
  } catch (error) {
    console.error('Error creating purchase request:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase request', details: error instanceof Error ? error.message : 'Unknown error' },
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
                  divisionName: true,
                  divisionCode: true
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

    const purchaseRequests = purchaseRequestsRes.map(request => ({
      ...request,
      requestorName: users.find(user => user.id === request.createdBy)?.name || 'Unknown'
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