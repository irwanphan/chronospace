'use client';
import { Calendar, Users, BarChart2, Settings, Layout, Clock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
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
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r overflow-y-auto pt-16 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <button 
        onClick={toggleSidebar}
        className="absolute right-4 top-5 p-1.5 rounded-lg hover:bg-gray-100"
      >
        <ChevronLeft className={cn(
          "w-5 h-5 transition-transform duration-300",
          isCollapsed && "rotate-180"
        )} />
      </button>
      
      <nav className="p-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mb-1 transition-colors",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className="w-5 h-5 min-w-5" />
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 