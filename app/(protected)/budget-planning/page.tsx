'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useSession } from 'next-auth/react';
import { Plus, Filter, Search } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Budget } from '@/types/budget';
import { WorkDivision } from '@/types/workDivision';
import BudgetActions from './components/BudgetActions';

export default function BudgetPlanningPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [divisions, setDivisions] = useState<WorkDivision[]>([]);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalPlans: 0,
    completedPercentage: 0,
    upcomingDeadlines: 0,
    inProgress: 0,
    delayed: 0
  });

  const { data: session, status } = useSession();
  const canEditBudget = status === 'authenticated' && session?.user.access.activityAccess.editBudget || false;
  const canDeleteBudget = status === 'authenticated' && session?.user.access.activityAccess.deleteBudget || false;
  const canCreateBudget = status === 'authenticated' && session?.user.access.activityAccess.createBudget || false;
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/budget-planning');
      if (response.ok) {
        const data = await response.json();
        setBudgets(data.budgets);
        setDivisions(data.divisions);
        
        // Calculate stats
        const total = data.budgets.reduce((sum: number, budget: Budget) => sum + budget.totalBudget, 0);
        const completed = data.budgets.filter((b: Budget) => b.status === 'Completed').length;
        const inProgress = data.budgets.filter((b: Budget) => b.status === 'In Progress').length;
        const delayed = data.budgets.filter((b: Budget) => {
          const startDate = new Date(b.startDate);
          const today = new Date();
          return startDate < today && b.status === 'Not Started';
        }).length;
        const upcoming = data.budgets.filter((b: Budget) => {
          const finishDate = new Date(b.finishDate);
          const today = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(today.getDate() + 30);
          return finishDate <= thirtyDaysFromNow && finishDate >= today;
        }).length;
        
        setStats({
          totalBudget: total,
          totalPlans: data.budgets.length,
          completedPercentage: data.budgets.length > 0 ? Math.round((completed / data.budgets.length) * 100) : 0,
          upcomingDeadlines: upcoming,
          inProgress: inProgress,
          delayed: delayed
        });
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Get top 3 largest budgets
  const largestBudgets = [...budgets]
    .sort((a, b) => b.totalBudget - a.totalBudget)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Budget Plans Overview</h1>
        <div className="flex items-center gap-2">
          <input type="month" defaultValue="2025-01" className="px-4 py-2 border rounded-lg" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Total Planned Budget</div>
            <div className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalBudget)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Number of Plans</div>
            <div className="text-2xl font-semibold mt-1">{stats.totalPlans} Plans</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Completed Plans Percentage</div>
            <div className="text-2xl font-semibold mt-1">{stats.completedPercentage}%</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600">Upcoming Deadlines</div>
            <div className="text-2xl font-semibold mt-1">{stats.upcomingDeadlines} Plans</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6 bg-white p-4 rounded-lg shadow border border-gray-200">
            <h2 className="font-semibold mb-4">Largest Budget Plans</h2>
            {largestBudgets.map((budget) => (
              <div key={budget.id} className="flex justify-between items-center mb-2">
                <div>{budget.title}</div>
                <div className="font-semibold">{formatCurrency(budget.totalBudget)}</div>
              </div>
            ))}
          </div>
          <div className="col-span-3 bg-white p-4 rounded-lg shadow border border-gray-200">
            <h2 className="font-semibold mb-4">Plans in Progress</h2>
            <div className="text-2xl font-semibold">{stats.inProgress} Plans</div>
            <p className="text-sm text-gray-600 mt-2">Purchase Requests has been submitted</p>
          </div>
          <div className="col-span-3 bg-white p-4 rounded-lg shadow border border-gray-200">
            <h2 className="font-semibold mb-4">Delayed Plans</h2>
            <div className="text-2xl font-semibold">{stats.delayed} Plans</div>
            <p className="text-sm text-gray-600 mt-2">Purchase Requests has not been submitted despite past Start Date</p>
          </div>
        </div>
      </div>

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
              Add Plan
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">#</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Year</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Division</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Total Budget</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Start Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Finish Date</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {budgets.map((budget, index) => (
              <tr key={budget.id}>
                <td className="px-6 py-4 text-sm">{index + 1}</td>
                <td className="px-6 py-4 text-sm">{budget.title}</td>
                <td className="px-6 py-4 text-sm">{budget.year}</td>
                <td className="px-6 py-4 text-sm">{divisions.find(d => d.id === budget.workDivisionId)?.divisionName}</td>
                <td className="px-6 py-4 text-sm">{formatCurrency(budget.totalBudget)}</td>
                <td className="px-6 py-4 text-sm">{formatDate(budget.startDate)}</td>
                <td className="px-6 py-4 text-sm">{formatDate(budget.finishDate)}</td>
                <td className="px-6 py-4 text-right">
                  <BudgetActions 
                    budgetId={budget.id}
                    canEditBudget={canEditBudget ?? false}
                    canDeleteBudget={canDeleteBudget ?? false}
                    onDelete={async () => {
                      const budgetsRes = await fetch('/api/budget-planning');
                      const data = await budgetsRes.json();
                      setBudgets(data.budgets);
                      setDivisions(data.divisions);
                    }} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <button className="px-3 py-1 rounded bg-blue-50 text-blue-600">1</button>
        <button className="px-3 py-1 rounded hover:bg-gray-50">2</button>
        <button className="px-3 py-1 rounded hover:bg-gray-50">3</button>
      </div>
    </div>
  );
} 