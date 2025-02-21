import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: {
        id: params.id
      },
      include: {
        items: {
          include: {
            budgetItem: {
              include: {
                vendor: true
              }
            }
          }
        },
        budget: {
          include: {
            project: true
          }
        },
        approvalSteps: true,
        user: {
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        }
      }
    });

    const currentStep = purchaseRequest?.approvalSteps.filter(step => step.status === 'PENDING').sort((a, b) => a.stepOrder - b.stepOrder)[0];

    return NextResponse.json({
      purchaseRequest,
      currentStep
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase request' },
      { status: 500 }
    );
  }
}