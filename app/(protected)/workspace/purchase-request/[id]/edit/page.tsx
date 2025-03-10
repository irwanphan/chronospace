'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import { formatDate, generateId } from '@/lib/utils';
import AddStepModal from '@/components/AddStepModal';
import { Role } from '@/types/role';
import { User } from '@/types/user';
import { ApprovalSchema } from '@/types/approval-schema';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Modal from '@/components/Modal';
import LoadingSpin from '@/components/ui/LoadingSpin';
import { PurchaseRequest } from '@prisma/client';
import { IconListCheck } from '@tabler/icons-react';

interface BudgetPlan {
  id: string;
  title: string;
  description: string;
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
  vendor: {
    vendorName: string;
  };
  isSubmitted?: boolean;
  purchaseRequestId?: string;
}

interface ApprovalStepForm {
  roleId: string;
  specificUserId?: string;
  limit?: number;
  duration: number;
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
}

export default function EditPurchaseRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest | null>(null);
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan | null>(null);
  const [selectedItems, setSelectedItems] = useState<BudgetItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<{ data: ApprovalStepForm; index: number } | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [schemas, setSchemas] = useState<ApprovalSchema[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    budgetId: '',
    projectId: '',
    title: '',
    createdBy: '',
    description: '',
    items: [] as BudgetItem[],
    steps: [] as ApprovalStepForm[],
  });

  // console.log('budgetPlan : ', budgetPlan);
  console.log('purchaseRequest : ', purchaseRequest);

  const [requestInfo, setRequestInfo] = useState({
    id: '',
    requestDate: new Date(),
    requestor: '',
    role: '',
    description: ''
  });

  // Hapus state yang tidak digunakan
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  useEffect(() => {
    setRequestInfo({
      id: generateId('PR'),
      requestDate: new Date(),
      requestor: session?.user?.name || '',
      role: session?.user?.role || '',
      description: ''
    });
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/workspace/purchase-requests/${params.id}/fetch-required-to-edit-request`);
        if (response.ok) {
          const data = await response.json();

          // console.log('data : ', data);
          setRoles(data.roles);
          setUsers(data.users);
          setSchemas(data.schemas);
          setPurchaseRequest(data.purchaseRequest);
          setBudgetPlan(data.purchaseRequest.budget);
          
          // Initialize selected items with existing items
          setSelectedItems(data.purchaseRequest.items.map((item: BudgetItem) => ({
            id: item.id,
            description: item.description,
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            vendor: {
              vendorName: item.vendor?.vendorName
            }
          })));

          setSelectedVendor(data.purchaseRequest.items[0].vendor.vendorName);

          setFormData({
            code: data.purchaseRequest.code,
            budgetId: data.purchaseRequest.budget.id,
            projectId: data.purchaseRequest.budget.projectId,
            title: data.purchaseRequest.title,
            createdBy: data.purchaseRequest.createdBy,
            description: data.purchaseRequest.description,
            items: data.purchaseRequest.items,
            steps: data.purchaseRequest.approvalSteps.map((step: ApprovalStepForm) => ({
              roleId: step.roleId,
              specificUserId: step.specificUserId,
              limit: step.limit,
              duration: step.duration,
              overtimeAction: step.overtimeAction
            }))
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Update project and items when budget is selected
  const handleBudgetChange = (budgetId: string) => {
    const selectedBudget = budgetPlan
    console.log('Selected budget:', selectedBudget);
    if (selectedBudget) {
      setFormData(prev => ({
        ...prev,
        budgetId,
        projectId: selectedBudget.projectId,
        title: selectedBudget.title,
        description: selectedBudget.description,
        createdBy: session?.user?.id || '',
      }));
    }
  };

  const addStep = (stepData: ApprovalStepForm) => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, stepData].sort((a, b) => {
        // Sort by budget limit, undefined limits go last
        if (a.limit === undefined) return 1;
        if (b.limit === undefined) return -1;
        return a.limit - b.limit;
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
        limit: step.limit,
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
          if (a.limit === undefined) return 1;
          if (b.limit === undefined) return -1;
          return a.limit - b.limit;
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
      steps: schema.approvalSteps.map(step => ({
        roleId: step.role,
        specificUserId: step.specificUserId,
        duration: step.duration,
        overtimeAction: step.overtimeAction,
        limit: step.limit
      }))
    }));
    setIsSchemaModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/workspace/purchase-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: selectedItems,
          code: requestInfo.id,
          createdBy: session?.user?.id || '',
          steps: formData.steps.map((step, index) => ({
            roleId: step.roleId,
            specificUserId: step.specificUserId,
            duration: step.duration,
            overtimeAction: step.overtimeAction,
            limit: step.limit,
            order: index + 1
          }))
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

  // Handler untuk membuka modal (disederhanakan)
  const handleOpenItemModal = () => {
    setIsItemModalOpen(true);
  };

  // Handler untuk toggle select/unselect item
  const handleToggleItem = (item: BudgetItem) => {
    if (item.isSubmitted) {
      toast.error(`Item already submitted in PR ${item.purchaseRequestId}`);
      return;
    }

    // Check if item is already selected by comparing description and vendor
    const isSelected = selectedItems.some(selectedItem => 
      selectedItem.description === item.description && 
      selectedItem.vendor.vendorName === item.vendor.vendorName
    );
    
    if (isSelected) {
      // Remove item by matching description and vendor
      setSelectedItems(prev => prev.filter(selectedItem => 
        !(selectedItem.description === item.description && 
          selectedItem.vendor.vendorName === item.vendor.vendorName)
      ));
      if (selectedItems.length === 1) {
        setSelectedVendor(null);
      }
    } else {
      if (selectedVendor && item.vendor.vendorName !== selectedVendor) {
        toast.error('Cannot select items from different vendors in one request');
        return;
      }
      setSelectedItems(prev => [...prev, item]);
      setSelectedVendor(item.vendor.vendorName);
    }
  };

  if (isLoading) {
    return <LoadingSpin />;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">New Purchase Request</h1>
      
      <div className="space-y-8">

        {/* Request Info Card */}
        <Card className="p-6 mb-8">
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
        </Card>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Request Information</h2>

              <input type="hidden" name="requestCategory" value="Purchase Request" readOnly />

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Related Budget <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.budgetId}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Related Project
                  </label>
                  <input
                    type="text"
                    value={budgetPlan?.project?.projectTitle || ''}
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
                    {selectedItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4 text-gray-500">
                          No items selected
                        </td>
                      </tr>
                    ) : (
                      selectedItems.map((item, index) => (
                        <tr key={item.id} className="border-b">
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
                          <td className="p-2">{item.vendor.vendorName}</td>
                          {/* <td className="p-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItems(selectedItems.filter(i => i.id !== item.id));
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={handleOpenItemModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <IconListCheck className="w-4 h-4" />
                Manage Item List
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
                  Add Approver
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
                            {roles?.find(r => r.id === step.roleId)?.roleName || 'Unknown Role'}
                          </td>
                          <td className="py-3 px-4">
                            {step.specificUserId 
                              ? users?.find(u => u.id === step.specificUserId)?.name || 'Unknown User'
                              : 'Any user with role'}
                          </td>
                          <td className="py-3 px-4">
                            {step.limit ? new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(step.limit) : '-'}
                          </td>
                          <td className="py-3 px-4">{step.duration} days</td>
                          <td className="py-3 px-4">
                            {step.overtimeAction === 'Notify and Wait' ? 'Notify and Wait' : 'Auto Decline'}
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
            </div>

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

          </form>
        </Card>
      </div>

      <Modal 
        isOpen={isSchemaModalOpen} 
        onClose={() => setIsSchemaModalOpen(false)}
        title="Select Approval Schema"
        maxWidth="2xl"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {schemas?.map(schema => (
            <div 
              key={schema.id}
              onClick={() => handleSelectSchema(schema)}
              className="p-4 border rounded-lg cursor-pointer group hover:bg-blue-600 hover:text-white hover:border-blue-700 transition-all duration-300"
            >
              <h3 className="font-medium">{schema.name}</h3>
              <p className="text-sm text-gray-600 group-hover:text-white transition-all duration-300">
                {schema.description}
              </p>
              <div className="flex flex-col items-start pt-2">
                {schema.approvalSteps?.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 text-xs text-gray-600 group-hover:text-white transition-all duration-300">
                    <span className="font-medium">Step {index + 1}:</span>
                    <span className="font-medium">
                      {roles.find(r => r.id === step.role)?.roleName}
                    </span>
                    {step.limit && (
                      <span>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(step.limit)}
                      </span>
                    )}
                    <span>{step.duration}d</span>
                    <span>{step.overtimeAction === 'Notify and Wait' ? 'Notify and Wait' : 'Auto Decline'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

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

      <Modal 
        isOpen={isItemModalOpen} 
        onClose={() => setIsItemModalOpen(false)}
        title="Select Budget Items"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* <h3 className="text-lg font-medium">Select Budget Items</h3> */}
          
          {formData.budgetId && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Qty</th>
                    <th className="text-left p-2">Unit</th>
                    <th className="text-right p-2">Unit Price</th>
                    <th className="text-left p-2">Vendor</th>
                    <th className="text-center p-2">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetPlan?.items.map((item) => {
                    const isSelected = selectedItems.some(selectedItem => 
                      selectedItem.description === item.description && 
                      selectedItem.vendor.vendorName === item.vendor.vendorName
                    );
                    const isDisabled: boolean = Boolean(selectedVendor && item.vendor.vendorName !== selectedVendor);

                    return (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{item.description}</td>
                        <td className="p-2">{item.qty}</td>
                        <td className="p-2">{item.unit}</td>
                        <td className="p-2 text-right">
                          {new Intl.NumberFormat('id-ID').format(item.unitPrice)}
                        </td>
                        <td className="p-2">{item.vendor.vendorName}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleItem(item)}
                            disabled={isDisabled}
                            className={`px-2 py-1 rounded ${
                              isSelected 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : isDisabled
                                  ? 'bg-gray-300 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 