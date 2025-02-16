import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      budgetId,
      title,
      description,
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
        status: 'DRAFT',
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            vendor: item.vendor
          }))
        },
        approvalSteps: {
          create: approvalSteps.map((step: any) => ({
            role: step.role,
            specificUser: step.specificUser,
            stepOrder: step.stepOrder,
            status: 'PENDING',
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