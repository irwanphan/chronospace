import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch specific budget
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Log untuk debugging
    console.log('Raw Budget Data:', budget);

    return NextResponse.json({
      ...budget,
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
    const data = await request.json();

    // Ambil data budget lama untuk mengetahui project sebelumnya
    const existingBudget = await prisma.budget.findUnique({
      where: { id: params.id },
      include: { project: true }
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Jika project berubah, cek apakah project baru sudah memiliki budget
    if (data.projectId !== existingBudget.projectId) {
      const newProject = await prisma.project.findUnique({
        where: { id: data.projectId },
        include: { budget: true }
      });

      if (newProject?.budget) {
        return NextResponse.json(
          { error: 'The selected project already has a budget allocated' },
          { status: 400 }
        );
      }
    }

    // Mulai transaksi
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update budget
      const updatedBudget = await tx.budget.update({
        where: { id: params.id },
        data: {
          title: data.title,
          year: parseInt(data.year),
          division: data.division,
          totalBudget: typeof data.totalBudget === 'string' 
            ? parseFloat(data.totalBudget.replace(/[,.]/g, ''))
            : data.totalBudget,
          startDate: new Date(data.startDate),
          finishDate: new Date(data.finishDate),
          description: data.description,
          status: data.status,
          project: {
            connect: {
              id: data.projectId
            }
          }
        },
      });

      // 2. Jika project berubah, update status kedua project
      if (data.projectId !== existingBudget.projectId) {
        // Reset status project lama
        await tx.project.update({
          where: { id: existingBudget.projectId },
          data: { status: 'DRAFT' }
        });
      }

      // Selalu update status project baru
      await tx.project.update({
        where: { id: data.projectId },
        data: { status: 'ALLOCATED' }
      });

      return updatedBudget;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
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
    await prisma.budget.delete({
      where: { id: params.id },
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