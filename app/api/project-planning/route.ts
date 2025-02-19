import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [projects, workDivisions] = await Promise.all([
      prisma.project.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.workDivision.findMany()
    ]);

    return NextResponse.json({ projects, workDivisions });
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
    console.log('Received data:', body); // Debug log
    
    const project = await prisma.project.create({
      data: {
        projectId: body.projectId,
        projectCode: body.projectCode,
        projectTitle: body.projectTitle,
        description: body.description || '', // Handle null/undefined
        workDivisionId: body.workDivisionId,
        year: parseInt(body.year),
        startDate: new Date(body.startDate),
        finishDate: new Date(body.finishDate),
        requestDate: new Date(body.requestDate),
        status: 'Not Allocated', // Default status
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    // Log detailed error
    console.error('Detailed error:', error);
    
    // Return more specific error message
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project' },
      { status: 500 }
    );
  }
} 