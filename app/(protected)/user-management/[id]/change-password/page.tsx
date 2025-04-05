import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Card from '@/components/ui/Card';
import ChangePasswordForm from './_components/ChangePasswordForm';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { IconChevronLeft } from '@tabler/icons-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ChangePasswordPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Check if user has permission to change password
  const canChangePassword = session.user.access.activityAccess.changePassword;
  const canChangeOtherUserPassword = session.user.access.activityAccess.changeOtherUserPassword;
  const isSelfChange = session.user.id === params.id;

  if (!canChangePassword && !canChangeOtherUserPassword) {
    redirect('/user-management');
  }

  if (!isSelfChange && !canChangeOtherUserPassword) {
    redirect('/user-management');
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
    }
  });

  if (!user) {
    redirect('/user-management');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2">
        <Link href="/user-management" className="px-1">
          <Button variant="ghost" className="px-1">
            <IconChevronLeft className="w-4 h-4" stroke={4} />
          </Button>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Change Password</h1>
          <p className="text-gray-600">
            {isSelfChange ? 'Change your password' : `Change password for ${user.name}`}
          </p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <ChangePasswordForm 
            userId={user.id}
            isSelfChange={isSelfChange}
          />
        </div>
      </Card>
    </div>
  );
} 