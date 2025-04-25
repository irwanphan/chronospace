import { prisma } from '@/lib/prisma';
import { BudgetedItem } from '@/types/budget';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        items: {
          include: {
            vendor: true
          }
        },
        workDivision: true
      },
    });

    const vendors = await prisma.vendor.findMany();

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Log untuk debugging
    // console.log('Raw Budget Data:', budget);

    return NextResponse.json({
      ...budget,
      vendors,
      startDate: budget.startDate?.toISOString(),
      finishDate: budget.finishDate?.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

// PUT: Update budget
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('Received data:', body);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Delete purchase request items yang terkait dengan budgeted items
      await tx.purchaseRequestItem.deleteMany({
        where: {
          budgetItem: {
            budgetId: params.id
          }
        }
      });

      // 2. Delete existing budget items
      await tx.budgetedItem.deleteMany({
        where: {
          budgetId: params.id
        }
      });

      // 3. Update budget and create new items
      const updatedBudget = await tx.budget.update({
        where: {
          id: params.id
        },
        data: {
          title: body.title,
          year: parseInt(body.year),
          workDivisionId: body.workDivisionId,
          totalBudget: parseFloat(body.totalBudget),
          startDate: new Date(body.startDate),
          finishDate: new Date(body.finishDate),
          description: body.description,
          items: {
            createMany: {
              data: body.items.map((item: BudgetedItem) => ({
                description: item.description,
                qty: Number(item.qty),
                unit: item.unit,
                unitPrice: Number(item.unitPrice),
                vendorId: item.vendorId,
              }))
            }
          }
        },
        include: {
          items: true,
          project: true,
          workDivision: true,
        }
      });

      await tx.activityHistory.create({
        data: {
          userId: session.user.id,
          entityType: 'BUDGET',
          entityId: updatedBudget?.code || '',
          action: 'UPDATE',
          details: {
            id: updatedBudget?.id,
            title: updatedBudget?.title,
            year: updatedBudget?.year,
            workDivisionId: updatedBudget?.workDivisionId,
            totalBudget: updatedBudget?.totalBudget,
            startDate: updatedBudget?.startDate?.toISOString(),
            finishDate: updatedBudget?.finishDate?.toISOString()
          }
        }
      });

      return updatedBudget;
    });

    console.log('Updated result:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in PUT route:', error);
    return NextResponse.json(
      { error: 'Failed to update budget: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete budget
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if budget has any purchase requests
    const purchaseRequests = await prisma.purchaseRequest.findMany({
      where: { budgetId: params.id },
      select: { code: true }
    });

    if (purchaseRequests.length > 0) {
      const prCodes = purchaseRequests.map((pr: { code: string }) => pr.code).join(', ');
      return NextResponse.json(
        { 
          error: `Cannot delete budget because it is being used in purchase request(s): ${prCodes}. Please delete the purchase requests first if possible. Contact your administrator for further assistance.` 
        },
        { status: 400 }
      );
    }

    // Hapus dalam transaction untuk memastikan konsistensi
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const budget = await tx.budget.findUnique({
        where: { id: params.id },
        include: {
          items: true
        }
      });

      // 1. Hapus purchase request items yang terkait dengan budgeted items
      await tx.purchaseRequestItem.deleteMany({
        where: {
          budgetItem: {
            budgetId: params.id
          }
        }
      });

      // 2. Hapus budgeted items
      await tx.budgetedItem.deleteMany({
        where: { budgetId: params.id }
      });

      // 3. Hapus budget
      await tx.budget.delete({
        where: { id: params.id }
      });

      // 4. Catat pada log
      await tx.activityHistory.create({
        data: {
          userId: session.user.id,
          entityType: 'BUDGET',
          entityId: budget?.code || '',
          action: 'DELETE',
          details: {
            id: budget?.id,
            title: budget?.title,
            year: budget?.year,
            workDivisionId: budget?.workDivisionId,
            totalBudget: budget?.totalBudget,
            startDate: budget?.startDate?.toISOString(),
            finishDate: budget?.finishDate?.toISOString()
          }
        }
      });
    });
    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
} 