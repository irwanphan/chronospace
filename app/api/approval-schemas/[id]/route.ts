import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schema = await prisma.approvalSchema.findUnique({
      where: {
        id: params.id
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!schema) {
      return NextResponse.json(
        { error: 'Approval schema not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error fetching approval schema:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval schema' },
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

    const schema = await prisma.approvalSchema.update({
      where: {
        id: params.id
      },
      data: {
        name: body.name,
        documentType: body.documentType,
        description: body.description,
        divisions: body.divisions,
        roles: body.roles,
        steps: {
          deleteMany: {},
          create: body.steps.map((step: any, index: number) => ({
            roleId: step.roleId,
            specificUserId: step.specificUserId,
            budgetLimit: step.budgetLimit,
            duration: step.duration,
            overtimeAction: step.overtimeAction,
            order: index
          }))
        }
      }
    });

    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error updating approval schema:', error);
    return NextResponse.json(
      { error: 'Failed to update approval schema' },
      { status: 500 }
    );
  }
} 