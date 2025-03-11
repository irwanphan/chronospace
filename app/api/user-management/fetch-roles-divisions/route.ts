import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [roles, workDivisions] = await Promise.all([
      prisma.role.findMany({
        select: {
          id: true,
          roleName: true,
        },
      }),
      prisma.workDivision.findMany({
        select: {
          id: true,
          name: true,
        }
      }),
    ]);

    return NextResponse.json({ roles, workDivisions });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}