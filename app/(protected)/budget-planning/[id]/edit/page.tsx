'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Vendor } from '@/types/vendor';
import LoadingSpin from '@/components/ui/LoadingSpin';
import Card from '@/components/ui/Card';
import Modal from '@/components/Modal';

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
  vendor: string;
}

export default function EditBudgetPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<BudgetItem[]>([]);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [workDivisionTitle, setWorkDivisionTitle] = useState<string>("");
  const [error, setError] = useState<string>('');
  const [newItem, setNewItem] = useState<BudgetItem>({
    description: '',
    qty: 0,
    unit: '',
    unitPrice: 0,
    vendor: ''
  });
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

        // Map vendor names to items
        const itemsWithVendorNames = data.items.map((item: BudgetItem) => {
          const vendor = data.vendors.find((v: Vendor) => v.id === item.vendor);
          return {
            ...item,
            vendor: vendor ? vendor.vendorName : item.vendor
          };
        });

        setVendors(data.vendors);
        setProjectName(data.project.projectTitle);
        setWorkDivisionTitle(data.workDivision.divisionName);
        setSelectedItems(itemsWithVendorNames);
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

  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty || !newItem.unit || !newItem.unitPrice || !newItem.vendor) {
      setError("Please fill all item fields");
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

    try {
      const response = await fetch(`/api/budget-planning/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: selectedItems,
          totalBudget: selectedItems.reduce((total, item) => total + (item.qty * item.unitPrice), 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update budget');
        return;
      }

      router.push('/budget-planning');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update budget');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-1.5">
                Project <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block mb-1.5">
                Division <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={workDivisionTitle}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
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

          <div>
            <label className="block mb-1.5">Description</label>
            <RichTextEditor
              value={formData.description || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
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
                    <td className="p-2 text-right">{new Intl.NumberFormat('id-ID').format(item.unitPrice)}</td>
                    <td className="p-2 text-right">{new Intl.NumberFormat('id-ID').format(item.qty * item.unitPrice)}</td>
                    <td className="p-2">{item.vendor}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItems(selectedItems.filter((_, i) => i !== index));
                        }}
                        className="text-red-500 hover:text-red-700"
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Card>

      <Modal 
        isOpen={isAddItemOpen} 
        onClose={() => setIsAddItemOpen(false)}
        title="Add Budget Item"
      >
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-medium">Add New Item</h3>
        
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
        </div>
      </Modal>
    </div>
  );
} 