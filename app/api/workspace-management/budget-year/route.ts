import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0;

export async function GET() {
  try {
    const budgetYears = await prisma.budgetYear.findMany({
      orderBy: { year: 'desc' }
    });
    return NextResponse.json(budgetYears);
  } catch (error) {
    console.error('Error fetching budget years:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget years' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    
    // Validate year
    if (!body.year || typeof body.year !== 'number') {
      return NextResponse.json(
        { error: 'Year is required and must be a number' },
        { status: 400 }
      );
    }

    // Check if year already exists
    const existingYear = await prisma.budgetYear.findUnique({
      where: { year: body.year }
    });

    if (existingYear) {
      return NextResponse.json(
        { error: 'Budget year already exists' },
        { status: 400 }
      );
    }

    const budgetYear = await prisma.budgetYear.create({
      data: {
        year: body.year,
        isActive: body.isActive ?? true
      }
    });

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'BUDGET_YEAR',
        entityId: budgetYear.id,
        action: 'CREATE',
        details: {
          year: budgetYear.year,
          isActive: budgetYear.isActive
        }
      }
    });

    return NextResponse.json(budgetYear);
  } catch (error) {
    console.error('Error creating budget year:', error);
    return NextResponse.json(
      { error: 'Failed to create budget year' },
      { status: 500 }
    );
  }
}
