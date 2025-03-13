import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface RequestStep {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
  stepOrder: number;  
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received data:', body);

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
        create: body.approvalSteps.map((step: RequestStep) => ({
          roleId: step.roleId,
          specificUserId: step.specificUserId,
          duration: step.duration,
          overtimeAction: step.overtimeAction,
          limit: step.budgetLimit,
          stepOrder: step.stepOrder
        }))
      }
    };

    console.log('Formatted data:', formattedData);

    try {
      const schema = await prisma.approvalSchema.create({
        data: formattedData,
        include: {
          approvalSteps: true
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
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.role.findMany(),
      prisma.workDivision.findMany()
    ]);

    const transformedSchemas = approvalSchemas.map(schema => ({
      ...schema,
      applicableRoles: schema.roleIds ? 
        roles.filter(role => 
          JSON.parse(schema.roleIds || '[]').includes(role.id)
        ) : [],
      applicableWorkDivisions: schema.workDivisionIds ?
        workDivisions.filter(div => 
          JSON.parse(schema.workDivisionIds).includes(div.id)
        ) : []
    }));

    return NextResponse.json({ approvalSchemas: transformedSchemas });
  } catch (error) {
    console.error('Failed to fetch schemas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schemas' },
      { status: 500 }
    );
  }
} 