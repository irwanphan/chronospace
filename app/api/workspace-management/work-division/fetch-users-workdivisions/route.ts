import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [users, workDivisions] = await Promise.all([
      prisma.user.findMany(),
      prisma.workDivision.findMany({
        select: {
          id: true,
          name: true,
        }
      }),
    ]);

    return NextResponse.json({ users, workDivisions });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}