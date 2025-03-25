import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil semua dokumen beserta relasinya
    const documents = await prisma.projectDocument.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    // Format data untuk response
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType,
      uploadedAt: doc.uploadedAt,
      uploadedBy: doc.user.name,
      usages: [
        {
          entityType: 'PROJECT',
          entityId: doc.project.id,
          entityCode: doc.project.code,
          entityTitle: doc.project.title,
        },
        // Tambahkan logic untuk budget dan purchase request jika ada
      ].filter(usage => usage.entityId), // Filter out null usages
    }));

    return NextResponse.json({ documents: formattedDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
} 