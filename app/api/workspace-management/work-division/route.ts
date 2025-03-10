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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Cek apakah division code sudah ada
    const existingDivision = await prisma.workDivision.findUnique({
      where: { divisionCode: body.divisionCode }
    });

    if (existingDivision) {
      return NextResponse.json(
        { error: 'Division code already exists' },
        { status: 400 }
      );
    }

    const division = await prisma.workDivision.create({
      data: {
        divisionCode: body.divisionCode,
        divisionName: body.divisionName,
        description: body.description,
        divisionHead: body.divisionHead,
        upperDivision: body.upperDivision,
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