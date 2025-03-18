'use client';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Mail, Building2, MapPin, Link as LinkIcon } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';

export default function ProfilePage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Guest";
  const userImage = session?.user?.image;
  const userRole = session?.user?.role || "User";

  // Dummy data untuk activity
  const activityData = {
    totalContributions: 1274,
    // Dummy data untuk activity heatmap
    activityHeatmap: Array(52).fill(null).map(() => 
      Math.floor(Math.random() * 5)
    ),
  };

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
                  <span>TURBIN</span>
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
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="border-b pb-4">
                      <p className="text-sm text-gray-600">
                        Created purchase request <span className="font-medium text-blue-600">PR-2024-{index + 1}</span>
                      </p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 