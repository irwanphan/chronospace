import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0

export async function GET() {
  try {
    const [budgets, divisions] = await Promise.all([
      prisma.budget.findMany({
        include: {
          project: true,
          items: true,
          workDivision: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.workDivision.findMany()
    ]);

    return NextResponse.json({ budgets, divisions });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

// POST: Create new budget
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    console.log('Received request body:', body);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const budget = await tx.budget.create({
        data: {
          code: body.code,
          projectId: body.projectId,
          workDivisionId: body.workDivisionId,
          title: body.title,
          year: body.year,
          startDate: new Date(body.startDate),
          finishDate: new Date(body.finishDate),
          description: body.description,
          totalBudget: body.totalBudget,
          status: body.status,
          items: {
            create: body.items.map((item: { description: string; qty: number; unit: string; unitPrice: number; vendor: string }) => ({
              description: item.description,
              qty: Number(item.qty),
              unit: item.unit,
              unitPrice: Number(item.unitPrice),
              vendorId: item.vendor
            }))
          }
        },
        include: {
          items: true,
          project: true,
          workDivision: true,
        }
      });

      // Update project status to Allocated
      await tx.project.update({
        where: { id: body.projectId },
        data: { status: 'Allocated' }
      });

      await tx.activityHistory.create({
        data: {
          userId: session.user.id,
          entityType: 'BUDGET',
          entityId: budget?.id,
          action: 'CREATE',
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

      return budget;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to create budget: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 