import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { put, list } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileUrl, signedPdfData } = body;

    // List semua file di blob storage
    const { blobs } = await list();
    
    // Cari blob yang URL-nya sama persis
    const foundBlob = blobs.find(blob => blob.url === fileUrl);
    console.log('Found blob:', foundBlob);

    if (!foundBlob) {
      return NextResponse.json(
        { 
          error: 'Document not found in blob storage',
          searchedUrl: fileUrl,
        }, 
        { status: 404 }
      );
    }

    // Get or create document
    let doc = await prisma.document.findFirst({
      where: { fileUrl: foundBlob.url }
    });

    if (!doc) {
      // Create new document
      doc = await prisma.document.create({
        data: {
          fileName: foundBlob.pathname,
          fileUrl: foundBlob.url,
          fileType: 'pdf',
          uploadedBy: session.user.id,
        }
      });
      console.log('Created new document:', doc);
    }

    // Process signature
    const base64Data = signedPdfData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const fileNameBlob = doc.fileName.replace('.pdf', '_signed.pdf');
    
    const blob = await put(fileNameBlob, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    // Update document
    const updatedDoc = await prisma.document.update({
      where: { id: doc.id },
      data: {
        signedFileUrl: blob.url,
        signedAt: new Date(),
        signedBy: session.user.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Document signed successfully',
      document: updatedDoc
    });
  } catch (error) {
    console.error('Error in sign API:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
} 