'use client';

import { usePageTitleStore } from '@/store/usePageTitleStore';
import { useEffect } from 'react';

export default function TimelinePage() {
  const setPage = usePageTitleStore(state => state.setPage);
  
  useEffect(() => {
    setPage('Workspace Update', ['']);
  }, [setPage]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Timeline</h1>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <p>Timeline content goes here</p>
      </div>
    </div>
  );
} 