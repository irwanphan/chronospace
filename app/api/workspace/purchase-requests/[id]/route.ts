import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getViewers, getCurrentApprover, ApprovalStep } from '@/app/api/workspace/route';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
      ? purchaseRequest.approvalSteps.filter(step => step.status === 'Updated').sort((a, b) => a.stepOrder - b.stepOrder)[0]
      : purchaseRequest?.approvalSteps.filter(step => step.status === 'Pending').sort((a, b) => a.stepOrder - b.stepOrder)[0];

    const fixedPurchaseRequest = {
      ...purchaseRequest,
      viewers: getViewers(purchaseRequest?.approvalSteps as unknown as ApprovalStep[]),
      approvers: getCurrentApprover(purchaseRequest?.approvalSteps as unknown as ApprovalStep[]),
      currentStep: currentStep
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
    // const { title, description, approvalSteps } = body;

    // Delete existing approval steps
    await prisma.purchaseRequestApproval.deleteMany({
      where: { purchaseRequestId: params.id }
    });

    // Update purchase request with new data
    const updatedRequest = await prisma.purchaseRequest.update({
      where: {
        id: params.id
      },
      data: {
        title: body.title,
        description: body.description,
        approvalSteps: {
          deleteMany: {},
          createMany: {
            data: body.steps.map((step: ApprovalStepUpdate, index: number) => ({
              roleId: step.roleId,
              specificUserId: step.specificUserId,
              stepOrder: index + 1,
              status: "Pending",
              budgetLimit: step.budgetLimit,
              duration: step.duration,
              overtimeAction: step.overtimeAction
            }))
          }
        }
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}