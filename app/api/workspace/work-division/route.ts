import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [divisions, users] = await Promise.all([
      prisma.workDivision.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true
        }
      })
    ]);

    return NextResponse.json({
      divisions,
      users
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work division data' },
      { status: 500 }
    );
  }
} 