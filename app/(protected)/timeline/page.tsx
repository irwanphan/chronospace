import { Suspense } from 'react';
import LoadingSpin from '@/components/ui/LoadingSpin';
import TimelinePageContent from './_components/TimelinePageContent';

export default function TimelinePage() {
  return (
    <Suspense fallback={<LoadingSpin />}>
      <TimelinePageContent />
    </Suspense>
  );
}

