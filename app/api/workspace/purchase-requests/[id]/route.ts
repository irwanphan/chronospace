import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getViewers, getCurrentApprover } from '@/lib/helpers';
import { ApprovalStep } from '@/types/approval-schema';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { createRevisionSubmittedNotifications } from '@/lib/notifications';

export const revalidate = 0

interface ApprovalStepUpdate {
  roleId: string;
  specificUserId: string | null;
  stepOrder: number;
  status: string;
  budgetLimit: number | null;
  duration: number;
  overtimeAction: string;
  comment: string | null;
  approvedAt: Date | null;
  approvedBy: string | null;
}

interface PurchaseRequestApprovalStep {
  status: string;
  stepOrder: number;
}

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
                name: true
              }
            },
            role: {
              select: {
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
      ? purchaseRequest.approvalSteps.filter((step: PurchaseRequestApprovalStep) => step.status === 'Updated').sort((a: PurchaseRequestApprovalStep, b: PurchaseRequestApprovalStep) => a.stepOrder - b.stepOrder)[0]
      : purchaseRequest?.approvalSteps.filter((step: PurchaseRequestApprovalStep) => step.status === 'Pending').sort((a: PurchaseRequestApprovalStep, b: PurchaseRequestApprovalStep) => a.stepOrder - b.stepOrder)[0];

    const viewers = await getViewers(purchaseRequest?.approvalSteps as unknown as ApprovalStep[]);
    const approvers = await getCurrentApprover(purchaseRequest?.approvalSteps as unknown as ApprovalStep[]);

    // console.log('viewers', viewers);
    // console.log('approvers', approvers);

    const fixedPurchaseRequest = {
      ...purchaseRequest,
      currentStep: currentStep,
      viewers: viewers,
      actors: approvers
    };

    return NextResponse.json({
      purchaseRequest: fixedPurchaseRequest,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase request' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    const itemList = await prisma.budgetedItem.findMany({
      where: {
        AND: [
          { budgetId: body.budgetId },
          { id: { in: body.itemsIdReference } }
        ]
      }
    });
    
    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Free up all budgeted items associated with this PR
      await tx.budgetedItem.updateMany({
        where: {
          purchaseRequestId: params.id
        },
        data: {
          purchaseRequestId: null
        }
      });

      // Update the PR with new items and approval steps
      const updated = await tx.purchaseRequest.update({
        where: {
          id: params.id
        },
        data: {
          title: body.title,
          description: body.description,
          items: {
            deleteMany: {},
            create: itemList.map((item) => ({
              budgetItemId: item.id,
              description: item.description,
              qty: item.qty,
              unit: item.unit,
              unitPrice: item.unitPrice,
              vendorId: item.vendorId
            })),
          },
          approvalSteps: {
            deleteMany: {},
            create: body.steps.map((step: ApprovalStepUpdate, index: number) => ({
              roleId: step.roleId,
              specificUserId: step.specificUserId,
              stepOrder: index + 1,
              status: "Pending",
              budgetLimit: step.budgetLimit,
              duration: step.duration,
              overtimeAction: step.overtimeAction
            }))
          },
          status: 'Submitted'
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

      // Link new items to this PR
      await tx.budgetedItem.updateMany({
        where: {
          id: {
            in: body.itemsIdReference
          }
        },
        data: {
          purchaseRequestId: params.id
        }
      });

      return updated;
    });

    await prisma.purchaseRequestHistory.create({
      data: {
        purchaseRequestId: params.id,
        action: 'Revised',
        actorId: session.user.id,
        comment: 'Purchase request revised and resubmitted'
      }
    });

    if (session.user.name) {
      await createRevisionSubmittedNotifications(
        params.id,
        session.user.name
      );
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}