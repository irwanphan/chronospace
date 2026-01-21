'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BudgetYear } from '@/types/budget-year';
import { Search, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import Pagination from '@/components/Pagination';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';

export default function BudgetYearPage() {
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
  const [filteredBudgetYears, setFilteredBudgetYears] = useState<BudgetYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBudgetYears = filteredBudgetYears.slice(startIndex, endIndex);

  const [searchKeyword, setSearchKeyword] = useState('');
  
  useEffect(() => {
    fetchBudgetYears();
  }, []);

  const fetchBudgetYears = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/workspace-management/budget-year');
      if (!response.ok) {
        throw new Error('Failed to fetch budget years');
      }
      const data = await response.json();
      setBudgetYears(Array.isArray(data) ? data : []);
      setFilteredBudgetYears(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch budget years:', error);
      setError('Failed to load budget years');
      setBudgetYears([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!budgetYears) return;

    let filtered = [...budgetYears];

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      filtered = filtered.filter(budgetYear => 
        budgetYear.year.toString().includes(keyword)
      );
    }

    setFilteredBudgetYears(filtered);
    setCurrentPage(1);
  }, [searchKeyword, budgetYears]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (togglingId) return; // Prevent multiple toggles
    
    setTogglingId(id);
    try {
      const response = await fetch(`/api/workspace-management/budget-year/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to toggle budget year status');
      }

      await fetchBudgetYears();
    } catch (error) {
      console.error('Error toggling budget year:', error);
      alert(error instanceof Error ? error.message : 'Failed to toggle budget year status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, year: number) => {
    if (!confirm(`Are you sure you want to delete budget year ${year}?`)) return;

    try {
      const response = await fetch(`/api/workspace-management/budget-year/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete budget year');
      }

      await fetchBudgetYears();
    } catch (error) {
      console.error('Error deleting budget year:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete budget year');
    }
  };

  if (isLoading) return <LoadingSpin />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Budget Year</h1>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search by year..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/workspace-management/budget-year/new"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Budget Year
          </Link>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center py-4 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <Card className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">#</th>
              <th className="text-left py-3 px-4">Year</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBudgetYears.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No budget years found
                </td>
              </tr>
            ) : (
              currentBudgetYears.map((budgetYear, index) => (
                <tr key={budgetYear.id} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="py-3 px-4">{startIndex + index + 1}</td>
                  <td className="py-3 px-4 font-medium">{budgetYear.year}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(budgetYear.id, budgetYear.isActive)}
                      disabled={togglingId === budgetYear.id}
                      className="flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {budgetYear.isActive ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-green-600" />
                          <span className="text-green-600 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-500">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(budgetYear.id, budgetYear.year)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete budget year"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      
      <Pagination
        currentPage={currentPage}
        totalItems={filteredBudgetYears.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
