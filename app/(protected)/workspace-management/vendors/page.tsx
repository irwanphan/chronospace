'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import VendorActions from './components/VendorActions';
import { Vendor } from '@/types/vendor';
import { Search, Plus } from 'lucide-react';
import Pagination from '@/components/Pagination';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVendors = filteredVendors.slice(startIndex, endIndex);

  const [searchKeyword, setSearchKeyword] = useState('');
  
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/workspace-management/vendors');
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      const data = await response.json();
      // Memastikan data adalah array
      setVendors(Array.isArray(data) ? data : []);
      setFilteredVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      setError('Failed to load vendors');
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!vendors) return;

    let filtered = [...vendors];

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      filtered = filtered.filter(vendor => 
        vendor.vendorName?.toLowerCase().includes(keyword) ||
        vendor.email?.toLowerCase().includes(keyword)
      );
    }

    setFilteredVendors(filtered);
    setCurrentPage(1);
  }, [searchKeyword, vendors]);

  if (isLoading) return <LoadingSpin />

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Vendors</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
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

      <Card className="mb-8">
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
            ) : filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No vendors found
                </td>
              </tr>
            ) : (
              currentVendors.map((vendor, index) => (
                <tr key={vendor.id} className="border-b hover:bg-blue-50">
                  <td className="py-3 px-4">{startIndex + index + 1}</td>
                  <td className="py-3 px-4">{vendor.vendorName}</td>
                  <td className="py-3 px-4">{vendor.email}</td>
                  <td className="py-3 px-4">
                    <VendorActions 
                      vendorId={vendor.id} 
                      onDelete={async () => {
                        const vendorsRes = await fetch('/api/workspace-management/vendors');
                        const vendorsData = await vendorsRes.json();
                        setVendors(vendorsData);
                      }} 
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      <Pagination
        currentPage={currentPage}
        totalItems={filteredVendors.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 