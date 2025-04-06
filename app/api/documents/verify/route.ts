import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing verification code' },
        { status: 400 }
      );
    }

    // Clean the verification code
    const cleanCode = decodeURIComponent(code.trim());
    console.log('Searching for document with verification code:', cleanCode);

    // Find the document and its signatures
    const document = await prisma.document.findFirst({
      where: {
        verificationCode: cleanCode
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
        uploader: {
          include: {
            role: true
          }
        },
        signedByUser: {
          include: {
            role: true
          }
        }
      }
    });

    console.log('Document found:', document ? 'yes' : 'no');

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Document is valid if it has been signed
    const isValid = !!document.signedFileUrl && !!document.signedAt;
    console.log('Document is valid:', isValid);

    return NextResponse.json({
      isValid,
      document: {
        fileName: document.fileName,
        signedFileUrl: document.signedFileUrl,
        signedAt: document.signedAt,
        signedBy: document.signedByUser ? {
          name: document.signedByUser.name,
          role: document.signedByUser.role.roleName
        } : null,
        signatures: document.signatures.map(sig => ({
          id: sig.id,
          signedAt: sig.signedAt,
          user: {
            name: sig.user.name,
            role: {
              roleName: sig.user.role.roleName
            }
          }
        }))
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