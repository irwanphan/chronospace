import dynamic from 'next/dynamic';
import LoadingSpin from '@/components/ui/LoadingSpin';

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
  return <PDFViewer />;
} 