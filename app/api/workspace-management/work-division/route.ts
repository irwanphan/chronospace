import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0

export async function GET() {
  try {
    const workDivisions = await prisma.workDivision.findMany({
      include: {
        head: true
      },
      orderBy: { createdAt: 'desc' }
    })


    return NextResponse.json({
      workDivisions
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work division data' },
      { status: 500 }
    );
  }
} 

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    // Cek apakah division code sudah ada
    const existingDivision = await prisma.workDivision.findUnique({
      where: { code: body.code }
    });

    if (existingDivision) {
      return NextResponse.json(
        { error: 'Division code already exists' },
        { status: 400 }
      );
    }

    const division = await prisma.workDivision.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        headId: body.headId,
        upperWorkDivisionId: body.upperWorkDivisionId,
      }
    });

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'WORK_DIVISION',
        entityId: division.code,
        action: 'CREATE',
        details: {
          id: division.id,
          code: division.code,
          name: division.name,
          description: division.description,
          headId: division.headId,
          upperWorkDivisionId: division.upperWorkDivisionId
        }
      }
    });

    return NextResponse.json(division);
  } catch (error) {
    console.error('Failed to create work division:', error);
    return NextResponse.json(
      { error: 'Failed to create work division' },
      { status: 500 }
    );
  }
}