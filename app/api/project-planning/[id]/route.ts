import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { 
        id: params.id 
      },
      include: {
        workDivision: true,
      },
    });

    const workDivisions = await prisma.workDivision.findMany({
      select: {
        id: true,
        name: true,
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project, workDivisions });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
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

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        projectCode: body.projectCode,
        projectTitle: body.projectTitle,
        year: body.year,
        workDivisionId: body.workDivisionId,
        status: body.status,
        startDate: new Date(body.startDate).toISOString(),
        finishDate: new Date(body.finishDate).toISOString(),
        description: body.description,
        budget: body.budget
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if project has allocated budget
    const project = await prisma.project.findUnique({
      where: { id: params.id }
    });

    if (project?.status === 'Budget Allocated' || project?.status === 'Active') {
      return NextResponse.json(
        { error: 'Cannot delete project that has allocated budget or is active' },
        { status: 400 }
      );
    }

    // Check if project has budget plans
    const budgetPlans = await prisma.budget.findMany({
      where: { projectId: params.id }
    });

    if (budgetPlans.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete project that has budget allocated' },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 