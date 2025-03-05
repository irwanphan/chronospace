import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [divisions, division, users] = await Promise.all([
      prisma.workDivision.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.workDivision.findUnique({
        where: { id: params.id }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true
        }
      })
    ]);

    if (!division) {
      return NextResponse.json(
        { error: 'Work division not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      divisions,
      division,
      users
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work division' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Cek apakah division code sudah digunakan division lain
    const existingDivision = await prisma.workDivision.findFirst({
      where: {
        divisionCode: body.divisionCode,
        id: { not: params.id }
      }
    });

    if (existingDivision) {
      return NextResponse.json(
        { error: 'Division code already exists' },
        { status: 400 }
      );
    }

    const division = await prisma.workDivision.update({
      where: { id: params.id },
      data: {
        divisionCode: body.divisionCode,
        divisionName: body.divisionName,
        description: body.description,
        divisionHead: body.divisionHead,
        upperDivision: body.upperDivision,
      },
    });
    return NextResponse.json(division);
  } catch (error) {
    console.error('Error updating work division:', error);
    return NextResponse.json(
      { error: 'Failed to update work division' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if division is used in approval schemas
    const workDivision = await prisma.workDivision.findUnique({
      where: { id: params.id },
      select: { divisionCode: true }
    });

    const schemasWithDivision = await prisma.approvalSchema.findMany({
      where: {
        divisions: {
          contains: workDivision?.divisionCode
        }
      }
    });

    if (schemasWithDivision.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete division that is used in approval schemas' },
        { status: 400 }
      );
    }

    // Check if division is used in projects
    const projectsWithDivision = await prisma.project.findMany({
      where: { workDivisionId: params.id }
    });

    if (projectsWithDivision.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete division that is used in projects' },
        { status: 400 }
      );
    }

    // Check if division is used in budgets
    const budgetsWithDivision = await prisma.budget.findMany({
      where: { workDivisionId: params.id }
    });

    if (budgetsWithDivision.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete division that is used in budget plans' },
        { status: 400 }
      );
    }

    // Check if division is used by users
    const usersWithDivision = await prisma.user.findMany({
      where: { workDivision: params.id }
    });

    if (usersWithDivision.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete division that has assigned users' },
        { status: 400 }
      );
    }

    await prisma.workDivision.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Work division deleted successfully' });
  } catch (error) {
    console.error('Error deleting work division:', error);
    return NextResponse.json(
      { error: 'Failed to delete work division' },
      { status: 500 }
    );
  }
} 