import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { generatePDF } from '@/lib/pdf-generator';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, content, footer } = await request.json();

    // Generate PDF from content
    const pdfBuffer = await generatePDF({ title, content, footer });

    // Upload PDF to Vercel Blob
    const blob = await put(`documents/${title}-${Date.now()}.pdf`, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf'
    });

    // Save document metadata to database
    const document = await prisma.document.create({
      data: {
        fileName: title,
        fileUrl: blob.url,
        fileType: 'application/pdf',
        uploader: {
          connect: {
            id: session.user.id
          }
        },
        entityType: 'DOCUMENT',
        entityId: '', // Empty string since this is a standalone document
        fileData: pdfBuffer
      }
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Error creating document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 