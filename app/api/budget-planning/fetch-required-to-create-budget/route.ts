import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [projects, vendors, workDivisions] = await Promise.all([
      prisma.project.findMany({
        where: {
          status: "Not Allocated"
        },
        select: {
          id: true,
          projectTitle: true,
          workDivisionId: true,
          status: true,
          description: true,
          startDate: true,
          finishDate: true,
          workDivision: {
            select: {
              id: true,
              divisionName: true
            }
          }
        },
        orderBy: {
          projectTitle: 'asc'
        }
      }),
      prisma.vendor.findMany({
        select: {
          id: true,
          vendorName: true,
          vendorCode: true
        },
        orderBy: {
          vendorName: 'asc'
        }
      }),
      prisma.workDivision.findMany({
        select: {
          id: true,
          divisionName: true,
        },
        orderBy: {
          divisionName: 'asc'
        }
      }),
    ]);

    return NextResponse.json({ 
      projects, 
      vendors, 
      workDivisions,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch required data' },
      { status: 500 }
    );
  }
}