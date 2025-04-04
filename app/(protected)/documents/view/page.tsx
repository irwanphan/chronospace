'use client';

import dynamic from 'next/dynamic';
import LoadingSpin from '@/components/ui/LoadingSpin';

// Import PDF viewer component secara dynamic dengan disabled SSR
const PDFViewer = dynamic(
  () => import('@/app/(protected)/documents/view/_components/PDFViewer'),
  { 
    ssr: false,
    loading: () => <LoadingSpin />
  }
);

// Buat page component yang sederhana
export default function DocumentViewerPage() {
  return (
    <div className="max-w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
        </div>
      </div>
      <PDFViewer />
    </div>
  );
} 