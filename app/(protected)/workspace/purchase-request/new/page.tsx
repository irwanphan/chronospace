'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import { formatDate } from '@/lib/utils';
import AddStepModal from '@/components/AddStepModal';
import { Role } from '@/types/role';
import { User } from '@/types/user';
import { ApprovalSchema } from '@/types/approval-schema';
import { useSession } from 'next-auth/react';

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

interface ApprovalStepForm {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'NOTIFY' | 'AUTO_REJECT';
}

export default function NewRequestPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [selectedItems, setSelectedItems] = useState<BudgetItem[]>([]);
  const [availableItems, setAvailableItems] = useState<BudgetItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<{ data: ApprovalStepForm; index: number } | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [schemas, setSchemas] = useState<ApprovalSchema[]>([]);
  console.log(schemas)
  const [formData, setFormData] = useState({
    budgetId: '',
    projectId: '',
    title: '',
    description: '',
    items: [],
    steps: [] as ApprovalStepForm[],
  });

  const [requestInfo, setRequestInfo] = useState({
    id: '',
    requestDate: new Date(),
    requestor: '',
    role: ''
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
      requestor: session?.user?.name || '',
      role: session?.user?.role || ''
    });
  }, [session]);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
    fetchSchemas();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchSchemas = async () => {
    try {
      const response = await fetch('/api/approval-schemas');
      if (!response.ok) throw new Error('Failed to fetch schemas');
      const data = await response.json();
      setSchemas(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

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

  const addStep = (stepData: ApprovalStepForm) => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, stepData].sort((a, b) => {
        // Sort by budget limit, undefined limits go last
        if (a.budgetLimit === undefined) return 1;
        if (b.budgetLimit === undefined) return -1;
        return a.budgetLimit - b.budgetLimit;
      }),
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleEditStep = (index: number) => {
    const step = formData.steps[index];
    setEditingStep({
      data: {
        roleId: step.roleId,
        specificUserId: step.specificUserId,
        budgetLimit: step.budgetLimit,
        duration: step.duration,
        overtimeAction: step.overtimeAction,
      },
      index
    });
    setIsAddStepModalOpen(true);
  };

  const handleStepSubmit = (stepData: ApprovalStepForm) => {
    if (editingStep !== null) {
      // Edit existing step
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.map((step, i) => 
          i === editingStep.index ? stepData : step
        ).sort((a, b) => {
          // Sort by budget limit, undefined limits go last
          if (a.budgetLimit === undefined) return 1;
          if (b.budgetLimit === undefined) return -1;
          return a.budgetLimit - b.budgetLimit;
        })
      }));
      setEditingStep(null);
    } else {
      // Add new step
      addStep(stepData);
    }
    setIsAddStepModalOpen(false);
  };

  const handleSelectSchema = (schema: ApprovalSchema) => {
    setFormData(prev => ({
      ...prev,
      steps: schema.steps.map(step => ({
        roleId: step.role,
        duration: step.duration,
        overtimeAction: step.overtime
      }))
    }));
    setIsSchemaModalOpen(false);
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
      <h1 className="text-2xl font-semibold mb-4">New Purchase Request</h1>
      
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
              Requestor Role: <span className="font-semibold text-gray-900">{requestInfo.role}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Request Information</h2>

          <input type="hidden" name="requestCategory" value="Purchase Request" readOnly />

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

          <h2 className="text-lg font-medium">Approval Steps</h2>
            <div className="flex items-center justify-start gap-2">
              <button
                type="button"
                onClick={() => setIsAddStepModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
              <button
                type="button"
                onClick={() => setIsSchemaModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <ListChecks className="w-4 h-4" />
                Choose Approval Schema
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">#</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Specific User</th>
                    <th className="text-left py-3 px-4">Limit</th>
                    <th className="text-left py-3 px-4">Duration</th>
                    <th className="text-left py-3 px-4">Overtime</th>
                    <th className="text-left py-3 px-4 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.steps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No steps added yet
                      </td>
                    </tr>
                  ) : (
                    formData.steps.map((step, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">
                          {roles.find(r => r.id === step.roleId)?.roleName}
                        </td>
                        <td className="py-3 px-4">
                          {step.specificUserId 
                            ? users.find(u => u.id === step.specificUserId)?.name 
                            : 'Any user with role'}
                        </td>
                        <td className="py-3 px-4">
                          {step.budgetLimit ? new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(step.budgetLimit) : '-'}
                        </td>
                        <td className="py-3 px-4">{step.duration} days</td>
                        <td className="py-3 px-4">
                          {step.overtimeAction === 'NOTIFY' ? 'Notify and Wait' : 'Auto Reject'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditStep(index)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeStep(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <AddStepModal
              isOpen={isAddStepModalOpen}
              onClose={() => {
                setIsAddStepModalOpen(false);
                setEditingStep(null);
              }}
              onSubmit={handleStepSubmit}
              roles={roles}
              users={users}
              documentType={'Purchase Request'}
              editData={editingStep?.data}
              isEdit={editingStep !== null}
            />

          <hr className="my-6" />

        </div>
        {isSchemaModalOpen && (
          <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-0">
              <h2 className="text-lg font-medium mb-4">Select Approval Schema</h2>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {schemas.map(schema => (
                  <div 
                    key={schema.id}
                    onClick={() => handleSelectSchema(schema)}
                    className="p-4 border rounded-lg cursor-pointer group hover:bg-blue-600 hover:text-white hover:border-blue-700 transition-all duration-300"
                  >
                    <h3 className="font-medium">{schema.name}</h3>
                    <p className="text-sm text-gray-600 group-hover:text-white transition-all duration-300">{schema.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsSchemaModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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

      </form>
    </div>
  );
} 