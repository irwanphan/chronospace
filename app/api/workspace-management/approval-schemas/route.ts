import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface RequestStep {
  role: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
  order: number;
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

    // Parse workDivisions dan roles jika dalam bentuk string
    // const workDivisions = typeof body.workDivisions === 'string' 
    //   ? JSON.parse(body.workDivisions) 
    //   : body.workDivisions;

    // const roles = typeof body.roles === 'string'
    //   ? JSON.parse(body.roles)
    //   : body.roles;

    // Format data sebelum create
    const formattedData = {
      name: body.name,
      documentType: body.documentType,
      description: body.description || '',
      // divisions: Array.isArray(workDivisions) ? workDivisions.join(',') : workDivisions,
      // roles: Array.isArray(roles) ? roles.join(',') : roles,
      divisions: body.workDivisions,
      roles: body.roles,
      approvalSteps: {
        create: body.approvalSteps.map((step: RequestStep) => ({
          role: step.role,
          specificUserId: step.specificUserId,
          duration: step.duration,
          overtimeAction: step.overtimeAction,
          limit: step.budgetLimit,
          order: step.order
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
    const [ schemas, divisions, roles ] = await Promise.all([
      prisma.approvalSchema.findMany({
        include: {
          approvalSteps: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.workDivision.findMany(),
      prisma.role.findMany(),
    ]);

    return NextResponse.json({ schemas, divisions, roles });
  } catch (error) {
    console.error('Failed to fetch schemas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schemas' },
      { status: 500 }
    );
  }
} 