import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received data:', body);

    // Validasi data yang diterima
    if (!body.name || !body.documentType || !body.workDivisions || !body.steps) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse workDivisions dan roles jika dalam bentuk string
    const workDivisions = typeof body.workDivisions === 'string' 
      ? JSON.parse(body.workDivisions) 
      : body.workDivisions;

    const roles = typeof body.roles === 'string'
      ? JSON.parse(body.roles)
      : body.roles;

    // Format data sebelum create
    const formattedData = {
      name: body.name,
      documentType: body.documentType,
      divisions: Array.isArray(workDivisions) ? workDivisions.join(',') : workDivisions,
      roles: Array.isArray(roles) ? roles.join(',') : roles,
      title: body.name,
      description: body.description || '',
      steps: {
        create: body.steps.map((step: any, index: number) => ({
          role: step.roleId,
          specificUserId: step.specificUserId || null,
          limit: body.documentType === 'Purchase Request' ? parseFloat(step.budgetLimit) || null : null,
          duration: parseInt(step.duration),
          overtime: step.overtimeAction,
          order: index + 1
        }))
      }
    };

    console.log('Formatted data:', formattedData);

    try {
      const schema = await prisma.approvalSchema.create({
        data: formattedData,
        include: {
          steps: true
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
      { error: 'Failed to create schema', details: error },
      { status: 500 }
    );
  }
}

// GET endpoint jika diperlukan
export async function GET() {
  try {
    const schemas = await prisma.approvalSchema.findMany({
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    return NextResponse.json(schemas);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schemas' },
      { status: 500 }
    );
  }
} 