import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        project: true,
        items: {
          include: {
            purchaseRequestItems: true,
            vendor: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const availableBudgets = budgets.map(budget => {
      // Filter items yang belum memiliki PR
      const availableItems = budget.items.filter(item => 
        item.purchaseRequestItems.length === 0
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