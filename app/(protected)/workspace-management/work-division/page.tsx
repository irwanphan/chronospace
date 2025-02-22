'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, MoreVertical, Plus, Pencil, Trash, Eye } from 'lucide-react';

import { WorkDivision } from '@/types/workDivision';
import { User } from '@/types/user';
import { stripHtmlTags } from '@/lib/utils';

export default function WorkDivisionPage() {
  const [divisions, setDivisions] = useState<WorkDivision[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/workspace-management/work-division');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setDivisions(data.divisions);
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data');
      setDivisions([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this work division?')) {
      try {
        const response = await fetch(`/api/workspace-management/work-division/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchData();
          setActiveMenu(null);
        }
      } catch (error) {
        console.error('Failed to delete work division:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Work Division</h1>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/workspace-management/work-division/new"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Work Division
          </Link>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">#</th>
              <th className="text-left py-3 px-4">Division Code</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-left py-3 px-4">Division Head</th>
              <th className="text-left py-3 px-4 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">Loading...</td>
              </tr>
            ) : divisions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No work divisions found
                </td>
              </tr>
            ) : (
              divisions.map((division, index) => (
                <tr key={division.id} className="border-b">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{division.divisionCode}</td>
                  <td className="py-3 px-4">{division.divisionName}</td>
                  <td className="py-3 px-4">
                    {stripHtmlTags(division.description)}
                  </td>
                  <td className="py-3 px-4">
                    {users.find(user => user.id === division.divisionHead)?.name || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative flex items-center gap-2">
                      <Link
                        href={`/workspace-management/work-division/${division.id}`}
                        className="p-1 cursor-pointer w-6 h-6 hover:bg-gray-100 rounded-full"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button 
                        className="p-1 cursor-pointer w-6 h-6 hover:bg-gray-100 rounded-full"
                        onClick={() => setActiveMenu(activeMenu === division.id ? null : division.id)}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {/* Popup Menu */}
                      {activeMenu === division.id && (
                        <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 min-w-[120px] z-10">
                          <button
                            onClick={() => router.push(`/workspace-management/work-division/${division.id}/edit`)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(division.id)}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 