import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId, signedPdfData } = await request.json();

    // Get the original document
    const originalDoc = await prisma.projectDocument.findUnique({
      where: { id: documentId },
    });

    if (!originalDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Convert base64 to blob and upload
    const base64Data = signedPdfData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload signed version
    const fileName = originalDoc.fileName.replace('.pdf', '_signed.pdf');
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    // Update document record
    const updatedDoc = await prisma.projectDocument.update({
      where: { id: documentId },
      data: {
        signedFileUrl: blob.url,
        signedAt: new Date(),
        signedBy: session.user.id,
      },
    });

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json(
      { error: 'Failed to sign document' },
      { status: 500 }
    );
  }
} 