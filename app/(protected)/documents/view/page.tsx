'use client';

import dynamic from 'next/dynamic';
import LoadingSpin from '@/components/ui/LoadingSpin';
import CertificateStatus from '@/components/CertificateStatus';
import SignatureInfo from '@/components/SignatureInfo';

// Import PDF viewer component secara dynamic dengan disabled SSR
const PDFViewer = dynamic(
  () => import('@/components/PDFViewer'),
  { 
    ssr: false,
    loading: () => <LoadingSpin />
  }
);

// Buat page component yang sederhana
export default function DocumentViewerPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Document Viewer</h1>
        <div className="flex items-center gap-4">
          <SignatureInfo />
          <CertificateStatus />
        </div>
      </div>
      <PDFViewer />
    </div>
  );
} 