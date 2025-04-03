import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const entityType = url.searchParams.get('entityType');
    const action = url.searchParams.get('action');

    // Build filter conditions
    const where: Prisma.ActivityHistoryWhereInput = {};
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;

    // Fetch activities with pagination
    const [activities, total] = await Promise.all([
      prisma.activityHistory.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activityHistory.count({ where }),
    ]);

    return NextResponse.json({
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 