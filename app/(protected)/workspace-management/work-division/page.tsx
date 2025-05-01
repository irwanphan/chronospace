'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import DivisionActions from './components/DivisionActions';
import { WorkDivision } from '@/types/work-division';
import { stripHtmlTags } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';

export default function WorkDivisionPage() {
  const [divisions, setDivisions] = useState<WorkDivision[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<WorkDivision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDivisions = filteredDivisions?.slice(startIndex, endIndex) || [];

  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/workspace-management/work-division');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const workDivisions = data.workDivisions || [];
        setDivisions(workDivisions);
        setFilteredDivisions(workDivisions);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load data');
        setDivisions([]);
        setFilteredDivisions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Apply filters when searchKeyword changes
  useEffect(() => {
    if (!divisions) return;

    let filtered = [...divisions];

    // Filter by search keyword
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      filtered = filtered.filter(division => 
        division.name?.toLowerCase().includes(keyword) ||
        division.code?.toLowerCase().includes(keyword) ||
        division.description?.toLowerCase().includes(keyword) ||
        division.head?.name?.toLowerCase().includes(keyword)
      );
    }

    setFilteredDivisions(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchKeyword, divisions]);

  if (isLoading) return <LoadingSpin />

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Work Division</h1>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search by name, code, or division head..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
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

      <Card className="mb-8">
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
            ) : filteredDivisions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  {searchKeyword.trim() 
                    ? `No divisions found matching "${searchKeyword}"`
                    : "No work divisions found"}
                </td>
              </tr>
            ) : (
              currentDivisions.map((division, index) => (
                <tr key={division.id} className="border-b hover:bg-blue-50">
                  <td className="py-3 px-4">{startIndex + index + 1}</td>
                  <td className="py-3 px-4">{division.code}</td>
                  <td className="py-3 px-4">{division.name}</td>
                  <td className="py-3 px-4">
                    {stripHtmlTags(division.description)}
                  </td>
                  <td className="py-3 px-4">
                    {division.head?.name || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <DivisionActions 
                      workDivisionId={division.id} 
                      onDelete={async () => {
                        const divisionsRes = await fetch('/api/workspace-management/work-division');
                        const divisionsData = await divisionsRes.json();
                        const newDivisions = divisionsData.workDivisions || [];
                        setDivisions(newDivisions);
                        setFilteredDivisions(newDivisions);
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
        totalItems={filteredDivisions.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 