import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workDivision = await prisma.workDivision.findUnique({
      where: { id: params.id },
      include: {
        head: true,
        upperWorkDivision: true,
        subDivisions: true
      }
    });

    if (!workDivision) {
      return NextResponse.json(
        { error: 'Work division not found' },
        { status: 404 }
      );
    }

    // Filter out user assigned as head of other work divisions but not the current work division
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          workDivisionHeadOf: {
            some: {
              id: { not: workDivision.id }
            }
          }
        }
      }
    });

    // Filter out work divisions that are not the current work division
    const workDivisions = await prisma.workDivision.findMany({
      where: {
        id: { not: workDivision.id }
      }
    });

    return NextResponse.json({
      workDivision,
      users,
      workDivisions
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    // Cek apakah division code sudah digunakan division lain
    const existingDivision = await prisma.workDivision.findFirst({
      where: {
        code: body.code,
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
        code: body.code,
        name: body.name,
        description: body.description,
        headId: body.headId,
        upperWorkDivisionId: body.upperWorkDivisionId,
      },
    });

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'WORK_DIVISION',
        entityId: division.code,
        action: 'UPDATE',
        details: {
          id: division.id,
          code: division.code,
          name: division.name,
          description: division.description,
          headId: division.headId,
          upperWorkDivisionId: division.upperWorkDivisionId
        }
      }
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if division is used in approval schemas
    const workDivision = await prisma.workDivision.findUnique({
      where: { id: params.id },
      select: { 
        code: true,
        name: true,
        description: true,
        headId: true,
        upperWorkDivisionId: true
      }
    });

    const schemasWithDivision = await prisma.approvalSchema.findMany({
      where: {
        workDivisions: {
          some: {
            code: workDivision?.code
          }
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
      where: { workDivisionId: params.id }
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

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'WORK_DIVISION',
        entityId: workDivision?.code || '',
        action: 'DELETE',
        details: {
          id: params.id,
          code: workDivision?.code,
          name: workDivision?.name,
          description: workDivision?.description,
          headId: workDivision?.headId,
          upperWorkDivisionId: workDivision?.upperWorkDivisionId
        }
      }
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