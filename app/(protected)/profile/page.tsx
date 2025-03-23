'use client';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Mail, Building2, MapPin, Link as LinkIcon } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import { useEffect, useState } from 'react';
import { User } from '@/types/user';
import Link from 'next/link';

interface ActivityHistory {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  entityType: string;
  entityId: string;
  entityCode: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Guest";
  const userImage = session?.user?.image;
  const userRole = session?.user?.role || "User";
  const [activityHistories, setActivityHistories] = useState<ActivityHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Dummy data untuk activity
  const activityData = {
    totalContributions: 1274,
    // Dummy data untuk activity heatmap
    activityHeatmap: Array(52).fill(null).map(() => 
      Math.floor(Math.random() * 5)
    ),
  };

  const [userData, setUserData] = useState<User>({
    id: '',
    name: '',
    email: '',
    image: '',
    roleId: '',
    workDivisionId: '',
    lastLogin: '',
    createdAt: '',
    role: {
      id: '',
      roleName: '',
      roleCode: '',
      description: '',
      budgetLimit: 0,
    },
    workDivision: {
      id: '',
      code: '',
      name: '',
      description: '',
    },
  });

  console.log('userData : ', userData);
  console.log('activityHistories : ', activityHistories);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/profile/${session?.user.id}`);
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        setActivityHistories(data.user.activityHistories);
        setUserData(data.user);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session?.user.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
            {/* Profile Picture & Basic Info */}
            <div className="mb-6">
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName}
                  width={296}
                  height={296}
                  className="rounded-full"
                />
              ) : (
                <div className="w-[296px] h-[296px]">
                  <Avatar>{getInitials(userName)}</Avatar>
                </div>
              )}
              <h1 className="text-2xl font-bold mt-4">{userName}</h1>
              <h2 className="text-xl text-gray-600 font-light">{userRole}</h2>
            </div>

            {/* Bio & Details */}
            <div className="prose prose-sm">
              <p className="text-gray-600 mb-4">
                Frontend Developer passionate about creating beautiful and functional user interfaces.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{userData.workDivision.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Jakarta, Indonesia</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{session?.user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <LinkIcon className="w-4 h-4" />
                  <a href="#" className="text-blue-600 hover:underline">https://yourwebsite.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Activity */}
        <div className="md:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Activity Overview</h2>
              
              {/* Contribution Stats */}
              <div className="mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold text-black">{activityData.totalContributions}</span> contributions in the last year
                </p>
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <ul className="space-y-2">
                  {activityHistories.map((history) => (
                    <li key={history.id} className="border-b pb-2">
                      {history.action === "CREATE" && "Created "}
                      <span> 
                        {history.entityType === "PROJECT" && 
                          <Link className="hover:underline text-blue-600 transition-all duration-300" href={`/project-planning/${history.entityId}`}>
                            <span className="font-semibold">Project {history.entityCode}</span>
                          </Link>
                        }
                        {history.entityType === "PURCHASE_REQUEST" && 
                          <Link className="hover:underline text-blue-600 transition-all duration-300" href={`/workspace/purchase-request/${history.entityId}`}>
                            <span className="font-semibold">Purchase Request {history.entityCode}</span>
                          </Link>
                        }
                        {history.entityType === "WORK_DIVISION" && 
                          <Link className="hover:underline text-blue-600 transition-all duration-300" href={`/workspace-management/work-divisions/${history.entityId}`}>
                            <span className="font-semibold">Work Division {history.entityCode}</span>
                          </Link>
                        }
                        {history.entityType === "APPROVAL_SCHEMA" && 
                          <Link className="hover:underline text-blue-600 transition-all duration-300" href={`/workspace-management/approval-schemas/${history.entityId}`}>
                            <span className="font-semibold">Approval Schema {history.entityCode}</span>
                          </Link>
                        }
                      </span>
                      <span> on </span>
                      <span className="font-semibold">{formatDate(history.timestamp)}</span>
                    
                      
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 