import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [roles, users, workDivisions] = await Promise.all([
      prisma.role.findMany({
        select: {
          id: true,
          roleName: true,
          approvalLimit: true,
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
        },
      }),
      prisma.workDivision.findMany({
        select: {
          id: true,
          divisionName: true,
        }
      }),
    ]);

    return NextResponse.json({ roles, users, workDivisions });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}