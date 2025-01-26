'use client';
import { Calendar, Users, BarChart2, Settings, Layout, Clock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Timeline',
    href: '/timeline',
    icon: Clock
  },
  {
    name: 'Workspace',
    href: '/workspace',
    icon: Layout
  },
  {
    name: 'Project Planning',
    href: '/project-planning',
    icon: Calendar
  },
  {
    name: 'Budget Planning',
    href: '/budget-planning',
    icon: BarChart2
  },
  {
    name: 'User Management',
    href: '/user-management',
    icon: Users
  },
  {
    name: 'Workspace Management',
    href: '/workspace-management',
    icon: Settings
  }
];

const Sidebar = () => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r overflow-y-auto transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center h-16 px-4 border-b">
        <button 
          onClick={toggleSidebar}
          className="flex items-center gap-3 hover:opacity-75 transition-opacity"
        >
          <Image
            src="/time.svg"
            alt="ChronoSpace Logo"
            width={32}
            height={32}
            className="min-w-[32px]"
          />
          {!isCollapsed && (
            <span className="font-semibold text-xl">ChronoSpace</span>
          )}
        </button>
      </div>
      
      <nav className="p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors",
                isCollapsed && "justify-center px-2",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 min-w-5",
                isActive && "text-blue-600"
              )} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar; 