import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const schemas = await db.approvalSchema.findMany({
      include: {
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(schemas);
  } catch (error) {
    console.error('Failed to fetch approval schemas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval schemas' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { steps, ...schemaData } = data;

    const schema = await db.approvalSchema.create({
      data: {
        ...schemaData,
        steps: {
          create: steps.map((step: any, index: number) => ({
            ...step,
            stepNumber: index + 1,
          })),
        },
      },
      include: {
        steps: true,
      },
    });

    return NextResponse.json(schema, { status: 201 });
  } catch (error) {
    console.error('Failed to create approval schema:', error);
    return NextResponse.json(
      { error: 'Failed to create approval schema' },
      { status: 500 }
    );
  }
} 