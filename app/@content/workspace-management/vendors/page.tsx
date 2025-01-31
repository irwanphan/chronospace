'use client';
import { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Plus, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { Vendor } from '@/types/vendor';
import { useRouter } from 'next/navigation';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vendors');
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      const data = await response.json();
      // Memastikan data adalah array
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      setError('Failed to load vendors');
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        const response = await fetch(`/api/vendors/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error('Failed to delete vendor:', error);
      }
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
            href="/workspace-management/vendors/new"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Vendor
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
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-left py-3 px-4 w-16"></th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={4} className="text-center py-4">Loading...</td>
            </tr>
          ) : vendors.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                No vendors found
              </td>
            </tr>
          ) : (
            vendors.map((vendor, index) => (
              <tr key={vendor.id} className="border-b">
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">{vendor.vendorName}</td>
                <td className="py-3 px-4">{vendor.email}</td>
                <td className="py-3 px-4">
                  <button 
                    className="p-1 hover:bg-gray-100 rounded relative"
                    onClick={() => setActiveMenu(activeMenu === vendor.id ? null : vendor.id)}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                    
                    {/* Popup Menu */}
                    {activeMenu === vendor.id && (
                      <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 min-w-[120px] z-10">
                        <button
                          onClick={() => router.push(`/workspace-management/vendors/${vendor.id}/edit`)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
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