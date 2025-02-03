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
    const data = await request.json();

    // Cek apakah project sudah memiliki budget
    const existingProject = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { budget: true }
    });

    if (existingProject?.budget) {
      return NextResponse.json(
        { error: 'This project already has a budget allocated' },
        { status: 400 }
      );
    }

    // Mulai transaksi
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat budget baru
      const budget = await tx.budget.create({
        data: {
          projectId: data.projectId,
          title: data.title,
          year: parseInt(data.year),
          division: data.division,
          totalBudget: parseFloat(data.totalBudget.replace(/[,.]/g, '')),
          startDate: new Date(data.startDate),
          finishDate: new Date(data.finishDate),
          description: data.description,
          status: 'OPEN',
          project: {
            connect: {
              id: data.projectId
            }
          }
        },
      });

      // 2. Update status project menjadi ALLOCATED
      await tx.project.update({
        where: { id: data.projectId },
        data: {
          status: 'ALLOCATED'
        }
      });

      return budget;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
} 