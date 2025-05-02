import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const revalidate = 0

interface RequestStep {
  role: string;
  specificUserId?: string;
  limit?: number;
  duration: number;
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
  order: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    // console.log('Received data:', body);

    // Validasi data yang diterima
    if (!body.name || !body.workDivisions || !body.approvalSteps) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Pastikan approvalSteps ada dan berbentuk array
    if (!body.approvalSteps || !Array.isArray(body.approvalSteps)) {
      return NextResponse.json({ error: 'Invalid approval steps' }, { status: 400 });
    }

    // Format data sebelum create
    const formattedData = {
      name: body.name,
      documentType: body.documentType,
      description: body.description || '',
      workDivisionIds: body.workDivisions,
      roleIds: body.roles,
      approvalSteps: {
        create: body.approvalSteps.map((step: RequestStep, index: number) => ({
          roleId: step.role,
          specificUserId: step.specificUserId || null,
          duration: step.duration,
          overtimeAction: step.overtimeAction || 'Notify and Wait',
          budgetLimit: step.limit || null,
          stepOrder: step.order || index + 1
        }))
      }
    };

    // console.log('Formatted data:', formattedData);

    try {
      const schema = await prisma.approvalSchema.create({
        data: formattedData,
        include: {
          approvalSteps: true
        }
      });

      await prisma.activityHistory.create({
        data: {
          userId: session.user.id,
          entityType: 'APPROVAL_SCHEMA',
          entityId: schema.name,
          action: 'CREATE',
          details: {
            name: schema.name,
            documentType: schema.documentType,
            description: schema.description
          }
        }
      });
      
      return NextResponse.json(schema);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating schema:', error);
    return NextResponse.json(
      { error: 'Failed to create approval schema' },
      { status: 500 }
    );
  }
}

// GET endpoint jika diperlukan
export async function GET() {
  try {
    const [approvalSchemas, roles, workDivisions] = await Promise.all([
      prisma.approvalSchema.findMany({
        include: {
          approvalSteps: {
            include: {
              role: true,
            },
          },
          workDivisions: true,
          roles: true
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.role.findMany({
        where: {
          roleCode: {
            not: 'ADMIN',
          },
        },
      }),
      prisma.workDivision.findMany()
    ]);

    const transformedSchemas = approvalSchemas.map((schema) => ({
      ...schema,
      applicableRoles: schema.roleIds ? 
        roles.filter((role) => 
          (Array.isArray(schema.roleIds) ? schema.roleIds : JSON.parse(schema.roleIds || '[]')).includes(role.id)
        ) : [],
      applicableWorkDivisions: schema.workDivisionIds ?
        workDivisions.filter((div) => 
          (Array.isArray(schema.workDivisionIds) ? schema.workDivisionIds : JSON.parse(schema.workDivisionIds || '[]')).includes(div.id)
        ) : []
    }));

    return NextResponse.json({ 
      approvalSchemas: transformedSchemas,
      workDivisions,
      roles
    });
  } catch (error) {
    console.error('Failed to fetch schemas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schemas' },
      { status: 500 }
    );
  }
} 