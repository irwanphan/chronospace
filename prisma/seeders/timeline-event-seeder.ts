import { prisma } from "@/lib/prisma";
import { faker } from '@faker-js/faker';

export async function timelineEventSeeder() {
  console.log('🌱 Seeding timeline items...');
  
  // Get all users from the database to select creators
  const users = await prisma.user.findMany({
    select: { id: true },
  });
  
  if (users.length === 0) {
    console.log('No users found. Aborting timeline seeding.');
    throw new Error('No users available for timeline item creation');
  }
  
  // User IDs from user-seeder.ts
  const specificUserIds = [
    'cm71xui7r000asgprkai2jfkb', // John CEO
    'g239g84h9g49q28g9hq82g9hf', // Alice CFO
    '29ihvdiuw8r9bdjivue9289vh', // Bob CTO
    '289fhvr2gih9rg8ha9ih98a9f', // Eve HR
    '389fuii7r0sdv8huqweuqrevu', // Frank GM
    'fg71xui7r000asgpgraji935t', // Grace Staff
    'cm71x2fhs89hbd00asgp2jfkb', // Hank Staff
    'ertetrcm71x2fhs89hd00asgp', // Greg Depthead
    '35u8t9wrhidvbs487w3g8iwr9', // Another Depthead
  ];
  
  // Create a filtered list of user IDs that exist in the database
  const validUserIds = users.filter(user => 
    specificUserIds.includes(user.id) || user.id === 'admin'
  ).map(user => user.id);
  
  if (validUserIds.length === 0) {
    // Fallback to all available users if none of the specific IDs match
    console.log('No matching specific users found. Using all available users.');
    validUserIds.push(...users.map(user => user.id));
  }
  
  // Create 15 random timeline events
  const timelineEvents = [];
  
  for (let i = 0; i < 15; i++) {
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
          createdBy: validUserIds[Math.floor(Math.random() * validUserIds.length)],
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
  
  // Create 5 news items
  for (let i = 0; i < 5; i++) {
    const newsDate = faker.date.between({ 
      from: new Date(2023, 0, 1), 
      to: new Date(2024, 11, 31) 
    });
    
    try {
      // Create the news first
      const news = await prisma.timelineNews.create({
        data: {
          source: faker.company.name(),
          url: faker.internet.url(),
          content: faker.lorem.paragraphs({ min: 2, max: 4 }),
        }
      });
      
      // Then create the timeline item linking to the news
      const item = await prisma.timelineItem.create({
        data: {
          title: faker.lorem.sentence({ min: 5, max: 10 }),
          description: faker.lorem.paragraph(),
          date: newsDate,
          type: 'news',
          isPublic: faker.datatype.boolean({ probability: 0.9 }), // 90% chance to be public
          createdBy: validUserIds[Math.floor(Math.random() * validUserIds.length)],
          imageUrl: faker.image.urlLoremFlickr({ category: 'business' }),
          newsId: news.id,
        }
      });
      
      timelineEvents.push(item);
      console.log(`📰 Created news: ${item.title}`);
    } catch (error) {
      console.error(`Failed to create news ${i+1}:`, error);
    }
  }
  
  // Create 5 links
  for (let i = 0; i < 5; i++) {
    const linkDate = faker.date.between({ 
      from: new Date(2023, 0, 1), 
      to: new Date(2024, 11, 31) 
    });
    
    try {
      // Create the link first
      const link = await prisma.timelineLink.create({
        data: {
          url: faker.internet.url(),
          category: faker.helpers.arrayElement(['work', 'article', 'resource', 'social']),
          importance: faker.number.int({ min: 1, max: 5 }),
        }
      });
      
      // Then create the timeline item linking to the link
      const item = await prisma.timelineItem.create({
        data: {
          title: faker.lorem.words({ min: 3, max: 7 }),
          description: faker.lorem.sentence(),
          date: linkDate,
          type: 'link',
          isPublic: faker.datatype.boolean({ probability: 0.7 }), // 70% chance to be public
          createdBy: validUserIds[Math.floor(Math.random() * validUserIds.length)],
          imageUrl: faker.image.urlLoremFlickr({ category: 'technology' }),
          linkId: link.id,
        }
      });
      
      timelineEvents.push(item);
      console.log(`🔗 Created link: ${item.title}`);
    } catch (error) {
      console.error(`Failed to create link ${i+1}:`, error);
    }
  }
  
  // Create 10 thoughts
  const moodOptions = ['happy', 'reflective', 'inspired', 'curious', 'worried', 'excited', 'determined', 'grateful', 'nostalgic', 'hopeful'];
  
  for (let i = 0; i < 10; i++) {
    const thoughtDate = faker.date.between({ 
      from: new Date(2023, 0, 1), 
      to: new Date(2024, 11, 31) 
    });
    
    try {
      // Create the thought first
      const thought = await prisma.timelineThought.create({
        data: {
          content: faker.lorem.paragraph({ min: 1, max: 3 }),
          mood: faker.helpers.arrayElement(moodOptions),
        }
      });
      
      // Then create the timeline item linking to the thought
      const item = await prisma.timelineItem.create({
        data: {
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          description: faker.lorem.sentence({ min: 1, max: 2 }),
          date: thoughtDate,
          type: 'thought',
          isPublic: faker.datatype.boolean({ probability: 0.6 }), // 60% chance to be public
          createdBy: validUserIds[Math.floor(Math.random() * validUserIds.length)],
          imageUrl: faker.datatype.boolean({ probability: 0.3 }) ? faker.image.urlLoremFlickr({ category: 'abstract' }) : null, // 30% chance to have image
          thoughtId: thought.id,
        }
      });
      
      timelineEvents.push(item);
      console.log(`💭 Created thought: ${item.title}`);
    } catch (error) {
      console.error(`Failed to create thought ${i+1}:`, error);
    }
  }
  
  console.log(`✅ Created ${timelineEvents.length} timeline items`);
  return timelineEvents;
} 