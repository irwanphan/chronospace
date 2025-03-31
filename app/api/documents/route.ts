import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { list } from '@vercel/blob';

export async function GET() {
  try {
    // 1. Ambil semua file dari Vercel Blob
    const { blobs } = await list();
    // console.log(blobs);

    // 2. Ambil semua dokumen dari database
    const dbDocuments = await prisma.document.findMany({
      include: {
        uploader: {
          select: {
            name: true,
          }
        },
        project: {
          select: {
            id: true,
            code: true,
            title: true,
          }
        }
      }
    });

    // 3. Map dokumen dari blob dengan data dari database
    const documents = blobs.map(blob => {
      const dbDoc = dbDocuments.find(doc => doc.fileUrl === blob.url);
      
      return {
        id: dbDoc?.id || blob.url,
        fileName: blob.pathname.split('/').pop() || 'Unknown',
        fileUrl: blob.url,
        fileType: blob.pathname.split('.').pop()?.toUpperCase() || 'Unknown',
        uploadedAt: dbDoc?.uploadedAt || blob.uploadedAt,
        size: blob.size,
        uploader: {
          name: dbDoc?.uploader?.name || '-'
        },
        usages: dbDoc?.project ? [{
          entityType: 'PROJECT',
          entityId: dbDoc.project.id,
          entityCode: dbDoc.project.code,
          entityTitle: dbDoc.project.title,
        }] : [],
        isOrphan: !dbDoc
      };
    });

    return NextResponse.json({ 
      documents,
      total: documents.length,
      orphanCount: documents.filter(d => d.isOrphan).length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}