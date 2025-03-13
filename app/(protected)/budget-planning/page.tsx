'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useSession } from 'next-auth/react';
import { Plus, Filter, Search } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Budget } from '@/types/budget';
import BudgetActions from './components/BudgetActions';
import { calculateBudgetStats } from '@/lib/helpers';
import Pagination from '@/components/Pagination';
import BudgetStatsOverview from './components/BudgetStatsOverview';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';

export default function BudgetPlanningPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalPlans: 0,
    completedPercentage: 0,
    upcomingDeadlines: 0,
    inProgress: 0,
    delayed: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBudgets = budgets.slice(startIndex, endIndex);

  const { data: session, status } = useSession();
  const canEditBudget = status === 'authenticated' && session?.user.access.activityAccess.editBudget || false;
  const canDeleteBudget = status === 'authenticated' && session?.user.access.activityAccess.deleteBudget || false;
  const canCreateBudget = status === 'authenticated' && session?.user.access.activityAccess.createBudget || false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/budget-planning');
        if (response.ok) {
          const data = await response.json();
          setBudgets(data.budgets);
          setStats(calculateBudgetStats(data.budgets));
        }
      } catch (error) {
        console.error('Error fetching budgets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <LoadingSpin />

  // Get top 3 largest budgets
  const largestBudgets = [...budgets]
    .sort((a, b) => b.totalBudget - a.totalBudget)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Budget Plans Overview</h1>
      </div>

      <BudgetStatsOverview 
        stats={stats}
        largestBudgets={largestBudgets}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 border border-gray-200 rounded-lg">
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
          {status === 'authenticated' && canCreateBudget && (
            <Link
              href="/budget-planning/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Budget Plan
            </Link>
          )}
        </div>
      </div>

      <Card className="mb-8 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Work Division</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Total Budget</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Start Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Finish Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentBudgets.map((budget, index) => (
              <tr key={budget.id} className="hover:bg-blue-50">
                <td className="px-6 py-4 text-sm">{startIndex + index + 1}</td>
                <td className="px-6 py-4 text-sm">{budget.title}</td>
                <td className="px-6 py-4 text-sm">{budget.workDivision.name}</td>
                <td className="px-6 py-4 text-sm">{formatCurrency(budget.totalBudget)}</td>
                <td className="px-6 py-4 text-sm">{formatDate(budget.startDate)}</td>
                <td className="px-6 py-4 text-sm">{formatDate(budget.finishDate)}</td>
                <td className="px-6 py-4 text-sm">{budget.status}</td>
                <td className="px-6 py-4 text-right">
                  <BudgetActions 
                    budgetId={budget.id}
                    canEditBudget={canEditBudget ?? false}
                    canDeleteBudget={canDeleteBudget ?? false}
                    budgetStatus={budget.status}
                    onDelete={async () => {
                      const response = await fetch('/api/budget-planning');
                      const data = await response.json();
                      setBudgets(data.budgets);
                      setStats(calculateBudgetStats(data.budgets));
                    }} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalItems={budgets.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 