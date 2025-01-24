import { Calendar, Users, BarChart2, Settings, Layout, Clock } from 'lucide-react';
import Link from 'next/link';

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
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r pt-16">
      <nav className="p-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mb-1 transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 