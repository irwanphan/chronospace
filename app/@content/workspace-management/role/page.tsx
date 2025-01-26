'use client';
import { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Plus } from 'lucide-react';
import Link from 'next/link';
import { Role } from '@/types/role';

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/roles');
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data = await response.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setError('Failed to load roles');
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <Link
            href="/workspace-management/role/new"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </Link>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">#</th>
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">Description</th>
            <th className="text-left py-3 px-4">Approval Limit</th>
            <th className="text-left py-3 px-4 w-16"></th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="text-center py-4">Loading...</td>
            </tr>
          ) : roles.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                No roles found
              </td>
            </tr>
          ) : (
            roles.map((role, index) => (
              <tr key={role.id} className="border-b">
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">{role.roleName}</td>
                <td className="py-3 px-4">
                  {role.description || '-'}
                </td>
                <td className="py-3 px-4">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(role.approvalLimit)}
                </td>
                <td className="py-3 px-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 