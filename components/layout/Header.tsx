'use client';
import { Bell, Search, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSidebarStore } from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';

const getInitials = (name: string) => {
  const words = name.split(' ');
  return words.length > 1 
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : words[0][0].toUpperCase();
};

const Header = () => {
  const { isCollapsed } = useSidebarStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session, status } = useSession();
  const userImage = session?.user?.image || "";
  const userName = session?.user?.name || "Guest";
  const userRole = session?.user?.role || "User";

  return (
    <header className={cn(
      "fixed top-0 right-0 h-16 bg-white border-b flex items-center justify-between px-6 z-30 transition-all duration-300",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Your Timeline</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span>Timeline</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            2
          </span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
          >
            {userImage ? (
              <Image
                src={userImage}
                alt="User avatar"
                width={40}
                height={40}
                className="rounded-full overflow-hidden bg-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                {getInitials(userName)}
              </div>
            )}
            <div className="text-left">
              {status === "loading" ? (
                <>
                  <div className="h-5 w-24 bg-gray-300 rounded animate-pulse mb-1"></div>
                  <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-gray-500">{userRole}</p>
                </>
              )}
            </div>
          </button>

          {/* User Menu Popup */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <Link 
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <button 
                onClick={() => {
                  signOut({ callbackUrl: '/login' });
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 