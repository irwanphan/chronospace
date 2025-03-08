'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { stripHtmlTags } from '@/lib/utils';
import { Vendor } from '@/types/vendor';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';
import { Budget } from '@/types/budget';

interface FormData {
  projectId: string;
  title: string;
  year: string;
  workDivisionId: string;
  totalBudget: string;
  startDate: string;
  finishDate: string;
  description?: string;
}

interface BudgetItem {
  id?: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  vendor: Vendor;
}

export default function ViewBudgetPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<BudgetItem[]>([]);
  const [budgetPlan, setBudgetPlan] = useState<Budget>({} as Budget);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    projectId: '',
    title: '',
    year: '',
    workDivisionId: '',
    totalBudget: '',
    startDate: '',
    finishDate: '',
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/budget-planning/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();

        setBudgetPlan(data);
        setSelectedItems(data.items);
        setFormData({
          projectId: data.projectId,
          title: data.title,
          year: data.year.toString(),
          workDivisionId: data.workDivisionId,
          totalBudget: data.totalBudget.toString(),
          startDate: new Date(data.startDate).toISOString().split('T')[0],
          finishDate: new Date(data.finishDate).toISOString().split('T')[0],
          description: data.description || '',
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load budget data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    setFormData(prev => ({
      ...prev,
      totalBudget: total.toString()
    }));
  }, [selectedItems]);

  if (isLoading) return <LoadingSpin />

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Budget Plan</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <Card className="p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-1.5">
                Project <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={budgetPlan.project.projectTitle}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                disabled
              />
            </div>

            <div>
              <label className="block mb-1.5">
                Division <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={budgetPlan.workDivision.divisionName}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                disabled
              />
            </div>

            <div>
              <label className="block mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-1.5">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.year}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-1.5">
                Finish Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.finishDate}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5">Description</label>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              {stripHtmlTags(formData.description || '')}
            </div>
          </div>

          <h2 className="text-lg font-medium mt-6 mb-4">Item List</h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Qty</th>
                  <th className="text-left p-2">Unit</th>
                  <th className="text-right p-2">Unit Price</th>
                  <th className="text-right p-2">Total Price</th>
                  <th className="text-left p-2">Vendor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{item.description}</td>
                    <td className="p-2">{item.qty}</td>
                    <td className="p-2">{item.unit}</td>
                    <td className="p-2 text-right">{new Intl.NumberFormat('id-ID').format(item.unitPrice)}</td>
                    <td className="p-2 text-right">{new Intl.NumberFormat('id-ID').format(item.qty * item.unitPrice)}</td>
                    <td className="p-2">{item.vendor.vendorName}</td>
                    <td className="p-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedItems.length === 0 && (
              <div className="text-gray-500 text-sm mt-4">
                No items selected
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-1.5">
                Total Budget <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={new Intl.NumberFormat('id-ID').format(Number(formData.totalBudget))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Link
              href="/budget-planning"
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Back
            </Link>
            <button
              type="button"
              onClick={() => router.push(`/budget-planning/${params.id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              Edit
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
} 