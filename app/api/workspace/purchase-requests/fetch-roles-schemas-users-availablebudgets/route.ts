import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        project: true,
        items: {
          include: {
            purchaseRequestItems: true
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
        projectId: budget.projectId,
        project: budget.project,
        items: availableItems // Hanya tampilkan items yang available
      };
    }).filter(budget => budget.items.length > 0); // Hanya budget yang masih punya items

    const [roles, schemas, users] = await Promise.all([
      prisma.role.findMany(),
      prisma.approvalSchema.findMany(),
      prisma.user.findMany()
    ]);
    return NextResponse.json({ roles, schemas, users, availableBudgets });
  } catch (error) {
    console.error('Error fetching roles, schemas, and users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles, schemas, and users' },
      { status: 500 }
    );
  }
}