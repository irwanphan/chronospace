'use client';
import { useEffect, useState, useRef } from 'react';
import { BudgetYear } from '@/types/budget-year';
import { Search, Edit, ToggleLeft, ToggleRight, Trash2, Save, X } from 'lucide-react';
import Pagination from '@/components/Pagination';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';
import BudgetYearRangeSelector from '@/components/BudgetYearRangeSelector';
import { Dialog } from '@/components/ui/Dialog';

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
  const [isRangeUpdating, setIsRangeUpdating] = useState(false);
  const [isEditRangeModalOpen, setIsEditRangeModalOpen] = useState(false);
  const [fromYear, setFromYear] = useState<number | ''>('');
  const [toYear, setToYear] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const rangeSelectorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetchBudgetYears();
  }, []);

  useEffect(() => {
    // Set initial from/to values based on active years
    if (budgetYears.length > 0 && isEditRangeModalOpen) {
      const activeYears = budgetYears.filter(by => by.isActive).map(by => by.year);
      if (activeYears.length > 0) {
        setFromYear(Math.min(...activeYears));
        setToYear(Math.max(...activeYears));
      } else {
        const sortedYears = [...budgetYears].sort((a, b) => a.year - b.year);
        setFromYear(sortedYears[0]?.year || '');
        setToYear(sortedYears[sortedYears.length - 1]?.year || '');
      }
    }
  }, [budgetYears, isEditRangeModalOpen]);

  const handleOpenEditRangeModal = () => {
    setIsEditRangeModalOpen(true);
  };

  const handleCloseEditRangeModal = () => {
    setIsEditRangeModalOpen(false);
    setFromYear('');
    setToYear('');
  };

  const handleSaveRange = async () => {
    if (!fromYear || !toYear) {
      alert('Please fill in both From and To years');
      return;
    }

    if (typeof fromYear !== 'number' || typeof toYear !== 'number') {
      alert('Years must be valid numbers');
      return;
    }

    if (fromYear > toYear) {
      alert('From year must be less than or equal to To year');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/workspace-management/budget-year/bulk-range', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startYear: fromYear,
          endYear: toYear,
          action: 'activate',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update budget year range');
      }

      await fetchBudgetYears();
      handleCloseEditRangeModal();
    } catch (error) {
      console.error('Error updating budget year range:', error);
      alert(error instanceof Error ? error.message : 'Failed to update budget year range');
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleRangeUpdate = async (startYear: number, endYear: number) => {
    setIsRangeUpdating(true);
    try {
      const response = await fetch('/api/workspace-management/budget-year/bulk-range', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startYear,
          endYear,
          action: 'activate',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update budget year range');
      }

      await fetchBudgetYears();
    } catch (error) {
      console.error('Error updating budget year range:', error);
      alert(error instanceof Error ? error.message : 'Failed to update budget year range');
    } finally {
      setIsRangeUpdating(false);
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
          <button
            onClick={handleOpenEditRangeModal}
            className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <Edit className="w-4 h-4" />
            Edit Budget Years Range
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center py-4 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Range Selector Component */}
      {budgetYears.length > 0 && (
        <div ref={rangeSelectorRef}>
          <BudgetYearRangeSelector
            budgetYears={budgetYears}
            onRangeUpdate={handleRangeUpdate}
            onRefresh={fetchBudgetYears}
            isLoading={isRangeUpdating}
          />
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

      {/* Edit Range Modal */}
      <Dialog open={isEditRangeModalOpen} onOpenChange={setIsEditRangeModalOpen}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Budget Years Range</h2>
            <button
              onClick={handleCloseEditRangeModal}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Set the range of years that can be activated or deactivated. Years outside this range will be automatically deactivated.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fromYear" className="block text-sm font-medium text-gray-700 mb-2">
                  From Year
                </label>
                <input
                  id="fromYear"
                  type="number"
                  value={fromYear}
                  onChange={(e) => setFromYear(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="e.g., 2020"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  min={1900}
                  max={2100}
                />
              </div>

              <div>
                <label htmlFor="toYear" className="block text-sm font-medium text-gray-700 mb-2">
                  To Year
                </label>
                <input
                  id="toYear"
                  type="number"
                  value={toYear}
                  onChange={(e) => setToYear(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="e.g., 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  min={1900}
                  max={2100}
                />
              </div>
            </div>

            {fromYear && toYear && fromYear > toYear && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">
                  From year must be less than or equal to To year
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={handleCloseEditRangeModal}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRange}
                disabled={isSaving || !fromYear || !toYear || fromYear > toYear}
                className="flex items-center gap-2 px-6 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Range</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
