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
        user: true // Include user info for signature details
      }
    });

    if (!activeCertificate) {
      return new NextResponse(
        JSON.stringify({ error: 'No valid certificate found. Please generate a certificate first.' }), 
        { status: 400 }
      );
    }

    const { fileUrl, signatures } = await request.json();
    
    if (!fileUrl || !signatures?.length) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get existing document to check previous signatures
    let document = await prisma.document.findFirst({
      where: {
        OR: [
          { fileUrl: fileUrl },
          { signedFileUrl: fileUrl }
        ]
      },
      include: {
        signatures: {
          include: {
            user: true
          }
        }
      }
    });

    // Download dan load PDF asli
    console.log('Downloading PDF:', fileUrl);
    const originalPdfResponse = await fetch(fileUrl);
    if (!originalPdfResponse.ok) {
      return new NextResponse('Failed to fetch original PDF', { status: 500 });
    }

    const originalPdfBuffer = await originalPdfResponse.arrayBuffer();
    let pdfDoc = await PDFDocument.load(originalPdfBuffer);
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
    
    let pdfBuffer = Buffer.from(pdfWithSignatureBytes);

    try {
      // Decrypt certificate password
      console.log('Decrypting certificate password...');
      const certificatePassword = await decrypt(activeCertificate.password);
      
      // Add placeholder and sign with user's certificate
      console.log('Adding signature placeholder...');
      const pdfWithPlaceholder = await addSignaturePlaceholder(pdfBuffer, {
        name: `${activeCertificate.user.name} (${activeCertificate.user.role})`,
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

      // Upload signed PDF
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileName = `signed_${timestamp}_${randomId}.pdf`;

      console.log('Uploading signed PDF...');
      const { url: signedUrl } = await put(fileName, signedPdfBytes, {
        access: 'public',
        contentType: 'application/pdf'
      });

      // Create or update document record
      if (!document) {
        document = await prisma.document.create({
          data: {
            fileName: fileUrl.split('/').pop() || 'document.pdf',
            fileUrl: fileUrl,
            uploadedAt: new Date(),
            uploader: {
              connect: {
                id: session.user.id
              }
            }
          }
        });
      }

      // Add signature record
      await prisma.documentSignature.create({
        data: {
          document: {
            connect: {
              id: document.id
            }
          },
          user: {
            connect: {
              id: session.user.id
            }
          },
          signedAt: new Date(),
          signedFileUrl: signedUrl
        }
      });

      // Update document with latest signed version
      const updatedDoc = await prisma.document.update({
        where: {
          id: document.id
        },
        data: {
          signedFileUrl: signedUrl,
          signedAt: new Date()
        },
        include: {
          signatures: {
            include: {
              user: true
            }
          }
        }
      });

      return NextResponse.json({ 
        success: true, 
        document: updatedDoc,
        signaturesCount: (updatedDoc.signatures || []).length
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