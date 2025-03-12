import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getViewers, getCurrentApprover, ApprovalStep } from '@/app/api/workspace/route';

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
            budgetItem: true,
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
            vendor: true
          }
        }
      }
    });
    const availableItems = budget?.items.filter(item => 
      item.purchaseRequestItems.length === 0
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
      availableItems
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase request' },
      { status: 500 }
    );
  }
}