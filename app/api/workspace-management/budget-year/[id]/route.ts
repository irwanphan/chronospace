import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const budgetYear = await prisma.budgetYear.findUnique({
      where: { id: params.id }
    });

    if (!budgetYear) {
      return NextResponse.json(
        { error: 'Budget year not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(budgetYear);
  } catch (error) {
    console.error('Error fetching budget year:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget year' },
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

    // Check if year already exists (excluding current)
    if (body.year) {
      const existingYear = await prisma.budgetYear.findFirst({
        where: {
          year: body.year,
          id: { not: params.id }
        }
      });

      if (existingYear) {
        return NextResponse.json(
          { error: 'Budget year already exists' },
          { status: 400 }
        );
      }
    }

    const budgetYear = await prisma.budgetYear.update({
      where: { id: params.id },
      data: {
        ...(body.year && { year: body.year }),
        ...(body.isActive !== undefined && { isActive: body.isActive })
      }
    });

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'BUDGET_YEAR',
        entityId: budgetYear.id,
        action: 'UPDATE',
        details: {
          year: budgetYear.year,
          isActive: budgetYear.isActive
        }
      }
    });

    return NextResponse.json(budgetYear);
  } catch (error) {
    console.error('Error updating budget year:', error);
    return NextResponse.json(
      { error: 'Failed to update budget year' },
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

    const body = await request.json();

    const budgetYear = await prisma.budgetYear.update({
      where: { id: params.id },
      data: {
        isActive: body.isActive
      }
    });

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'BUDGET_YEAR',
        entityId: budgetYear.id,
        action: 'UPDATE',
        details: {
          year: budgetYear.year,
          isActive: budgetYear.isActive,
          action: 'Toggle active status'
        }
      }
    });

    return NextResponse.json(budgetYear);
  } catch (error) {
    console.error('Error toggling budget year status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle budget year status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if budget year is being used in any budgets
    const budgetsWithYear = await prisma.budget.findFirst({
      where: {
        year: (await prisma.budgetYear.findUnique({
          where: { id: params.id }
        }))?.year
      }
    });

    if (budgetsWithYear) {
      return NextResponse.json(
        { error: 'Cannot delete budget year that is used in budgets' },
        { status: 400 }
      );
    }

    const budgetYear = await prisma.budgetYear.delete({
      where: { id: params.id }
    });

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'BUDGET_YEAR',
        entityId: budgetYear.id,
        action: 'DELETE',
        details: {
          year: budgetYear.year,
          isActive: budgetYear.isActive
        }
      }
    });

    return NextResponse.json({ message: 'Budget year deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget year:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget year' },
      { status: 500 }
    );
  }
}
