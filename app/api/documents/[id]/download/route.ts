import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id }
    });

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    if (!document.fileData) {
      return new NextResponse('Document data not found', { status: 404 });
    }

    // Create response with PDF data
    const response = new NextResponse(document.fileData);
    
    // Set headers for PDF download
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`);
    
    return response;
  } catch (error) {
    console.error('Error downloading document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 