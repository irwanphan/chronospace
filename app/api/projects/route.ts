import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const project = await prisma.project.create({
      data: {
        projectId: body.projectId,
        projectCode: body.projectCode,
        projectTitle: body.projectTitle,
        description: body.description,
        division: body.division,
        year: parseInt(body.year),
        startDate: new Date(body.startDate),
        finishDate: new Date(body.finishDate),
        requestDate: new Date(body.requestDate),
        status: 'Not Allocated', // Default status
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 