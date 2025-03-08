import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch all budgets
export async function GET() {
  try {
    const [budgets, divisions] = await Promise.all([
      prisma.budget.findMany({
        include: {
          project: true,
          items: true
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
    const body = await request.json();
    console.log('Received request body:', body);

    const result = await prisma.$transaction(async (tx) => {
      const budget = await tx.budget.create({
        data: {
          projectId: body.projectId,
          title: body.title,
          description: body.description,
          year: body.year,
          workDivisionId: body.workDivisionId,
          totalBudget: body.totalBudget,
          startDate: new Date(body.startDate),
          finishDate: new Date(body.finishDate),
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