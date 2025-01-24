import { Bell, Search } from 'lucide-react';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b flex items-center justify-between px-6 z-50">
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

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium">Irwan Phan</p>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
          <Image
            src="/avatar.jpg"
            alt="User avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      </div>
    </header>
  );
};

export default Header; 