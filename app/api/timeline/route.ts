import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// GET all timeline items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    let whereClause = {};
    if (type) {
      whereClause = { type };
    }
    
    const items = await prisma.timelineItem.findMany({
      where: whereClause,
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
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip,
    });
    
    const total = await prisma.timelineItem.count({ where: whereClause });
    
    return NextResponse.json({
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching timeline items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline items' },
      { status: 500 }
    );
  }
}

// POST create a new timeline item
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create timeline items' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, description, date, type, isPublic, imageUrl, ...specificData } = body;
    
    if (!title || !date || !type) {
      return NextResponse.json(
        { error: 'Title, date, and type are required' },
        { status: 400 }
      );
    }
    
    let data: any = {
      title,
      description,
      date: new Date(date),
      type,
      isPublic: isPublic ?? true,
      imageUrl,
      createdBy: session.user.id,
    };
    
    // Handle type-specific data
    if (type === 'event' && specificData.event) {
      data.event = {
        create: {
          location: specificData.event.location,
          startTime: specificData.event.startTime ? new Date(specificData.event.startTime) : null,
          endTime: specificData.event.endTime ? new Date(specificData.event.endTime) : null,
          organizer: specificData.event.organizer,
          isAllDay: specificData.event.isAllDay ?? false,
        }
      };
    } else if (type === 'news' && specificData.news) {
      data.news = {
        create: {
          source: specificData.news.source,
          url: specificData.news.url,
          content: specificData.news.content,
        }
      };
    } else if (type === 'link' && specificData.link) {
      data.link = {
        create: {
          url: specificData.link.url,
          category: specificData.link.category,
          importance: specificData.link.importance ?? 0,
        }
      };
    }
    
    const newItem = await prisma.timelineItem.create({
      data,
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
    
    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error creating timeline item:', error);
    return NextResponse.json(
      { error: 'Failed to create timeline item' },
      { status: 500 }
    );
  }
} 