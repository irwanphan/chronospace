import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import GenerateCertificateForm from './_components/GenerateCertificateForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IconChevronLeft } from '@tabler/icons-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function GenerateCertificatePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      certificates: {
        where: {
          isActive: true,
          revokedAt: null,
          expiresAt: {
            gt: new Date()
          }
        }
      }
    }
  });

  if (!user) {
    redirect('/user-management');
  }

  return (
    <div className="space-y-6">
        <div className="flex items-start gap-2">
          <Link href="/profile" className="px-1">
            <Button variant="ghost" className="px-1 self-start">
              <IconChevronLeft className="w-4 h-4" stroke={4} />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Generate Certificate</h1>
            <p className="text-gray-600">Generate digital certificate for {user.name}</p>
          </div>
      </div>

      <Card>
        <div className="p-6">
          <GenerateCertificateForm 
            userId={user.id} 
            userName={user.name || ''}
            userEmail={user.email || ''}
            hasActiveCertificate={user.certificates.length > 0}
          />
        </div>
      </Card>
    </div>
  );
} 