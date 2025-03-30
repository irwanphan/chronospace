import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl, signedPdfData } = await request.json();
    
    if (!fileUrl || !signedPdfData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ambil dokumen asli
    const originalDoc = await prisma.document.findFirst({
      where: { fileUrl }
    });

    if (!originalDoc) {
      return NextResponse.json({ error: 'Original document not found' }, { status: 404 });
    }

    // Download PDF asli
    const originalPdfResponse = await fetch(fileUrl);
    const originalPdfBuffer = await originalPdfResponse.arrayBuffer();

    // Load PDF asli menggunakan pdf-lib
    const pdfDoc = await PDFDocument.load(originalPdfBuffer);
    
    // Konversi base64 signature ke image
    const signatureImageData = signedPdfData.split(',')[1];
    const signatureBuffer = Buffer.from(signatureImageData, 'base64');
    
    // Embed signature image ke PDF
    const signatureImage = await pdfDoc.embedPng(signatureBuffer);
    
    // Dapatkan halaman yang sesuai
    const pages = pdfDoc.getPages();
    const page = pages[0]; // Sesuaikan dengan halaman yang ditandatangani
    
    // Dapatkan dimensi halaman
    const { width, height } = page.getSize();
    
    // Tambahkan signature ke halaman
    page.drawImage(signatureImage, {
      x: width / 2 - signatureImage.width / 2, // Posisi tengah horizontal
      y: height / 2 - signatureImage.height / 2, // Posisi tengah vertical
      width: signatureImage.width,
      height: signatureImage.height,
    });

    // Serialize PDF yang sudah ditandatangani
    const signedPdfBytes = await pdfDoc.save();

    // Generate nama file yang unik
    const fileName = originalDoc.fileName.replace('.pdf', '_signed.pdf');

    // Upload PDF yang sudah ditandatangani
    const { url } = await put(fileName, signedPdfBytes, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: true
    });

    // Simpan ke database
    const signedDoc = await prisma.document.create({
      data: {
        fileName: fileName,
        fileUrl: url,
        fileType: 'pdf',
        uploadedBy: session.user.id,
      }
    });

    return NextResponse.json({ success: true, document: signedDoc });
  } catch (error) {
    console.error('Error in /api/documents/sign:', error);
    return NextResponse.json(
      { error: 'Failed to save signed document' },
      { status: 500 }
    );
  }
} 