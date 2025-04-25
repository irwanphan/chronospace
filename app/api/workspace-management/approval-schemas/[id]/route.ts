import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0

interface RequestStep {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
  stepOrder: number;
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
          approvalSteps: {
            include: {
              role: true
            },
            orderBy: {
              stepOrder: 'asc'
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

    // console.log(schema);

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.documentType || !body.approvalSteps) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure approvalSteps is an array and not empty
    if (!Array.isArray(body.approvalSteps) || body.approvalSteps.length === 0) {
      return NextResponse.json(
        { error: 'Approval steps must be a non-empty array' },
        { status: 400 }
      );
    }

    const updatedSchema = await prisma.approvalSchema.update({
      where: {
        id: params.id
      },
      data: {
        name: body.name,
        documentType: body.documentType,
        description: body.description,
        workDivisionIds: body.workDivisionIds,
        roleIds: body.roleIds,
        approvalSteps: {
          deleteMany: {},  // Delete existing steps
          createMany: {    // Create new steps
            data: body.approvalSteps.map((step: RequestStep) => ({
              roleId: step.roleId,
              specificUserId: step.specificUserId,
              duration: step.duration,
              overtimeAction: step.overtimeAction,
              budgetLimit: step.budgetLimit,
              stepOrder: step.stepOrder
            }))
          }
        }
      }
    });

    await prisma.activityHistory.create({
      data: {
        userId: session.user.id,
        entityType: 'APPROVAL_SCHEMA',
        entityId: updatedSchema.name,
        action: 'UPDATE',
        details: {
          name: updatedSchema.name,
          documentType: updatedSchema.documentType,
          description: updatedSchema.description
        }
      }
    });
    
    return NextResponse.json(updatedSchema);
  } catch (error) {
    console.error('Error updating schema:', error);
    return NextResponse.json(
      { error: 'Failed to update schema' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get schema details for activity history
    const schema = await prisma.approvalSchema.findUnique({
      where: { id: params.id },
      include: {
        approvalSteps: true
      }
    });

    if (!schema) {
      return NextResponse.json(
        { error: 'Approval schema not found' },
        { status: 404 }
      );
    }

    // Delete in transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Delete approval steps first
      await tx.approvalStep.deleteMany({
        where: { schemaId: params.id }
      });

      // 2. Delete the schema
      await tx.approvalSchema.delete({
        where: { id: params.id }
      });

      // 3. Record activity history
      await tx.activityHistory.create({
        data: {
          userId: session.user.id,
          entityType: 'APPROVAL_SCHEMA',
          entityId: schema.name,
          action: 'DELETE',
          details: {
            name: schema.name,
            documentType: schema.documentType,
            description: schema.description,
          }
        }
      });
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