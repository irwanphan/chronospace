import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 0

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        workDivision: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      code, 
      title, 
      description, 
      workDivisionId, 
      year, 
      startDate, 
      finishDate, 
      userId 
    } = body;

    // Validasi data yang diterima
    if (!code || !title || !workDivisionId || !year || !startDate || !finishDate || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Gunakan transaction untuk memastikan data konsisten
    const result = await prisma.$transaction(async (tx) => {
      // Buat project baru
      const newProject = await tx.project.create({
        data: {
          code,
          title,
          description: description || '',
          workDivisionId,
          year: Number(year),
          startDate: new Date(startDate),
          finishDate: new Date(finishDate),
          status: 'Not Allocated',
          createdBy: userId,
        },
      });

      // Buat history project
      const projectHistory = await tx.projectHistory.create({
        data: {
          projectId: newProject.id,
          projectCode: newProject.code,
          action: 'CREATE',
          userId,
          changes: {
            code,
            title,
            description,
            workDivisionId,
            year,
            startDate,
            finishDate,
          },
          timestamp: new Date(),
        },
      });

      // Buat activity history
      const activityHistory = await tx.activityHistory.create({
        data: {
          userId,
          entityType: 'PROJECT',
          entityId: newProject.id,
          entityCode: newProject.code,
          action: 'CREATE',
          details: {
            code,
            title,
            description,
            workDivisionId,
            year,
            startDate,
            finishDate,
          },
          timestamp: new Date(),
        },
      });

      return { newProject, projectHistory, activityHistory };
    });

    return NextResponse.json({
      message: 'Project created successfully',
      project: result.newProject,
      history: result.projectHistory,
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project' },
      { status: 500 }
    );
  }
} 