import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { PDFDocument } from 'pdf-lib';
import { decrypt } from '@/lib/encryption';
import signpdf from 'node-signpdf';
import plainAddPlaceholder from 'node-signpdf/dist/helpers/plainAddPlaceholder';

async function addSignaturePlaceholder(pdfBuffer: Buffer, signatureInfo: { 
  name: string;
  reason?: string;
  location?: string;
  contactInfo?: string;
}): Promise<Buffer> {
  try {
    // Load and modify PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const modifiedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
      updateFieldAppearances: false
    });

    // Add placeholder with signer's info
    return plainAddPlaceholder({
      pdfBuffer: Buffer.from(modifiedPdfBytes),
      reason: signatureInfo.reason || 'Digital Signature',
      contactInfo: signatureInfo.contactInfo || 'ChronoSpace',
      name: signatureInfo.name,
      location: signatureInfo.location || 'Indonesia',
      signatureLength: 16384
    });
  } catch (error) {
    console.error('Error in addSignaturePlaceholder:', error);
    throw error;
  }
}

async function digitallySign(pdfBuffer: Buffer, p12Buffer: Uint8Array, passphrase: string): Promise<Buffer> {
  try {
    return signpdf.sign(pdfBuffer, Buffer.from(p12Buffer), { passphrase });
  } catch (error) {
    console.error('Error in digitallySign:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check for valid certificate
    const activeCertificate = await prisma.userCertificate.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          include: {
            role: true // Include role information
          }
        }
      }
    });

    if (!activeCertificate) {
      return new NextResponse(
        JSON.stringify({ error: 'No valid certificate found. Please generate a certificate first.' }), 
        { status: 400 }
      );
    }

    const { fileUrl, signatures, verificationCode } = await request.json();
    
    if (!fileUrl || !signatures?.length || !verificationCode) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Download dan load PDF asli
    console.log('Downloading PDF:', fileUrl);
    const originalPdfResponse = await fetch(fileUrl);
    if (!originalPdfResponse.ok) {
      return new NextResponse('Failed to fetch original PDF', { status: 500 });
    }

    const originalPdfBuffer = await originalPdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(originalPdfBuffer);
    const pages = pdfDoc.getPages();

    // Proses setiap tanda tangan visual
    for (const signature of signatures) {
      try {
        const signatureImageData = signature.dataUrl.split(',')[1];
        const signatureBuffer = Buffer.from(signatureImageData, 'base64');
        const signatureImage = await pdfDoc.embedPng(signatureBuffer);
        
        const pageIndex = signature.page - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) {
          continue;
        }

        const page = pages[pageIndex];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        const position = {
          x: pageWidth * signature.position.left,
          y: pageHeight * (1 - signature.position.top - signature.position.height),
          width: pageWidth * signature.position.width,
          height: pageHeight * signature.position.height
        };

        page.drawImage(signatureImage, position);
      } catch (signatureError) {
        console.error('Error processing signature:', signatureError);
        continue;
      }
    }

    // Simpan PDF dengan tanda tangan visual
    console.log('Saving PDF with visual signatures...');
    const pdfWithSignatureBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
      updateFieldAppearances: false
    });
    
    const pdfBuffer = Buffer.from(pdfWithSignatureBytes);

    try {
      // Decrypt certificate password
      console.log('Decrypting certificate password...');
      const certificatePassword = await decrypt(activeCertificate.password);
      
      // Add placeholder and sign with user's certificate
      console.log('Adding signature placeholder...');
      const pdfWithPlaceholder = await addSignaturePlaceholder(pdfBuffer, {
        name: `${activeCertificate.user.name} (${activeCertificate.user.role.roleName})`,
        reason: 'Document Signature',
        location: 'Indonesia',
        contactInfo: activeCertificate.user.email || 'ChronoSpace'
      });

      console.log('Applying digital signature...');
      const signedPdfBytes = await digitallySign(
        pdfWithPlaceholder, 
        activeCertificate.p12cert,
        certificatePassword
      );

      // Get original filename without extension and clean it
      let originalFileName = fileUrl.split('/').pop()?.split('.')[0] || 'document';
      originalFileName = decodeURIComponent(originalFileName)
        .replace(/%20/g, '-')
        .replace(/\s+/g, '-')
        .replace(/%/g, '-');

      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const randomId = Math.random().toString(36).substring(2, 6);
      
      // Extract the base name without any existing 'signed_' prefix
      const baseName = originalFileName.startsWith('signed_') 
        ? originalFileName.substring(7) 
        : originalFileName;
        
      const signedFileName = `signed_documents/${baseName}_signed_${timestamp}_${randomId}.pdf`;

      console.log('Uploading signed PDF...');
      const { url: signedUrl } = await put(signedFileName, signedPdfBytes, {
        access: 'public',
        contentType: 'application/pdf'
      });

      // Get or create original document record
      let originalDocument = await prisma.document.findFirst({
        where: {
          OR: [
            { fileUrl: fileUrl },
            { signedFileUrl: fileUrl }
          ]
        }
      });

      if (!originalDocument) {
        // If original document doesn't exist in DB, create it
        originalDocument = await prisma.document.create({
          data: {
            fileName: `${originalFileName}.pdf`,
            fileUrl: fileUrl,
            uploadedAt: new Date(),
            entityType: 'DOCUMENT',
            entityId: '', // Empty string since this is a standalone document
            uploader: {
              connect: {
                id: session.user.id
              }
            }
          }
        });
      }

      // Check if a signed version already exists
      const existingSignedDoc = await prisma.document.findFirst({
        where: {
          fileUrl: originalDocument.fileUrl,
          signedFileUrl: signedUrl
        }
      });

      if (existingSignedDoc) {
        console.log('Document already signed with this signature');
        return new NextResponse(
          JSON.stringify({ error: 'Document already signed with this signature' }), 
          { status: 400 }
        );
      }

      // Create new document for signed version
      const signedDocument = await prisma.document.create({
        data: {
          fileName: `signed_${originalFileName}.pdf`,
          fileUrl: originalDocument.fileUrl, // Keep reference to original
          signedFileUrl: signedUrl,
          uploadedAt: new Date(),
          signedAt: new Date(),
          signedByUser: {
            connect: {
              id: session.user.id
            }
          },
          uploader: {
            connect: {
              id: session.user.id
            }
          },
          entityType: 'DOCUMENT',
          entityId: originalDocument.id // Reference to the original document
        },
        include: {
          signatures: true,
          signedByUser: true
        }
      });

      // Create signature record
      const newSignature = await prisma.documentSignature.create({
        data: {
          document: {
            connect: {
              id: signedDocument.id
            }
          },
          user: {
            connect: {
              id: session.user.id
            }
          },
          signedAt: new Date(),
          signedFileUrl: signedUrl,
          order: 0 // First signature for this document
        }
      });

      // Get complete document info
      const updatedDoc = await prisma.document.findUnique({
        where: {
          id: signedDocument.id
        },
        include: {
          signatures: {
            include: {
              user: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          signedByUser: true
        }
      });

      if (!updatedDoc) {
        throw new Error('Failed to retrieve updated document');
      }

      // activity history
      await prisma.activityHistory.create({
        data: {
          userId: session.user.id,
          action: 'SIGN',
          entityType: 'DOCUMENT',
          entityId: signedDocument.id,
          entityCode: signedDocument.fileName,
          details: {
            documentUrl: signedDocument.fileUrl,
            signedBy: updatedDoc.signedByUser?.name || '',
            signedAt: updatedDoc.signedAt
          }
        }
      });

      return NextResponse.json({ 
        success: true, 
        document: updatedDoc,
        signaturesCount: 1,
        latestSignature: newSignature
      });
    } catch (error) {
      console.error('Digital signing error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to apply digital signature' }), 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in /api/documents/sign:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to process signed document',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
} 