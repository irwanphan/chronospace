'use client';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useSidebarStore } from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className={cn(
          `
            flex-1 
            min-h-screen 
            p-6 pt-24
            bg-gray-50 
            transition-all duration-300`,
          isCollapsed ? "ml-16" : "ml-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
} 