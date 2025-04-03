'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { IconUfo } from '@tabler/icons-react';

export default function NotFoundPage() {
  const router = useRouter();
  const { status } = useSession();

  if (status === 'loading') {
    return <LoadingSpin />;
  }

  const handleBackClick = () => {
    if (status === 'authenticated') {
      router.push('/workspace');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <IconUfo className="h-24 w-24 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          404
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          You are lost in space
        </p>

        <button 
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
} 