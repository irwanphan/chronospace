import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0;

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { activeYears } = body;

    // Validate input
    if (!Array.isArray(activeYears)) {
      return NextResponse.json(
        { error: 'activeYears must be an array of numbers' },
        { status: 400 }
      );
    }

    // Get all existing budget years
    const allBudgetYears = await prisma.budgetYear.findMany();
    const existingYears = new Set(allBudgetYears.map(by => by.year));
    const activeYearsSet = new Set(activeYears.map((y: number) => Number(y)));

    // Create missing years that should be active
    const yearsToCreate: number[] = [];
    activeYearsSet.forEach(year => {
      if (!existingYears.has(year)) {
        yearsToCreate.push(year);
      }
    });

    if (yearsToCreate.length > 0) {
      await prisma.budgetYear.createMany({
        data: yearsToCreate.map(year => ({
          year,
          isActive: true,
        })),
      });
    }

    // Activate all years in activeYears array
    const activateResult = await prisma.budgetYear.updateMany({
      where: {
        year: {
          in: Array.from(activeYearsSet),
        },
      },
      data: {
        isActive: true,
      },
    });

    // Deactivate all years NOT in activeYears array
    const deactivateResult = await prisma.budgetYear.updateMany({
      where: {
        year: {
          notIn: Array.from(activeYearsSet),
        },
      },
      data: {
        isActive: false,
      },
    });

    // Get all updated years for activity log
    const allUpdatedYears = await prisma.budgetYear.findMany({
      orderBy: { year: 'asc' },
    });

    // Create activity history
    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'BUDGET_YEAR',
        entityId: 'bulk-update',
        action: 'BULK_UPDATE',
        details: {
          activeYears: Array.from(activeYearsSet).sort((a, b) => a - b),
          activatedCount: activateResult.count + yearsToCreate.length,
          deactivatedCount: deactivateResult.count,
          totalYears: allUpdatedYears.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${activeYearsSet.size} active year(s)`,
      activatedCount: activateResult.count + yearsToCreate.length,
      deactivatedCount: deactivateResult.count,
      activeYears: Array.from(activeYearsSet).sort((a, b) => a - b),
    });
  } catch (error) {
    console.error('Error updating budget years:', error);
    return NextResponse.json(
      { error: 'Failed to update budget years' },
      { status: 500 }
    );
  }
}
