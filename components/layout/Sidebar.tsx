'use client';
import { Calendar, Users, BarChart2, Settings, Clock, LayoutDashboard } from 'lucide-react';
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
    icon: LayoutDashboard
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
      "fixed left-0 top-0 h-screen bg-white border-r overflow-hidden transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="h-16 border-b flex items-center">
        <button 
          onClick={toggleSidebar}
          className="w-full h-full flex items-center px-4"
        >
          <div className="w-8 h-8 flex-shrink-0">
            <Image
              src="/time.svg"
              alt="ChronoSpace Logo"
              width={32}
              height={32}
            />
          </div>
          <span className={cn(
            "ml-3 font-semibold text-xl transition-all duration-300 flex-shrink-0",
            isCollapsed ? "opacity-0 -translate-x-10" : "opacity-100 translate-x-0"
          )}>
            ChronoSpace
          </span>
        </button>
      </div>
      
      <nav className="py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "h-11 flex items-center w-full transition-colors",
                isCollapsed ? "px-4" : "px-4",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive && "text-blue-600"
                )} />
              </div>
              <span className={cn(
                "ml-3 transition-all duration-300 flex-shrink-0",
                isCollapsed ? "opacity-0 -translate-x-10" : "opacity-100 translate-x-0"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar; 