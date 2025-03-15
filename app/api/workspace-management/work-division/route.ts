import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    return NextResponse.json(division);
  } catch (error) {
    console.error('Failed to create work division:', error);
    return NextResponse.json(
      { error: 'Failed to create work division' },
      { status: 500 }
    );
  }
}