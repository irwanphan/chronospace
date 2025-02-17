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
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  vendor: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
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
        budgetId,
        title,
        description,
        status: 'Submitted',
        createdBy,
        items: {
          create: items.map((item: RequestItem) => ({
            description: item.description,
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            vendor: item.vendor
          }))
        },
        approvalSteps: {
          create: approvalSteps.map((step: ApprovalStep) => ({
            role: step.role,
            specificUser: step.specificUser,
            stepOrder: step.stepOrder,
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
    const purchaseRequests = await prisma.purchaseRequest.findMany({
      include: {
        items: true,
        budget: true,
        approvalSteps: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(purchaseRequests);
  } catch (error) {
    console.error('Error fetching purchase requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase requests' },
      { status: 500 }
    );
  }
}