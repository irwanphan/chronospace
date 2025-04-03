'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { IconBrandMinecraft, IconBriefcaseFilled, IconCoins, IconId, IconLayoutDashboardFilled, IconStack2Filled, IconSubtask } from '@tabler/icons-react';

const Sidebar = () => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const { data: session, status } = useSession();
  const defaultAccess = {
    timeline: true,
    workspace: true,
    projectPlanning: true,
    budgetPlanning: true,
    userManagement: true,
    documents: true,
    workspaceManagement: true
  };

  const userAccess = session?.user?.access?.menuAccess || defaultAccess;

  if (status === "loading") {
    return (
      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="py-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 mx-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </aside>
    );
  }

  const navigation = [
    {
      name: 'Timeline',
      href: '/timeline',
      icon: IconLayoutDashboardFilled,
      show: userAccess.timeline
    },
    {
      name: 'Workspace',
      href: '/workspace',
      icon: IconStack2Filled,
      show: userAccess.workspace
    },
    {
      name: 'Project Planning',
      href: '/project-planning',
      icon: IconBriefcaseFilled,
      show: userAccess.projectPlanning
    },
    {
      name: 'Budget Planning',
      href: '/budget-planning',
      icon: IconCoins,
      show: userAccess.budgetPlanning
    },
    {
      name: 'User Management',
      href: '/user-management',
      icon: IconId,
      show: userAccess.userManagement
    },
    {
      name: 'Workspace Management',
      href: '/workspace-management',
      icon: IconSubtask,
      show: userAccess.workspaceManagement
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: IconBrandMinecraft,
      show: userAccess.documents
    }
  ].filter(item => item.show);

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
              src="/logo.svg"
              alt="ChronoSpace Logo"
              width={40}
              height={40}
            />
          </div>
          <span className={cn(
            "ml-3 font-semibold text-xl transition-all duration-300 flex-shrink-0 text-blue-600",
            isCollapsed ? "opacity-0 -translate-x-10" : "opacity-100 translate-x-0"
          )}>
            ChronoSpace
          </span>
        </button>
      </div>
      
      <nav className="py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (pathname.startsWith(item.href) && pathname.charAt(item.href.length) === '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "min-h-11 flex items-center w-full transition-colors px-4 py-3",
                isCollapsed ? "h-11" : "h-auto",
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
                "ml-3 transition-all duration-300 leading-tight",
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