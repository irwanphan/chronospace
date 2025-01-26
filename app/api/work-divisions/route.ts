import { NextResponse } from 'next/server';
import { WorkDivisionService } from '@/services/workDivision.service';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const division = await WorkDivisionService.create(data);
    return NextResponse.json(division, { status: 201 });
  } catch (error) {
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
    return NextResponse.json(
      { error: 'Failed to fetch work divisions' },
      { status: 500 }
    );
  }
} 