import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0

export async function GET() {
  try {
    // Ambil semua projectId yang sudah memiliki budget
    const budgetedProjectIds = await prisma.budget.findMany({
      select: {
        projectId: true
      }
    });

    // Ambil project yang belum memiliki budget
    const availableProjects = await prisma.project.findMany({
      where: {
        id: {
          notIn: budgetedProjectIds.map((b) => b.projectId)
        },
        status: {
          not: 'Allocated'
        }
      },
      select: {
        id: true,
        title: true,
        code: true,
        status: true,
        workDivisionId: true
      }
    });

    return NextResponse.json(availableProjects);
  } catch (error) {
    console.error('Error fetching available projects:', error);
    return NextResponse.json(
      { message: 'Failed to fetch available projects' },
      { status: 500 }
    );
  }
} 