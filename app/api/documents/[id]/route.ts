import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { del, list } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // List semua file di blob storage
    const { blobs } = await list();
    
    // Cari blob yang akan dihapus
    const foundBlob = blobs.find(blob => blob.url === params.id);
    if (!foundBlob) {
      return NextResponse.json(
        { error: 'Document not found in blob storage' }, 
        { status: 404 }
      );
    }

    // Hapus dari blob storage
    await del(foundBlob.url);

    // Cek dan hapus dari database jika ada
    const document = await prisma.document.findFirst({
      where: { fileUrl: foundBlob.url }
    });

    if (document) {
      // Jika ada signed version, hapus juga
      if (document.signedFileUrl) {
        await del(document.signedFileUrl);
      }
      
      // Hapus dari database
      await prisma.document.delete({
        where: { id: document.id }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Document deleted successfully',
      wasInDatabase: !!document
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 