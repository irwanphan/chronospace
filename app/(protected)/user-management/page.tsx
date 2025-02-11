'use client';
import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreVertical, Pencil, Trash, Lock, Key } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const canCreateUser = session?.user?.access?.activityAccess?.createUser;
  const canEditUser = session?.user?.access?.activityAccess?.editUser;
  const canDeleteUser = session?.user?.access?.activityAccess?.deleteUser;
  const canManageUserAccess = session?.user?.access?.activityAccess?.manageUserAccess;

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
    <div className="max-w-7xl">
      <h1 className="text-2xl font-semibold mb-6">User Management</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
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
        </div>
        <div className="flex items-center gap-3">
        {canCreateUser && (
            <Link
              href="/user-management/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add User
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-600">#</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-600">User Name</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-600">Last Active</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-600">Date Added</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index:number) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm">{index + 1}</td>
                <td className="px-3 py-2">
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
                <td className="px-3 py-2 text-sm">{user.role}</td>
                <td className="px-3 py-2 text-sm">{formatDate(user.lastLogin)}</td>
                <td className="px-3 py-2 text-sm">{formatDate(user.createdAt)}</td>
                <td className="px-3 py-2 text-right">
                  <div className="relative overflow-visible">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === user.id.toString() ? null : user.id.toString())}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>

                    {activeMenu === user.id.toString() && (
                      <div className="absolute right-0 top-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg py-2 w-48 z-50">
                        {canEditUser && (
                          <button
                            onClick={() => router.push(`/user-management/${user.id}/edit`)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                        {canManageUserAccess && (
                          <button
                            onClick={() => router.push(`/user-management/${user.id}/access-control`)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Key className="w-4 h-4" />
                            Access Control
                          </button>
                        )}
                        {canDeleteUser && (
                          <button
                            onClick={() => handleDelete(user.id.toString())}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                        {
                          !canCreateUser && !canEditUser && !canDeleteUser && !canManageUserAccess && (
                            <div className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              No Access
                            </div>
                          )
                        }
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