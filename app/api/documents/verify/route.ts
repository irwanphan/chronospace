import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('doc');
    const signer = searchParams.get('signer');
    const time = searchParams.get('time');

    if (!docId || !signer || !time) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Find the document and its signatures
    const document = await prisma.document.findFirst({
      where: {
        OR: [
          { fileUrl: { contains: docId } },
          { signedFileUrl: { contains: docId } }
        ]
      },
      include: {
        signatures: {
          include: {
            user: {
              include: {
                role: true
              }
            }
          },
          orderBy: {
            signedAt: 'asc'
          }
        },
        signedByUser: {
          include: {
            role: true
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify document integrity
    let isValid = true;
    
    // If document has been signed
    if (document.signedFileUrl && document.signedAt) {
      try {
        // Fetch the signed PDF
        const response = await fetch(document.signedFileUrl);
        if (!response.ok) {
          throw new Error('Could not fetch signed document');
        }
        
        // Document exists and is accessible
        isValid = true;
      } catch (error) {
        console.error('Error verifying PDF:', error);
        isValid = false;
      }
    }

    return NextResponse.json({
      isValid,
      document: {
        fileName: document.fileName,
        signedAt: document.signedAt,
        signedBy: document.signedByUser ? {
          name: document.signedByUser.name,
          role: document.signedByUser.role.roleName
        } : null,
        signatures: document.signatures
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    );
  }
} 