import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 0

export async function GET() {
  try {
    const [projects, vendors, budgetYears] = await Promise.all([
      prisma.project.findMany({
        where: {
          status: "Not Allocated"
        },
        select: {
          id: true,
          title: true,
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
          title: 'asc'
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
      prisma.budgetYear.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          year: true
        },
        orderBy: {
          year: 'desc'
        }
      })
    ]);

    return NextResponse.json({ 
      projects, 
      vendors,
      budgetYears,
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