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
    const { startYear, endYear, action } = body;

    // Validate input
    if (typeof startYear !== 'number' || typeof endYear !== 'number') {
      return NextResponse.json(
        { error: 'Start year and end year are required and must be numbers' },
        { status: 400 }
      );
    }

    if (startYear > endYear) {
      return NextResponse.json(
        { error: 'Start year must be less than or equal to end year' },
        { status: 400 }
      );
    }

    // Get all budget years in the range
    const budgetYearsInRange = await prisma.budgetYear.findMany({
      where: {
        year: {
          gte: startYear,
          lte: endYear,
        },
      },
    });

    // Get all existing budget years
    const allBudgetYears = await prisma.budgetYear.findMany({
      select: { year: true },
    });
    const existingYears = new Set(allBudgetYears.map(by => by.year));

    // Determine action: 'activate' or 'deactivate'
    const isActivating = action !== 'deactivate';

    // Create missing years if activating
    if (isActivating) {
      const yearsToCreate: number[] = [];
      for (let year = startYear; year <= endYear; year++) {
        if (!existingYears.has(year)) {
          yearsToCreate.push(year);
        }
      }

      if (yearsToCreate.length > 0) {
        await prisma.budgetYear.createMany({
          data: yearsToCreate.map(year => ({
            year,
            isActive: true,
          })),
        });
      }
    }

    // Update all years in range - activate them
    const updateResult = await prisma.budgetYear.updateMany({
      where: {
        year: {
          gte: startYear,
          lte: endYear,
        },
      },
      data: {
        isActive: isActivating,
      },
    });

    // Deactivate all years outside the range
    if (isActivating) {
      await prisma.budgetYear.updateMany({
        where: {
          OR: [
            { year: { lt: startYear } },
            { year: { gt: endYear } },
          ],
        },
        data: {
          isActive: false,
        },
      });
    }

    // Get updated years for activity log
    const updatedYearsInRange = await prisma.budgetYear.findMany({
      where: {
        year: {
          gte: startYear,
          lte: endYear,
        },
      },
    });

    // Get deactivated years outside range for logging
    const deactivatedYears = isActivating 
      ? await prisma.budgetYear.findMany({
          where: {
            OR: [
              { year: { lt: startYear } },
              { year: { gt: endYear } },
            ],
            isActive: false,
          },
          select: { year: true },
        })
      : [];

    // Create activity history
    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'BUDGET_YEAR',
        entityId: 'bulk-update',
        action: isActivating ? 'BULK_ACTIVATE' : 'BULK_DEACTIVATE',
        details: {
          startYear,
          endYear,
          activatedCount: updateResult.count,
          deactivatedCount: deactivatedYears.length,
          activatedYears: updatedYearsInRange.map(by => by.year),
          deactivatedYears: deactivatedYears.map(by => by.year),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${isActivating ? 'activated' : 'deactivated'} years ${startYear}-${endYear}`,
      activatedCount: updateResult.count,
      deactivatedCount: deactivatedYears.length,
      years: updatedYearsInRange,
    });
  } catch (error) {
    console.error('Error updating budget year range:', error);
    return NextResponse.json(
      { error: 'Failed to update budget year range' },
      { status: 500 }
    );
  }
}
