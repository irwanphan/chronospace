import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getViewers, getCurrentApprover } from '@/lib/helpers';
import { ApprovalStep } from '@/types/approval-schema';

export const revalidate = 0

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
            vendor: true,
            // budgetItem: true,
          }
        },
        budget: {
          include: {
            project: true,
            items: {
              include: {
                vendor: true
              }
            }
          }
        },
        approvalSteps: {
          include: {
            specificUser: {
              select: {
                id: true,
                name: true
              }
            },
            role: {
              select: {
                id: true,
                roleName: true
              }
            }
          }
        },
        user: {
          include: {
            userRoles: {
              include: {
                role: true
              }
            }
          }
        },
        histories: {
          include: {
            actor: true
          }
        }
      }
    });

    const currentStep = purchaseRequest?.status === 'Updated' 
      ? purchaseRequest.approvalSteps.filter(step => step.status === 'Updated').sort((a, b) => a.stepOrder - b.stepOrder)[0]
      : purchaseRequest?.approvalSteps.filter(step => step.status === 'Pending').sort((a, b) => a.stepOrder - b.stepOrder)[0];

    const fixedPurchaseRequest = {
      ...purchaseRequest,
      viewers: getViewers(purchaseRequest?.approvalSteps as unknown as ApprovalStep[]),
      approvers: getCurrentApprover(purchaseRequest?.approvalSteps as unknown as ApprovalStep[]),
      currentStep: currentStep
    };

    const [roles, users, schemas] = await Promise.all([
      prisma.role.findMany(),
      prisma.user.findMany(),
      prisma.approvalSchema.findMany({
        include: {
          approvalSteps: {
            orderBy: {
              stepOrder: 'asc'
            }
          }
        },
        where: {
          documentType: 'Purchase Request'
        }
      })
    ]);

    const budget = await prisma.budget.findUnique({
      where: {
        id: purchaseRequest?.budget.id
      },
      include: {
        project: true,
        items: {
          include: {
            purchaseRequestItems: true,
            vendor: true,
            purchaseRequest: true
          }
        }
      }
    });

    // Filter items yang:
    // 1. Belum ada di purchase request lain
    // 2. Atau sudah ada di purchase request ini
    const availableItems = budget?.items.filter(item => 
      item.purchaseRequestId === null || 
      item.purchaseRequest?.status === 'Declined'
    );

    // return {
    //   id: budget.id,
    //   title: budget.title,
    //   description: budget.description,
    //   projectId: budget.projectId,
    //   project: budget.project,
    //   items: availableItems // Hanya tampilkan items yang available
    // };

    return NextResponse.json({
      purchaseRequest: fixedPurchaseRequest,
      roles,
      users,
      schemas,
      availableItems: availableItems || []
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase request' },
      { status: 500 }
    );
  }
}