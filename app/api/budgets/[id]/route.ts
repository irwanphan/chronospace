import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch specific budget
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const budget = await prisma.budget.findUnique({
      where: {
        id: params.id
      },
      include: {
        project: true
      }
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(budget);
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
    const body = await request.json();

    const budget = await prisma.budget.update({
      where: {
        id: params.id
      },
      data: {
        title: body.title,
        year: parseInt(body.year),
        division: body.division,
        totalBudget: body.totalBudget,
        startDate: new Date(body.startDate),
        finishDate: new Date(body.finishDate),
        status: body.status,
        purchaseRequestStatus: body.purchaseRequestStatus,
        description: body.description,
      },
    });

    return NextResponse.json(budget);
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
      where: {
        id: params.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
} 