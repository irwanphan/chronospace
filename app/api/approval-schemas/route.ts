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

    // Parse workDivisions jika dalam bentuk string
    const workDivisions = typeof body.workDivisions === 'string' 
      ? JSON.parse(body.workDivisions) 
      : body.workDivisions;

    // Format data sebelum create
    const formattedData = {
      name: body.name,
      documentType: body.documentType,
      divisions: Array.isArray(workDivisions) ? workDivisions.join(',') : workDivisions,
      title: body.name,
      description: body.description || '',
      steps: {
        create: body.steps.map((step: any, index: number) => ({
          role: step.roleId, // Menggunakan roleId
          limit: body.documentType === 'Purchase Request' ? parseFloat(step.budgetLimit) || null : null,
          duration: parseInt(step.duration),
          overtime: step.overtimeAction,
          order: index + 1
        }))
      }
    };

    console.log('Formatted data:', formattedData);

    const schema = await prisma.approvalSchema.create({
      data: formattedData,
      include: {
        steps: true
      }
    });

    return NextResponse.json(schema);
  } catch (error) {
    // Log error detail
    console.error('Detailed error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : '');
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create schema' },
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