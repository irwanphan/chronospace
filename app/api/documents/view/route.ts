import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil URL dari query params
    const fileUrl = request.nextUrl.searchParams.get('url');
    console.log('fileUrl ', fileUrl);
    const downloadUrl = fileUrl ? `${fileUrl}?download=1` : null;

    if (!fileUrl || !downloadUrl) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Fetch PDF dari blob storage
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: response.status });
    }

    console.log('response ', response);
    // Forward response
    const blob = await response.blob();
    console.log(blob);
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
      },
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 