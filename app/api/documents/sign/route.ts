import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { PDFDocument } from 'pdf-lib';
import { decrypt } from '@/lib/encryption';
import signpdf from 'node-signpdf';
import { Session } from 'next-auth';

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

type SignPdfOptions = {
  passphrase: string;
};

async function addSignaturePlaceholder(pdfBuffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const form = pdfDoc.getForm();
  const [page] = pdfDoc.getPages();

  const textField = form.createTextField('Signature1');
  textField.addToPage(page, {
    x: 50,
    y: 50,
    width: 200,
    height: 50,
  });

  const modifiedPdf = await pdfDoc.save();
  return Buffer.from(modifiedPdf);
}

async function digitallySign(pdfBuffer: Buffer, p12Buffer: Uint8Array, passphrase: string): Promise<Buffer> {
  const signedPdf = signpdf.sign(pdfBuffer, Buffer.from(p12Buffer), {
    passphrase: passphrase,
  } as SignPdfOptions);

  return signedPdf;
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

    // Generate nama file yang lebih pendek
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `signed_${timestamp}_${randomId}.pdf`;

    // Download dan load PDF asli
    const originalPdfResponse = await fetch(fileUrl);
    if (!originalPdfResponse.ok) {
      return new NextResponse('Failed to fetch original PDF', { status: 500 });
    }

    const originalPdfBuffer = await originalPdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(originalPdfBuffer);
    const pages = pdfDoc.getPages();

    // Proses setiap tanda tangan
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
    const pdfWithSignatureBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfWithSignatureBytes);

    try {
      // Decrypt certificate password
      const certificatePassword = await decrypt(activeCertificate.password);
      
      // Add placeholder and sign with user's certificate
      const pdfWithPlaceholder = await addSignaturePlaceholder(pdfBuffer);
      const signedPdfBytes = await digitallySign(
        pdfWithPlaceholder, 
        activeCertificate.p12cert,
        certificatePassword
      );

      return await uploadSignedPdf(signedPdfBytes, fileName, session.user);
    } catch (signError) {
      console.error('Digital signing error:', signError);
      // Jika digital signing gagal, gunakan versi dengan tanda tangan visual saja
      return await uploadSignedPdf(pdfBuffer, fileName, session.user);
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

async function uploadSignedPdf(pdfBytes: Buffer, fileName: string, user: Session['user']) {
  const { url } = await put(fileName, pdfBytes, {
    access: 'public',
    contentType: 'application/pdf'
  });

  const signedDoc = await prisma.document.create({
    data: {
      fileName,
      fileUrl: url,
      signedFileUrl: url,
      signedAt: new Date(),
      uploader: {
        connect: {
          id: user.id
        }
      },
      signedByUser: {
        connect: {
          id: user.id
        }
      }
    }
  });

  return NextResponse.json({ success: true, document: signedDoc });
} 