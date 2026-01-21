'use client';
import { useState, useEffect } from 'react';
import { BudgetYear } from '@/types/budget-year';
import { Calendar, Sparkles, Zap, CheckCircle2, XCircle, Save, RotateCcw } from 'lucide-react';
import Card from '@/components/ui/Card';

interface BudgetYearRangeSelectorProps {
  budgetYears: BudgetYear[];
  onRangeUpdate: (startYear: number, endYear: number) => Promise<void>;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
}

// Helper function to update individual years
async function updateIndividualYears(activeYears: number[]): Promise<void> {
  const response = await fetch('/api/workspace-management/budget-year/bulk-update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ activeYears }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update budget years');
  }
}

export default function BudgetYearRangeSelector({
  budgetYears,
  onRangeUpdate,
  onRefresh,
  isLoading = false,
}: BudgetYearRangeSelectorProps) {
  // Track which years are active in local state (for preview before saving)
  const [localActiveYears, setLocalActiveYears] = useState<Set<number>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Sort years
  const sortedYears = [...budgetYears].sort((a, b) => a.year - b.year);
  const minYear = sortedYears[0]?.year || new Date().getFullYear() - 5;
  const maxYear = sortedYears[sortedYears.length - 1]?.year || new Date().getFullYear() + 5;

  // Initialize local state from budgetYears
  useEffect(() => {
    const activeSet = new Set(
      budgetYears.filter(by => by.isActive).map(by => by.year)
    );
    setLocalActiveYears(activeSet);
    setHasChanges(false);
  }, [budgetYears]);

  // Get active years range for display
  const activeYearsArray = Array.from(localActiveYears).sort((a, b) => a - b);
  const currentActiveStart = activeYearsArray.length > 0 ? activeYearsArray[0] : null;
  const currentActiveEnd = activeYearsArray.length > 0 ? activeYearsArray[activeYearsArray.length - 1] : null;

  // Toggle individual year
  const handleToggleYear = (year: number) => {
    if (isLoading) return;
    
    const newActiveYears = new Set(localActiveYears);
    if (newActiveYears.has(year)) {
      newActiveYears.delete(year);
    } else {
      newActiveYears.add(year);
    }
    
    setLocalActiveYears(newActiveYears);
    
    // Check if there are changes
    const originalActive = new Set(
      budgetYears.filter(by => by.isActive).map(by => by.year)
    );
    const hasChanged = 
      newActiveYears.size !== originalActive.size ||
      Array.from(newActiveYears).some(y => !originalActive.has(y)) ||
      Array.from(originalActive).some(y => !newActiveYears.has(y));
    
    setHasChanges(hasChanged);
  };

  // Check if year is active in local state
  const isYearActive = (year: number) => {
    return localActiveYears.has(year);
  };

  // Handle apply changes
  const handleApplyChanges = async () => {
    if (activeYearsArray.length === 0) {
      if (!confirm('No years will be active. Are you sure you want to deactivate all years?')) {
        return;
      }
    }

    try {
      await updateIndividualYears(activeYearsArray);
      if (onRefresh) {
        await onRefresh();
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating budget years:', error);
      alert(error instanceof Error ? error.message : 'Failed to update budget years');
    }
  };

  // Handle reset to original
  const handleReset = () => {
    const originalActive = new Set(
      budgetYears.filter(by => by.isActive).map(by => by.year)
    );
    setLocalActiveYears(originalActive);
    setHasChanges(false);
  };

  // Quick actions
  const handleQuickAction = async (action: 'activate-all' | 'deactivate-all') => {
    if (action === 'activate-all') {
      const allYears = new Set(sortedYears.map(by => by.year));
      setLocalActiveYears(allYears);
      setHasChanges(true);
    } else if (action === 'deactivate-all') {
      setLocalActiveYears(new Set());
      setHasChanges(true);
    }
  };

  // Select range (shift click for range selection)
  const handleRangeSelect = (startYear: number, endYear: number) => {
    const newActiveYears = new Set(localActiveYears);
    const min = Math.min(startYear, endYear);
    const max = Math.max(startYear, endYear);
    
    for (let year = min; year <= max; year++) {
      if (sortedYears.some(by => by.year === year)) {
        newActiveYears.add(year);
      }
    }
    
    setLocalActiveYears(newActiveYears);
    setHasChanges(true);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Years Manager</h3>
            <p className="text-sm text-gray-500">Click on years to toggle active/inactive status</p>
          </div>
        </div>
        {currentActiveStart && currentActiveEnd && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {activeYearsArray.length} year{activeYearsArray.length !== 1 ? 's' : ''} active
              {activeYearsArray.length > 0 && ` (${currentActiveStart} - ${currentActiveEnd})`}
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => handleQuickAction('activate-all')}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4" />
          Activate All
        </button>
        <button
          onClick={() => handleQuickAction('deactivate-all')}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle className="w-4 h-4" />
          Deactivate All
        </button>
        {hasChanges && (
          <>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleApplyChanges}
              disabled={isLoading || activeYearsArray.length === 0}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Click individual years to toggle active/inactive</span>
          {hasChanges && (
            <span className="ml-auto font-medium text-orange-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              Unsaved changes
            </span>
          )}
        </div>
        
        <div className="relative p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 overflow-x-auto">
          <div className="flex items-center gap-3 min-w-max">
            {sortedYears.map((budgetYear, index) => {
              const isActive = isYearActive(budgetYear.year);
              const isFirst = index === 0;
              const isLast = index === sortedYears.length - 1;
              const nextYear = sortedYears[index + 1];
              const isNextActive = nextYear ? isYearActive(nextYear.year) : false;
              
              return (
                <div key={budgetYear.id} className="flex items-center">
                  <button
                    onClick={() => handleToggleYear(budgetYear.year)}
                    disabled={isLoading}
                    className={`
                      relative group flex flex-col items-center justify-center
                      w-20 h-24 rounded-xl transition-all duration-200 transform
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${isActive
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-105 hover:scale-110 z-10'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-105'
                      }
                    `}
                    title={`Click to ${isActive ? 'deactivate' : 'activate'} ${budgetYear.year}`}
                  >
                    {/* Year label */}
                    <span className={`text-sm font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {budgetYear.year}
                    </span>
                    
                    {/* Checkbox indicator */}
                    <div className={`
                      w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                      ${isActive
                        ? 'bg-white border-white'
                        : 'bg-transparent border-gray-400'
                      }
                    `}>
                      {isActive && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white shadow-md animate-pulse" />
                    )}
                    
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-20">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                      </div>
                    </div>
                  </button>
                  
                  {/* Connector line */}
                  {!isLast && (
                    <div className={`
                      w-6 h-1 transition-all duration-200
                      ${isActive && isNextActive
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : isActive || isNextActive
                        ? 'bg-gradient-to-r from-green-400 to-gray-300'
                        : 'bg-gray-300'
                      }
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg border-2 border-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">Active Year</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-lg"></div>
            <span>Inactive Year</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Active Indicator</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
