'use client';
import { Star, Users, Building2, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const subNavigation = [
  {
    name: 'Work Division',
    href: '/workspace-management/work-division',
    icon: Star
  },
  {
    name: 'Role',
    href: '/workspace-management/role',
    icon: Users
  },
  {
    name: 'Vendors',
    href: '/workspace-management/vendors',
    icon: Building2
  },
  {
    name: 'Approval Schema',
    href: '/workspace-management/approval-schema',
    icon: FileCheck
  }
];

export default function WorkspaceManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6">
      <div className="w-64 shrink-0">
        <nav className="space-y-1">
          {subNavigation.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive && "text-blue-600"
                )} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 