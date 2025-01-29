import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch all budgets
export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        project: true
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
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received budget data:', body); // Debug log

    // Pastikan projectId ada
    if (!body.projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Ambil division dari project
    const project = await prisma.project.findUnique({
      where: { id: body.projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        year: parseInt(body.year),
        division: project.division,
        totalBudget: parseFloat(body.totalBudget.toString().replace(/[,.]/g, '')),
        startDate: new Date(body.startDate),
        finishDate: new Date(body.finishDate),
        status: 'In Progress',
        purchaseRequestStatus: 'Not Submitted',
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Detailed error:', error); // Tambahkan log detail error
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create budget' },
      { status: 500 }
    );
  }
} 