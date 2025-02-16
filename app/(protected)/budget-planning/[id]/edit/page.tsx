'use client';
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Dialog } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';

interface FormData {
  projectId: string;
  title: string;
  year: string;
  division: string;
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

interface Vendor {
  id: string;
  vendorName: string;
}

export default function EditBudgetPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<BudgetItem[]>([]);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
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
    division: '',
    totalBudget: '',
    startDate: '',
    finishDate: '',
    description: '',
  });

  console.log(vendors);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetRes, vendorsRes] = await Promise.all([
          fetch(`/api/budgets/${params.id}`),
          fetch('/api/vendors')
        ]);

        if (!budgetRes.ok || !vendorsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [budgetData, vendorsData] = await Promise.all([
          budgetRes.json(),
          vendorsRes.json()
        ]);

        // Map vendor names to items
        const itemsWithVendorNames = budgetData.items.map((item: BudgetItem) => {
          const vendor = vendorsData.find((v: Vendor) => v.id === item.vendor);
          return {
            ...item,
            vendor: vendor ? vendor.vendorName : item.vendor // Use vendor name instead of ID
          };
        });

        setVendors(vendorsData);
        setSelectedItems(itemsWithVendorNames);
        setFormData({
          projectId: budgetData.projectId,
          title: budgetData.title,
          year: budgetData.year.toString(),
          division: budgetData.division,
          totalBudget: budgetData.totalBudget.toString(),
          startDate: new Date(budgetData.startDate).toISOString().split('T')[0],
          finishDate: new Date(budgetData.finishDate).toISOString().split('T')[0],
          description: budgetData.description || '',
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load budget data');
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
      toast.error("Please fill all item fields");
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
      const response = await fetch(`/api/budgets/${params.id}`, {
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

      if (!response.ok) {
        throw new Error('Failed to update budget');
      }

      toast.success('Budget updated successfully');
      router.push('/budget-planning');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Budget Plan</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6 border border-gray-200">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block mb-1.5">
              Project <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.projectId}
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
              value={formData.division}
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

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
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
      </Dialog>
    </div>
  );
} 