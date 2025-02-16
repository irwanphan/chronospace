import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch all budgets
export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        project: true,
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

// POST: Create new budget
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received request body:', body); // Debug log

    // Validasi input
    if (!body.projectId) return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    if (!body.title) return NextResponse.json({ message: "Title is required" }, { status: 400 });
    if (!body.year) return NextResponse.json({ message: "Year is required" }, { status: 400 });
    if (!body.division) return NextResponse.json({ message: "Division is required" }, { status: 400 });
    if (!body.startDate) return NextResponse.json({ message: "Start date is required" }, { status: 400 });
    if (!body.finishDate) return NextResponse.json({ message: "Finish date is required" }, { status: 400 });
    if (!body.items || !body.items.length) return NextResponse.json({ message: "Items are required" }, { status: 400 });

    // Cek apakah project sudah memiliki budget
    const existingBudget = await prisma.budget.findUnique({
      where: { projectId: body.projectId }
    });

    if (existingBudget) {
      return NextResponse.json(
        { message: "This project already has a budget plan" },
        { status: 400 }
      );
    }

    // Create budget dengan transaction
    const budget = await prisma.$transaction(async (tx) => {
      const newBudget = await tx.budget.create({
        data: {
          projectId: body.projectId,
          title: body.title,
          description: body.description,
          year: body.year,
          division: body.division,
          totalBudget: body.totalBudget,
          startDate: new Date(body.startDate),
          finishDate: new Date(body.finishDate),
          status: "In Progress",
          items: {
            create: body.items
          }
        },
      });
      
      console.log('Created budget:', newBudget); // Debug log
      return newBudget;
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Server error:', error); // Debug log
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create budget' },
      { status: 500 }
    );
  }
} 