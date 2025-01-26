'use client';
import { useSidebarStore } from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();

  return (
    <main className={cn(
      "flex-1 mt-16 min-h-screen p-6 bg-gray-50 transition-all duration-300",
      isCollapsed ? "ml-16" : "ml-64"
    )}>
      {children}
    </main>
  );
} 