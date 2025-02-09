import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
} 