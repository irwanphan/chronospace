'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { IconBuildingSkyscraper, IconFile, IconIdBadge2, IconSchema, IconUsersGroup } from '@tabler/icons-react';

const subNavigation = [
  {
    name: 'Work Division',
    href: '/workspace-management/work-division',
    icon: IconUsersGroup
  },
  {
    name: 'Role',
    href: '/workspace-management/role',
    icon: IconIdBadge2
  },
  {
    name: 'Vendors',
    href: '/workspace-management/vendors',
    icon: IconBuildingSkyscraper
  },
  {
    name: 'Approval Schema',
    href: '/workspace-management/approval-schema',
    icon: IconSchema
  },
  {
    name: 'Documents',
    href: '/workspace-management/documents',
    icon: IconFile
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
      <div className="w-64 pr-4 shrink-0 fixed">
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
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
} 