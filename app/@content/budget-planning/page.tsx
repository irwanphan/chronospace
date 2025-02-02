'use client';
import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MoreVertical, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Budget {
  id: string;
  title: string;
  year: number;
  division: string;
  totalBudget: number;
  startDate: string;
  finishDate: string;
  status: string;
  purchaseRequestStatus: string | null;
}

export default function BudgetPlanningPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalPlans: 0,
    completedPercentage: 0,
    upcomingDeadlines: 0,
    inProgress: 0,
    delayed: 0
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await fetch('/api/budgets');
        if (response.ok) {
          const data = await response.json();
          setBudgets(data);
          
          // Calculate stats
          const total = data.reduce((sum: number, budget: Budget) => sum + budget.totalBudget, 0);
          const completed = data.filter((b: Budget) => b.status === 'Completed').length;
          const inProgress = data.filter((b: Budget) => b.status === 'In Progress').length;
          const delayed = data.filter((b: Budget) => b.status === 'Delayed').length;
          
          setStats({
            totalBudget: total,
            totalPlans: data.length,
            completedPercentage: Math.round((completed / data.length) * 100),
            upcomingDeadlines: data.length,
            inProgress: inProgress,
            delayed: delayed
          });
        }
      } catch (error) {
        console.error('Error fetching budgets:', error);
      }
    };

    fetchBudgets();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get top 3 largest budgets
  const largestBudgets = [...budgets]
    .sort((a, b) => b.totalBudget - a.totalBudget)
    .slice(0, 3);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        const response = await fetch(`/api/budgets/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          router.refresh();
        } else {
          throw new Error('Failed to delete budget');
        }
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Budget Plans Overview</h1>
        <div className="flex items-center gap-2">
          <input type="month" defaultValue="2025-01" className="px-4 py-2 border rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Planned Budget</div>
          <div className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalBudget)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Number of Plans</div>
          <div className="text-2xl font-semibold mt-1">{stats.totalPlans} Plans</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Completed Plans Percentage</div>
          <div className="text-2xl font-semibold mt-1">{stats.completedPercentage}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Upcoming Deadlines</div>
          <div className="text-2xl font-semibold mt-1">{stats.upcomingDeadlines} Plans</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-6 bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Largest Budget Plans</h2>
          {largestBudgets.map((budget) => (
            <div key={budget.id} className="flex justify-between items-center mb-2">
              <div>{budget.title}</div>
              <div className="font-semibold">{formatCurrency(budget.totalBudget)}</div>
            </div>
          ))}
        </div>
        <div className="col-span-3 bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Plans in Progress</h2>
          <div className="text-2xl font-semibold">{stats.inProgress} Plans</div>
          <p className="text-sm text-gray-600 mt-2">Purchase Requests has been submitted</p>
        </div>
        <div className="col-span-3 bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Delayed Plans</h2>
          <div className="text-2xl font-semibold">{stats.delayed} Plans</div>
          <p className="text-sm text-gray-600 mt-2">Purchase Requests has not been submitted despite past Start Date</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
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
        <Link
          href="/budget-planning/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
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
                <td className="px-6 py-4 text-sm">{budget.division}</td>
                <td className="px-6 py-4 text-sm">{formatCurrency(budget.totalBudget)}</td>
                <td className="px-6 py-4 text-sm">{formatDate(budget.startDate)}</td>
                <td className="px-6 py-4 text-sm">{formatDate(budget.finishDate)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === budget.id ? null : budget.id)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>

                    {activeMenu === budget.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg py-2 w-36 z-50">
                        <button
                          onClick={() => router.push(`/budget-planning/${budget.id}/edit`)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
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