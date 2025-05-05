import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

// GET a specific timeline item
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const item = await prisma.timelineItem.findUnique({
      where: { id },
      include: {
        event: true,
        news: true,
        link: true,
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Timeline item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching timeline item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline item' },
      { status: 500 }
    );
  }
}

// PUT update a timeline item
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update timeline items' },
        { status: 401 }
      );
    }

    const id = params.id;
    const body = await request.json();
    const { title, description, date, isPublic, imageUrl, ...specificData } = body;

    // Verify item exists
    const existingItem = await prisma.timelineItem.findUnique({
      where: { id },
      include: {
        event: true,
        news: true,
        link: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Timeline item not found' },
        { status: 404 }
      );
    }

    // Gunakan transaksi untuk update
    const updatedItem = await prisma.$transaction(async (tx) => {
      // Update item utama
      const timelineItem = await tx.timelineItem.update({
        where: { id },
        data: {
          title,
          description,
          date: date ? new Date(date) : undefined,
          isPublic,
          imageUrl,
          updatedAt: new Date(),
        },
      });

      // Update related entities jika perlu
      if (existingItem.type === 'event' && specificData.event && existingItem.eventId) {
        const { location, organizer, isAllDay } = specificData.event;
        let startTime = null;
        let endTime = null;
        
        // Konversi waktu hanya jika isAllDay false dan nilai time tidak kosong
        if (!isAllDay) {
          if (specificData.event.startTime) {
            const startTimeDate = new Date(specificData.event.startTime);
            startTime = isNaN(startTimeDate.getTime()) ? null : startTimeDate;
          }
          
          if (specificData.event.endTime) {
            const endTimeDate = new Date(specificData.event.endTime);
            endTime = isNaN(endTimeDate.getTime()) ? null : endTimeDate;
          }
        }
        
        await tx.timelineEvent.update({
          where: { id: existingItem.eventId },
          data: {
            location,
            startTime,
            endTime,
            organizer,
            isAllDay: isAllDay ?? false,
          },
        });
      } else if (existingItem.type === 'news' && specificData.news && existingItem.newsId) {
        await tx.timelineNews.update({
          where: { id: existingItem.newsId },
          data: {
            source: specificData.news.source,
            url: specificData.news.url,
            content: specificData.news.content,
          },
        });
      } else if (existingItem.type === 'link' && specificData.link && existingItem.linkId) {
        await tx.timelineLink.update({
          where: { id: existingItem.linkId },
          data: {
            url: specificData.link.url,
            category: specificData.link.category,
            importance: specificData.link.importance ?? 0,
          },
        });
      }

      // Fetch updated item with all relations
      const updatedItemWithRelations = await tx.timelineItem.findUnique({
        where: { id },
        include: {
          event: true,
          news: true,
          link: true,
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      await prisma.activityHistory.create({
        data: {
          userId: session.user.id,
          action: 'update',
          entityType: 'timelineItem',
          entityId: id,
          details: JSON.stringify(timelineItem),
          timestamp: new Date(),
        },
      });
      return updatedItemWithRelations;
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating timeline item:', error);
    return NextResponse.json(
      { error: 'Failed to update timeline item' },
      { status: 500 }
    );
  }
}

// DELETE a timeline item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete timeline items' },
        { status: 401 }
      );
    }

    const id = params.id;

    // First check if item exists
    const item = await prisma.timelineItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Timeline item not found' },
        { status: 404 }
      );
    }

    // Delete the item (cascade will delete related records)
    await prisma.timelineItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting timeline item:', error);
    return NextResponse.json(
      { error: 'Failed to delete timeline item' },
      { status: 500 }
    );
  }
} 