import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Base data to update
    const updateData: any = {
      title,
      description,
      date: date ? new Date(date) : undefined,
      isPublic,
      imageUrl,
      updatedAt: new Date(),
    };

    // Handle type-specific data
    if (existingItem.type === 'event' && specificData.event) {
      // Update event data
      if (existingItem.eventId) {
        await prisma.timelineEvent.update({
          where: { id: existingItem.eventId },
          data: {
            location: specificData.event.location,
            startTime: specificData.event.startTime ? new Date(specificData.event.startTime) : null,
            endTime: specificData.event.endTime ? new Date(specificData.event.endTime) : null,
            organizer: specificData.event.organizer,
            isAllDay: specificData.event.isAllDay ?? false,
          },
        });
      }
    } else if (existingItem.type === 'news' && specificData.news) {
      // Update news data
      if (existingItem.newsId) {
        await prisma.timelineNews.update({
          where: { id: existingItem.newsId },
          data: {
            source: specificData.news.source,
            url: specificData.news.url,
            content: specificData.news.content,
          },
        });
      }
    } else if (existingItem.type === 'link' && specificData.link) {
      // Update link data
      if (existingItem.linkId) {
        await prisma.timelineLink.update({
          where: { id: existingItem.linkId },
          data: {
            url: specificData.link.url,
            category: specificData.link.category,
            importance: specificData.link.importance ?? 0,
          },
        });
      }
    }

    // Update main timeline item
    const updatedItem = await prisma.timelineItem.update({
      where: { id },
      data: updateData,
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