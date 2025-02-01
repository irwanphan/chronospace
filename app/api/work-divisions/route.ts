import { NextResponse } from 'next/server';
import { WorkDivisionService } from '@/services/workDivision.service';
import { prisma } from '@/lib/prisma';

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

export async function GET() {
  try {
    const divisions = await WorkDivisionService.getAll();
    return NextResponse.json(divisions);
  } catch (error) {
    console.error('Failed to fetch work divisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work divisions' },
      { status: 500 }
    );
  }
} 