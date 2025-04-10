import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        project: true,
        items: {
          include: {
            purchaseRequest: true,
            vendor: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const availableBudgets = budgets.map(budget => {
      // Filter items yang belum memiliki PR atau PR-nya sudah declined
      const availableItems = budget.items.filter(item => 
        item.purchaseRequestId === null || 
        item.purchaseRequest?.status === 'Declined'
      );

      return {
        id: budget.id,
        title: budget.title,
        description: budget.description,
        projectId: budget.projectId,
        project: budget.project,
        items: availableItems // Hanya tampilkan items yang available
      };
    }).filter(budget => budget.items.length > 0); // Hanya budget yang masih punya items

    const [roles, users, schemas] = await Promise.all([
      prisma.role.findMany(),
      prisma.user.findMany({
        include: {
          role: true
        }
      }),
      prisma.approvalSchema.findMany({
        include: {
          approvalSteps: {
            include: {
              role: true
            },
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

    return NextResponse.json({
      roles,
      users,
      schemas: schemas.map(schema => ({
        ...schema,
        // steps: schema.approvalSteps  // Map approvalSteps ke steps
      })),
      availableBudgets
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}