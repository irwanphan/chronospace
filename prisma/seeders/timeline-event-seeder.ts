import { prisma } from "@/lib/prisma";
import { faker } from '@faker-js/faker';

export async function timelineEventSeeder() {
  console.log('🌱 Seeding timeline events...');
  
  // Get random user ID for creator reference
  const users = await prisma.user.findMany({
    select: { id: true },
    take: 5, // Get a few users to randomly assign as creators
  });
  
  if (users.length === 0) {
    console.log('No users found. Creating events with default admin user.');
    // Get the admin user or create a default one if needed
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@chronospace.id' }
    });
    
    if (!adminUser) {
      throw new Error('No users available for timeline event creation');
    }
    
    users.push(adminUser);
  }
  
  // Create 20 random timeline events
  const timelineEvents = [];
  
  for (let i = 0; i < 20; i++) {
    const isAllDay = faker.datatype.boolean();
    const eventDate = faker.date.between({ 
      from: new Date(2023, 0, 1), 
      to: new Date(2024, 11, 31) 
    });
    
    try {
      // Create the event first
      const event = await prisma.timelineEvent.create({
        data: {
          location: faker.location.city() + ', ' + faker.location.country(),
          startTime: isAllDay ? null : new Date(eventDate.getTime() + Math.random() * 86400000), // +1 day max
          endTime: isAllDay ? null : new Date(eventDate.getTime() + Math.random() * 172800000), // +2 days max
          organizer: faker.company.name(),
          isAllDay,
        }
      });
      
      // Then create the timeline item linking to the event
      const item = await prisma.timelineItem.create({
        data: {
          title: faker.lorem.words({ min: 3, max: 6 }),
          description: faker.lorem.paragraphs({ min: 1, max: 3 }),
          date: eventDate,
          type: 'event',
          isPublic: faker.datatype.boolean({ probability: 0.8 }), // 80% chance to be public
          createdBy: users[Math.floor(Math.random() * users.length)].id,
          imageUrl: faker.image.urlLoremFlickr({ category: 'event' }),
          eventId: event.id,
        },
        include: {
          event: true,
          creator: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });
      
      timelineEvents.push(item);
      console.log(`📅 Created event: ${item.title}`);
    } catch (error) {
      console.error(`Failed to create event ${i+1}:`, error);
    }
  }
  
  console.log(`✅ Created ${timelineEvents.length} timeline events`);
  return timelineEvents;
} 