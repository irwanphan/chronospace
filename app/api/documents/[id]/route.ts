import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { del, list } from '@vercel/blob';

function normalizeUrl(url: string): string {
  try {
    // Decode URL completely (handle multiple encodings)
    let decodedUrl = url;
    while (decodedUrl !== decodeURIComponent(decodedUrl)) {
      decodedUrl = decodeURIComponent(decodedUrl);
    }
    return decodedUrl;
  } catch {
    return url;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const fileUrl = normalizeUrl(params.id);
    console.log('Attempting to delete file:', fileUrl);
    
    // First try to find document in database by URL
    const document = await prisma.document.findFirst({
      where: {
        OR: [
          { fileUrl: fileUrl },
          { signedFileUrl: fileUrl }
        ]
      },
      include: {
        signatures: true
      }
    });

    console.log('Found document in database:', document ? 'yes' : 'no');

    // If document exists in database, delete it and its signatures
    if (document) {
      console.log('Deleting document from database, ID:', document.id);
      await prisma.$transaction(async (tx) => {
        // Delete all signatures first
        if (document.signatures.length > 0) {
          console.log('Deleting signatures:', document.signatures.length);
          await tx.documentSignature.deleteMany({
            where: {
              documentId: document.id
            }
          });
        }

        // Then delete the document
        await tx.document.delete({
          where: {
            id: document.id
          }
        });
      });
      console.log('Document deleted from database');
    }

    // Always try to delete the file from blob storage
    try {
      // List all files to find the exact blob
      console.log('Listing blobs...');
      const { blobs } = await list();
      console.log('Total blobs found:', blobs.length);
      
      // Find blob by normalized URL
      const foundBlob = blobs.find(blob => {
        const normalizedBlobUrl = normalizeUrl(blob.url);
        const urlsMatch = normalizedBlobUrl === fileUrl;
        if (urlsMatch) {
          console.log('Found matching blob:', blob.url);
        }
        return urlsMatch;
      });
      
      if (foundBlob) {
        console.log('Deleting blob:', foundBlob.url);
        await del(foundBlob.url);
        console.log('Blob deleted successfully');
        
        // Jika ini adalah file yang ditandatangani, JANGAN hapus file asli
        if (document?.signedFileUrl === fileUrl) {
          console.log('This is a signed document, original document will be preserved');
        }
        // Jika ini adalah file asli dan memiliki versi yang ditandatangani, hapus versi yang ditandatangani
        else if (document?.signedFileUrl && document.fileUrl === fileUrl) {
          console.log('This is an original document with signed version, attempting to delete signed version:', document.signedFileUrl);
          try {
            const signedBlob = blobs.find(blob => 
              document.signedFileUrl && 
              normalizeUrl(blob.url) === normalizeUrl(document.signedFileUrl)
            );
            if (signedBlob) {
              await del(signedBlob.url);
              console.log('Signed version deleted successfully');
            }
          } catch (error) {
            console.error('Error deleting signed version:', error);
          }
        }
      } else {
        console.log('No matching blob found for URL:', fileUrl);
      }
    } catch (error) {
      console.error('Error deleting file from blob storage:', error);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to delete document',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
} 