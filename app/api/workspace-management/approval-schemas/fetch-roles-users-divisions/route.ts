import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 0

export async function GET() {
  try {
    const [roles, users, workDivisions] = await Promise.all([
      prisma.role.findMany({
        select: {
          id: true,
          roleName: true,
          budgetLimit: true,
        },
        where: {
          roleCode: {
            not: 'ADMIN',
          },
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
        },
        where: {
          role: {
            roleCode: {
              not: 'ADMIN',
            },
          },
        },
      }),
      prisma.workDivision.findMany({
        select: {
          id: true,
          name: true,
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