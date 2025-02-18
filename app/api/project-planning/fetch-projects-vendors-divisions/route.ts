import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [projects, vendors, workDivisions] = await Promise.all([
      prisma.project.findMany(),
      prisma.vendor.findMany({
        select: {
          id: true,
          vendorName: true,
        }
      }),
      prisma.workDivision.findMany({
        select: {
          id: true,
          divisionName: true,
        }
      }),
    ]);

    return NextResponse.json({ projects, vendors, workDivisions });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}