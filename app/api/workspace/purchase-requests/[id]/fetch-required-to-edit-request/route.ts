import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getViewers, getCurrentApprover, ApprovalStep } from '@/app/api/workspace/route';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
            specificUserDetails: {
              select: {
                name: true
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
              order: 'asc'
            }
          }
        },
        where: {
          documentType: 'Purchase Request'
        }
      })
    ]);

    return NextResponse.json({
      purchaseRequest: fixedPurchaseRequest,
      roles,
      users,
      schemas
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase request' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, description } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const updated = await prisma.purchaseRequest.update({
      where: { id: params.id },
      data: {
        title,
        status: 'Updated',
        description,
        approvalSteps: {
          updateMany: {
            where: { status: 'Revision' },
            data: { status: 'Updated' }
          }
        },
        histories: {
          create: {
            action: 'Updated',
            actor: {
              connect: { email: session.user.email }
            },
            comment: 'Request details updated'
          }
        }
      },
      include: {
        histories: {
          include: {
            actor: true
          }
        },
        approvalSteps: true
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}