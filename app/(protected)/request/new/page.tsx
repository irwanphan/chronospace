'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import { formatDate } from '@/lib/utils';

interface BudgetPlan {
  id: string;
  title: string;
  projectId: string;
  project: {
    projectCode: string;
    projectTitle: string;
  };
  items: BudgetItem[];
}

interface BudgetItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  vendor: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [selectedItems, setSelectedItems] = useState<BudgetItem[]>([]);
  const [availableItems, setAvailableItems] = useState<BudgetItem[]>([]);
  console.log(budgetPlans)
  const [formData, setFormData] = useState({
    requestCategory: 'Purchase Request',
    budgetId: '',
    projectId: '',
    title: '',
    description: '',
    items: [],
  });

  const [requestInfo, setRequestInfo] = useState({
    id: '',
    requestDate: new Date(),
    requestor: '',
    workDivision: ''
  });

  // Fetch budget plans
  useEffect(() => {
    const fetchBudgetPlans = async () => {
      try {
        const response = await fetch('/api/budgets');
        if (response.ok) {
          const data = await response.json();
          setBudgetPlans(data);
        }
      } catch (error) {
        console.error('Error fetching budget plans:', error);
      }
    };

    fetchBudgetPlans();
  }, []);

  useEffect(() => {
    const generateRequestId = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 9000 + 1000);
      return `${year}${month}${day}${random}`;
    };

    // Dalam implementasi nyata, data ini bisa diambil dari context/session user
    setRequestInfo({
      id: generateRequestId(),
      requestDate: new Date(),
      requestor: 'Nam Do San', // Ganti dengan data user aktif
      workDivision: 'Engineering' // Ganti dengan data user aktif
    });
  }, []);

  // Update project and items when budget is selected
  const handleBudgetChange = (budgetId: string) => {
    const selectedBudget = budgetPlans.find(budget => budget.id === budgetId);
    if (selectedBudget) {
      setFormData(prev => ({
        ...prev,
        budgetId,
        projectId: selectedBudget.projectId,
        title: selectedBudget.title,
      }));
      setAvailableItems(selectedBudget.items);
    }
  };

  // Handle item selection and quantity/price updates
  const handleAddItem = () => {
    if (availableItems.length === 0) return;
    
    const newItem = {
      ...availableItems[0],
      requestQty: 0,
      requestPrice: availableItems[0].unitPrice,
    };

    setSelectedItems([...selectedItems, newItem]);
  };

  const handleItemChange = (index: number, field: string, value: number) => {
    const updatedItems = [...selectedItems];
    const originalItem = availableItems.find(
      item => item.id === selectedItems[index].id
    );

    if (field === 'requestQty' && originalItem) {
      // Validate quantity doesn't exceed budget
      value = Math.min(value, originalItem.qty);
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setSelectedItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: selectedItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      router.push('/workspace');
      router.refresh();
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">New Request</h1>
      
      {/* Request Info Card */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200 bg-white">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-500">
              ID: <span className="font-semibold text-gray-900">{requestInfo.id}</span>
            </div>
            <div className="text-sm text-gray-500">
              Requestor: <span className="font-semibold text-gray-900">{requestInfo.requestor}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-500">
              Request Date: <span className="font-semibold text-gray-900">{formatDate(requestInfo.requestDate)}</span>
            </div>
            <div className="text-sm text-gray-500">
              Work Division: <span className="font-semibold text-gray-900">{requestInfo.workDivision}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="font-semibold text-gray-900 text-lg">Request Information</div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Request Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.requestCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, requestCategory: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                required
              >
                <option value="Purchase Request">Purchase Request</option>
                <option value="Purchase Order">Purchase Order</option>
                <option value="Memo">Memo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Related Budget <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.budgetId}
                onChange={(e) => handleBudgetChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                required
              >
                <option value="">Select Budget</option>
                {budgetPlans.map(budget => (
                  <option key={budget.id} value={budget.id}>
                    {budget.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Related Project
              </label>
              <input
                type="text"
                value={budgetPlans.find(b => b.id === formData.budgetId)?.project?.projectTitle || ''}
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                disabled
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Request Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value: string) => setFormData(prev => ({ ...prev, description: value }))}
            />
          </div>

          <h2 className="text-lg font-medium mt-6 mb-4">Item List</h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Qty</th>
                  <th className="text-left py-2">Unit</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Total Price</th>
                  <th className="text-left py-2">Vendor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{item.description}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border rounded"
                        min="1"
                        max={item.qty}
                      />
                    </td>
                    <td className="py-2">{item.unit}</td>
                    <td className="py-2 text-right">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseInt(e.target.value))}
                        className="w-32 px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="py-2 text-right">
                      {new Intl.NumberFormat('id-ID').format(item.qty * item.unitPrice)}
                    </td>
                    <td className="py-2">{item.vendor}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...selectedItems];
                          newItems.splice(index, 1);
                          setSelectedItems(newItems);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
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

          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>

          <hr className="my-6" />

          <div className="flex justify-end gap-3">
            <Link
              href="/workspace"
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
} 