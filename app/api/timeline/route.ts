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

    // Gunakan transaction untuk membuat item dan related entities
    const newItem = await prisma.$transaction(async (tx) => {
      // Buat variabel untuk menyimpan ID (jika dibuat)
      let eventId = null;
      let newsId = null;
      let linkId = null;
      
      // Buat entitas berdasarkan tipe
      if (type === 'event' && specificData.event) {
        // Fix untuk all-day events
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
        
        // Buat event terlebih dahulu
        const eventCreated = await tx.timelineEvent.create({
          data: {
            location,
            startTime,
            endTime,
            organizer,
            isAllDay: isAllDay ?? false,
          }
        });
        
        eventId = eventCreated.id;
      } else if (type === 'news' && specificData.news) {
        // Buat news
        const newsCreated = await tx.timelineNews.create({
          data: {
            source: specificData.news.source,
            url: specificData.news.url,
            content: specificData.news.content,
          }
        });
        
        newsId = newsCreated.id;
      } else if (type === 'link' && specificData.link) {
        // Buat link
        const linkCreated = await tx.timelineLink.create({
          data: {
            url: specificData.link.url,
            category: specificData.link.category,
            importance: specificData.link.importance ?? 0,
          }
        });
        
        linkId = linkCreated.id;
      }
      
      // Buat timeline item dengan ID yang sesuai
      const timelineItem = await tx.timelineItem.create({
        data: {
          title,
          description,
          date: new Date(date),
          type,
          isPublic: isPublic ?? true,
          imageUrl,
          createdBy: session.user.id,
          eventId,
          newsId,
          linkId,
        },
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
      
      return timelineItem;
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