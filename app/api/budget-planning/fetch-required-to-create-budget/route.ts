import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [projects, vendors] = await Promise.all([
      prisma.project.findMany({
        where: {
          status: "Not Allocated"
        },
        select: {
          id: true,
          projectTitle: true,
          status: true,
          description: true,
          year: true,
          startDate: true,
          finishDate: true,
          workDivision: {
            select: {
              id: true,
              name: true
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
      })
    ]);

    return NextResponse.json({ 
      projects, 
      vendors, 
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