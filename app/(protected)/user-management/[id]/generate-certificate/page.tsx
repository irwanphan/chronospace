import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Card from '@/components/ui/Card';
import GenerateCertificateForm from './GenerateCertificateForm';

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
      <div>
        <h1 className="text-2xl font-bold">Generate Certificate</h1>
        <p className="text-gray-600">Generate digital certificate for {user.name}</p>
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