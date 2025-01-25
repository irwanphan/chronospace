'use client';
import { useState } from 'react';
import { Search, Filter, MoreVertical, Plus } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  email: string;
}

const initialData: Vendor[] = [
  { id: 1, name: 'Store ITR', email: 'store.itr@example.com' },
  { id: 1, name: 'Store O2', email: 'store.o2@example.com' },
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(initialData);

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Vendor
          </button>
        </div>
      </div>

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
          {vendors.map((vendor) => (
            <tr key={vendor.email} className="border-b">
              <td className="py-3 px-4">{vendor.id}</td>
              <td className="py-3 px-4">{vendor.name}</td>
              <td className="py-3 px-4">{vendor.email}</td>
              <td className="py-3 px-4">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 