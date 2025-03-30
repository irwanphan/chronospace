import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { fileUrl, signatures } = await request.json();
    
    if (!fileUrl || !signatures?.length) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

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

        // Hitung posisi absolut
        const position = {
          x: pageWidth * signature.position.left,
          y: pageHeight * (1 - signature.position.top - signature.position.height),
          width: pageWidth * signature.position.width,
          height: pageHeight * signature.position.height
        };

        // Tambahkan signature ke halaman
        page.drawImage(signatureImage, {
          x: position.x,
          y: position.y,
          width: position.width,
          height: position.height
        });
      } catch (signatureError) {
        console.error('Error processing signature:', signatureError);
        continue;
      }
    }

    // Generate nama file yang unik
    const timestamp = Date.now();
    const originalFileName = decodeURIComponent(fileUrl.split('/').pop() || 'document');
    const newFileName = originalFileName.replace('.pdf', `_signed_${timestamp}.pdf`);

    // Serialize dan simpan PDF
    try {
      const signedPdfBytes = await pdfDoc.save();

      const { url } = await put(newFileName, signedPdfBytes, {
        access: 'public',
        contentType: 'application/pdf'
      });

      // Simpan ke database sesuai dengan schema Prisma
      const signedDoc = await prisma.document.create({
        data: {
          fileName: newFileName,
          fileUrl: url,
          signedFileUrl: url, // URL file yang sudah ditandatangani
          signedAt: new Date(), // Waktu penandatanganan
          uploader: {
            connect: {
              id: session.user.id
            }
          },
          signedByUser: {
            connect: {
              id: session.user.id
            }
          }
        }
      });

      return NextResponse.json({ success: true, document: signedDoc });
    } catch (saveError) {
      console.error('Error saving signed document:', saveError);
      return new NextResponse('Failed to save signed document', { status: 500 });
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