'use client';

import { Suspense } from 'react';
import VerificationContent from './VerificationContent';
import LoadingSpin from '@/components/ui/LoadingSpin';

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpin />
          <p className="mt-4 text-gray-600">Loading verification page...</p>
        </div>
      </div>
    }>
      <VerificationContent />
    </Suspense>
  );
} 