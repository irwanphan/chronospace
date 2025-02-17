import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RequestStep {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'NOTIFY' | 'AUTO_REJECT';
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [schema, divisions, roles, user] = await Promise.all([
      prisma.approvalSchema.findUnique({
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
      }),
      prisma.workDivision.findMany(),
      prisma.role.findMany(),
      prisma.user.findMany()
    ]);

    if (!schema) {
      return NextResponse.json(
        { error: 'Approval schema not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ schema, divisions, roles, user });
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
    console.log('Request body:', body);

    const updateData = {
      name: body.name,
      documentType: body.documentType,
      description: body.description,
      divisions: typeof body.workDivisions === 'string' ? body.workDivisions : body.workDivisions[0],
      roles: typeof body.roles === 'string' ? body.roles : body.roles[0],
      steps: {
        deleteMany: {},
        create: body.steps.map((step: RequestStep, index: number) => ({
          role: step.roleId || '',
          specificUserId: step.specificUserId || null,
          limit: step.budgetLimit || null,
          duration: step.duration || 48,
          overtime: step.overtimeAction || 'NOTIFY',
          order: index
        }))
      }
    };

    const schema = await prisma.approvalSchema.update({
      where: { id: params.id },
      data: updateData,
      include: {
        steps: true
      }
    });

    return NextResponse.json(schema);
  } catch (error: Error | unknown) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: 'Failed to update approval schema', details: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.approvalSchema.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Approval schema deleted successfully' });
  } catch (error) {
    console.error('Error deleting approval schema:', error);
    return NextResponse.json(
      { error: 'Failed to delete approval schema' },
      { status: 500 }
    );
  }
} 