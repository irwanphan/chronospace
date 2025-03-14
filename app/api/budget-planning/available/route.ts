import { prisma } from '@/lib/prisma';
import { BudgetItem } from '@/types/budget';
import { Budget } from '@/types/budget';
import { NextResponse } from 'next/server';

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

    const availableBudgets = budgets.map((budget: Budget) => {
      // Filter items yang belum memiliki PR
      const availableItems = budget.items.filter((item: BudgetItem) => 
        item.purchaseRequestItems.length === 0
      );

      return {
        id: budget.id,
        title: budget.title,
        projectId: budget.projectId,
        project: budget.project,
        items: availableItems // Hanya tampilkan items yang available
      };
    }).filter((budget: Budget) => budget.items.length > 0); // Hanya budget yang masih punya items

    return NextResponse.json(availableBudgets);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available budgets' },
      { status: 500 }
    );
  }
}