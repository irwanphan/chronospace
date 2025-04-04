import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ActivityLogTable from '@/components/activity-log/ActivityLogTable';
import Card from '@/components/ui/Card';

export default async function ActivityLogPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch activity histories with user information
  const activities = await prisma.activityHistory.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  return (
    <div className="space-y-8">

      <div className="space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600">View all system activities and changes</p>
        </div>
      
        <Card className='p-[8px]'>
          <ActivityLogTable activities={activities} />
        </Card>
      </div>
    </div>
  );
} 