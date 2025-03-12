'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Plus, X } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Project } from '@/types/project';
import { Vendor } from '@/types/vendor';
import Card from '@/components/ui/Card';
import Modal from '@/components/Modal';
import { formatDate, generateId } from '@/lib/utils';
import LoadingSpin from '@/components/ui/LoadingSpin';

interface FormData {
  projectId: string;
  code: string;
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
  vendor: string;
}

export default function NewBudgetPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<BudgetItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    projectId: '',
    code: '',
    title: '',
    year: new Date().getFullYear().toString(),
    workDivisionId: '',
    totalBudget: '',
    startDate: '',
    finishDate: '',
    description: '',
  });
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState<BudgetItem>({
    description: '',
    qty: 0,
    unit: '',
    unitPrice: 0,
    vendor: ''
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedWorkDivision, setSelectedWorkDivision] = useState<string>('');
  const [budgetCode, setBudgetCode] = useState<string>('');
  const [requestDate, setRequestDate] = useState<string>('');
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/budget-planning/fetch-required-to-create-budget');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        setVendors(data.vendors || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch available projects');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const prefix = 'BUD';
    setBudgetCode(generateId(prefix));
    setRequestDate(formatDate(new Date()));
  }, []);

  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    setFormData(prev => ({
      ...prev,
      totalBudget: total.toString()
    }));
  }, [selectedItems]);

  const handleAddItem = () => {
    if (!newItem.description) {
      setError("Please enter item description");
      return;
    }
    if (!newItem.qty || newItem.qty <= 0) {
      setError("Please enter valid quantity");
      return;
    }
    if (!newItem.unit) {
      setError("Please enter unit");
      return;
    }
    if (!newItem.unitPrice || newItem.unitPrice <= 0) {
      setError("Please enter valid unit price");
      return;
    }
    if (!newItem.vendor) {
      setError("Please select vendor");
      return;
    }

    setSelectedItems([...selectedItems, newItem]);
    setNewItem({
      description: '',
      qty: 0,
      unit: '',
      unitPrice: 0,
      vendor: ''
    });
    setIsAddItemOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validasi form
    if (!formData.workDivisionId) {
      setError("Division is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const requestBody = {
        projectId: formData.projectId,
        code: budgetCode,
        title: formData.title,
        description: formData.description || '',
        year: parseInt(formData.year),
        workDivisionId: formData.workDivisionId,
        totalBudget: selectedItems.reduce((total, item) => total + (item.qty * item.unitPrice), 0),
        startDate: new Date(formData.startDate).toISOString(),
        finishDate: new Date(formData.finishDate).toISOString(),
        status: "Draft",
        items: selectedItems.map(item => ({
          description: item.description,
          qty: item.qty,
          unit: item.unit,
          unitPrice: item.unitPrice,
          vendor: item.vendor
        }))
      };

      const response = await fetch('/api/budget-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create budget');
      }

      router.push('/budget-planning');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects.find(p => p.id === projectId);
    if (selectedProject) {
      // console.log('Selected project dates:', {
      //   start: selectedProject.startDate,
      //   finish: selectedProject.finishDate
      // });

      // Format dates properly
      const formattedStartDate = selectedProject.startDate ? 
        new Date(selectedProject.startDate).toISOString().split('T')[0] : '';
      const formattedFinishDate = selectedProject.finishDate ? 
        new Date(selectedProject.finishDate).toISOString().split('T')[0] : '';

      // console.log('Formatted dates:', {
      //   start: formattedStartDate,
      //   finish: formattedFinishDate
      // });

      setSelectedWorkDivision(selectedProject.workDivision.name);
      setFormData(prev => ({
        ...prev,
        projectId,
        workDivisionId: selectedProject.workDivision.id,
        title: selectedProject.projectTitle,
        description: selectedProject.description || '',
        startDate: formattedStartDate,
        finishDate: formattedFinishDate
      }));
    }
  };

  if (isLoading) return <LoadingSpin />

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold mb-6">New Budget Plan</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <Card>
          <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
            <div>Budget Code: {budgetCode}</div>
            <div>Request Date: {requestDate}</div>
          </div>
        </Card>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-1.5">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectTitle}
                    </option>
                  ))}
                </select>
                {projects.length > 0 && projects.filter(p => p.status !== 'ALLOCATED').length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    All projects have been allocated with budgets
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1.5">
                  Work Division <span className="text-red-500">*</span>
                </label>
                <input type="hidden" name="workDivisionId" value={formData.workDivisionId} readOnly />
                <input type="text" name="workDivisionId-show" disabled value={selectedWorkDivision} 
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50"
                />
              </div>

              <div>
                <label className="block mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5">
                  Finish Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.finishDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, finishDate: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              
            </div>

            <div className="mb-20">
              <label className="block mb-1.5">Description</label>
              <RichTextEditor
                value={formData.description || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Enter description..."
              />
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
                      <td className="p-2 text-right">
                        {new Intl.NumberFormat('id-ID').format(item.unitPrice)}
                      </td>
                      <td className="p-2 text-right">
                        {new Intl.NumberFormat('id-ID').format(item.qty * item.unitPrice)}
                      </td>
                      <td className="p-2">{vendors.find(v => v.id === item.vendor)?.vendorName}</td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = [...selectedItems];
                            newItems.splice(index, 1);
                            setSelectedItems(newItems);
                          }}
                          className="text-red-600 hover:text-red-700 flex align-center"
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
              onClick={() => setIsAddItemOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>

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

            <hr className="my-6" />

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Link
                href="/budget-planning"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </Card>
      </div>

      <Modal 
        isOpen={isAddItemOpen} 
        onClose={() => setIsAddItemOpen(false)}
        title="Add Budget Item"
      >
        <form onSubmit={handleAddItem}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5">Description</label>
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5">Qty</label>
                <input
                  type="number"
                  value={newItem.qty}
                  onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-1.5">Unit</label>
                <input
                  type="text"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5">Unit Price</label>
              <input
                type="number"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-1.5">Vendor</label>
              <select
                value={newItem.vendor}
                onChange={(e) => setNewItem({ ...newItem, vendor: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg bg-white"
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendorName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAddItemOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
} 