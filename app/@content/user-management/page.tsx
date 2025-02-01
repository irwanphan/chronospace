'use client';
import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreVertical, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string | null;
  createdAt: string;
  image?: string;
}

export default function UserManagementPage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  const fetchUsers = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchUsers(); // Refresh list
          setActiveMenu(null); // Close popup
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <Link
          href="/user-management/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">User Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Last Active</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date Added</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm">{user.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{user.role}</td>
                <td className="px-6 py-4 text-sm">{formatDate(user.lastLogin)}</td>
                <td className="px-6 py-4 text-sm">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="relative">
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => setActiveMenu(activeMenu === user.id.toString() ? null : user.id.toString())}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {activeMenu === user.id.toString() && (
                      <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 min-w-[120px] z-10">
                        <button
                          onClick={() => router.push(`/user-management/${user.id}/edit`)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id.toString())}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <button className="px-3 py-1 rounded bg-blue-50 text-blue-600">1</button>
        <button className="px-3 py-1 rounded hover:bg-gray-50">2</button>
        <button className="px-3 py-1 rounded hover:bg-gray-50">3</button>
        <button className="px-3 py-1 rounded hover:bg-gray-50">4</button>
        <button className="px-3 py-1 rounded hover:bg-gray-50">5</button>
        <button className="px-3 py-1 rounded hover:bg-gray-50">6</button>
      </div>
    </div>
  );
} 