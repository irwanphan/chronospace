import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const division = await prisma.workDivision.findUnique({
      where: { id: params.id },
    });

    if (!division) {
      return NextResponse.json(
        { error: 'Work division not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(division);
  } catch (error) {
    console.error('Error fetching work division:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work division' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Cek apakah division code sudah digunakan division lain
    const existingDivision = await prisma.workDivision.findFirst({
      where: {
        divisionCode: body.divisionCode,
        id: { not: params.id }
      }
    });

    if (existingDivision) {
      return NextResponse.json(
        { error: 'Division code already exists' },
        { status: 400 }
      );
    }

    const division = await prisma.workDivision.update({
      where: { id: params.id },
      data: {
        divisionCode: body.divisionCode,
        divisionName: body.divisionName,
        description: body.description,
        divisionHead: body.divisionHead,
      },
    });
    return NextResponse.json(division);
  } catch (error) {
    console.error('Error updating work division:', error);
    return NextResponse.json(
      { error: 'Failed to update work division' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.workDivision.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Work division deleted successfully' });
  } catch (error) {
    console.error('Error deleting work division:', error);
    return NextResponse.json(
      { error: 'Failed to delete work division' },
      { status: 500 }
    );
  }
} 