'use client';

import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ListChecks, Pencil, Plus, Trash } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Card from '@/components/ui/Card';
import LoadingSpin from '@/components/ui/LoadingSpin';
import AddStepModal from '@/components/AddStepModal';
import { Modal } from '@/components/ui/Modal';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Role } from '@/types/role';
import { User } from '@/types/user';
import { ApprovalSchema, ApprovalStep } from '@/types/approvalSchema';
import { IconListCheck } from '@tabler/icons-react';

interface FormData {
  code: string;
  budgetId: string;
  projectId: string;
  title: string;
  description: string;
  createdBy: string;
  // items: BudgetItem[];
  itemsIdReference: string[];
  steps: ApprovalStepForm[];
}

interface ApprovalStepForm {
  roleId: string;
  specificUserId?: string;
  budgetLimit?: number;
  duration: number;
  overtimeAction: 'Notify and Wait' | 'Auto Decline';
}

interface BudgetItem {
  id: string;
  budgetItemId: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  vendor: {
    vendorName: string;
    vendorId: string;
  };
  isSubmitted?: boolean;
  purchaseRequestId?: string;
  budgetItem: {
    id: string;
  }
}

interface PurchaseRequest {
  id: string;
  code: string;
  budget: {
    id: string; 
    title: string;
    projectId: string;
    project: {
      title: string;
    };
  };  
  title: string;
  description: string;
  createdBy: string;
  items: BudgetItem[];
  approvalSteps: ApprovalStep[];
}

export default function EditRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    code: '',
    budgetId: '',
    projectId: '',
    title: '',
    description: '',
    createdBy: '',
    itemsIdReference: [],
    // items: [],
    steps: []
  });
  const [headerInfo, setHeaderInfo] = useState({
    code: '',
    role: '',
    createdBy: '',
    createdAt: ''
  });
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [schemas, setSchemas] = useState<ApprovalSchema[]>([]);
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<{ index: number; data: ApprovalStepForm } | null>(null);

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<BudgetItem[]>([]);
  const [availableItems, setAvailableItems] = useState<BudgetItem[]>([]);
  // console.log('selectedVendor', selectedVendor);
  // console.log('selectedItems', selectedItems);
  // console.log('availableItems', availableItems);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/workspace/purchase-requests/${params.id}/fetch-required-to-edit-request`);
        if (response.ok) {
          const data = await response.json();
          setPurchaseRequest(data.purchaseRequest);
          setRoles(data.roles);
          setUsers(data.users);
          setSchemas(data.schemas);
          setHeaderInfo({
            code: data.purchaseRequest.code,
            role: data.purchaseRequest.user.userRoles[0].role.roleName,
            createdBy: data.purchaseRequest.user.name,
            createdAt: data.purchaseRequest.createdAt
          });
          
          setFormData({
            code: data.purchaseRequest.code,
            budgetId: data.purchaseRequest.budget.id,
            projectId: data.purchaseRequest.budget.projectId,
            title: data.purchaseRequest.title,
            createdBy: data.purchaseRequest.createdBy,
            description: data.purchaseRequest.description,
            itemsIdReference: data.purchaseRequest.items.map((item: BudgetItem) => item.id),
            steps: data.purchaseRequest.approvalSteps.map((step: ApprovalStep) => ({
              roleId: step.roleId,
              specificUserId: step.specificUserId,
              budgetLimit: step.budgetLimit,
              duration: step.duration,
              overtimeAction: step.overtimeAction
            }))
          });
          // initialize selectedItems and availableItems
          setSelectedItems(data.purchaseRequest.items);
          setAvailableItems(data.availableItems);

          // initialize selectedVendor if there are items
          if (data.purchaseRequest.items.length > 0) {
            setSelectedVendor(data.purchaseRequest.items[0].vendor.vendorName);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleStepSubmit = (stepData: ApprovalStepForm) => {
    if (editingStep !== null) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.map((step, i) => 
          i === editingStep.index ? stepData : step
        )
      }));
      setEditingStep(null);
    } else {
      setFormData(prev => ({
        ...prev,
        steps: [...prev.steps, stepData]
      }));
    }
    setIsAddStepModalOpen(false);
  };

  const handleEditStep = (index: number) => {
    setEditingStep({ index, data: formData.steps[index] });
    setIsAddStepModalOpen(true);
  };

  const handleDeleteStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleSelectSchema = (schema: ApprovalSchema) => {
    setFormData(prev => ({
      ...prev,
      steps: schema.approvalSteps.map(step => ({
        roleId: step.roleId,
        specificUserId: step.specificUserId,
        duration: step.duration,
        overtimeAction: step.overtimeAction,
        budgetLimit: step.budgetLimit,
        role: step.role,
        specificUser: step.specificUser,
      }))
    }));
    setIsSchemaModalOpen(false);
  };

  // Handler untuk toggle select/unselect item
  const handleToggleItem = (item: BudgetItem) => {
    if (item.isSubmitted) {
      setError(`Item already submitted in PR ${item.purchaseRequestId}`);
      return;
    }

    const isSelected = selectedItems.some(selectedItem => 
      selectedItem.description === item.description && 
      selectedItem.vendor.vendorName === item.vendor.vendorName
    );
    
    if (isSelected) {
      setSelectedItems(prev => {
        const newItems = prev.filter(selectedItem => 
          !(selectedItem.description === item.description && 
            selectedItem.vendor.vendorName === item.vendor.vendorName)
        );
        
        // Reset selectedVendor jika tidak ada item yang dipilih
        if (newItems.length === 0) {
          setSelectedVendor(null);
        }

        // update formData itemsIdReference
        setFormData(prevForm => ({
          ...prevForm,
          itemsIdReference: newItems.map(item => item.budgetItemId || item.id)
        }));
        return newItems;
      });
    } else {
      setSelectedItems(prev => {
        const newItems = [...prev, {
          ...item,
          budgetItemId: item.id
        }];
        setFormData(prevForm => ({
          ...prevForm,
          itemsIdReference: newItems.map(item => item.budgetItemId || item.id)
        }));
        return newItems;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // console.log('formData', formData);

    try {
      const response = await fetch(`/api/workspace/purchase-requests/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update request');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to update request');
    } finally {
      router.push(`/workspace/purchase-request/${params.id}`);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpin />;

  return (
    <div>
      <div className="space-y-8 max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4">Edit Purchase Request</h1>

        {error && <div className="bg-red-500 text-white p-4 rounded-lg">{error}</div>}

        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500">
                PR Code: <span className="font-semibold text-gray-900">{headerInfo.code}</span>
              </div>
              <div className="text-sm text-gray-500">
                Requestor: <span className="font-semibold text-gray-900">{headerInfo.createdBy}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500">
                Request Date: <span className="font-semibold text-gray-900">
                  {headerInfo.createdAt ? formatDate(new Date(headerInfo.createdAt)) : '-'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Requestor Role: <span className="font-semibold text-gray-900">{headerInfo.role}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Request Information</h2>

              <input type="hidden" name="requestCategory" value="Purchase Request" readOnly />
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Related Budget <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="hidden"
                    value={purchaseRequest?.budget?.id || ''}
                    readOnly
                  />
                  <input
                    type="text"
                    value={purchaseRequest?.budget?.title || ''}
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Related Project
                  </label>
                  <input
                    type="text"
                    value={purchaseRequest?.budget?.project?.title || ''}
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">Unit</th>
                      <th className="text-right p-2">Unit Price</th>
                      <th className="text-right p-2">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">{item.description}</td>
                        <td className="p-2">{item.qty}</td>
                        <td className="p-2">{item.unit}</td>
                        <td className="p-2 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(item.qty * item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => setIsItemModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <IconListCheck className="w-4 h-4" />
                Manage Item List
              </button>

              <h2 className="text-lg font-medium mt-6">Approval Steps</h2>
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStepModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />Add Reviewer
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
                      <th className="text-left py-3 px-4">Budget Limit</th>
                      <th className="text-left py-3 px-4">Duration</th>
                      <th className="text-left py-3 px-4">Overtime Action</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.steps.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-gray-500">
                          No steps added yet
                        </td>
                      </tr>
                    ) : (
                      formData.steps.map((step, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{index + 1}</td>
                          <td className="py-3 px-4">
                            {roles.find((r: Role) => r.id === step.roleId)?.roleName}
                          </td>
                          <td className="py-3 px-4">
                            {step.specificUserId ? 
                              users.find((u: User) => u.id === step.specificUserId)?.name : 
                              'Any user with role'}
                          </td>
                          <td className="py-3 px-4">
                            {step.budgetLimit ? formatCurrency(step.budgetLimit) : '-'}
                          </td>
                          <td className="py-3 px-4">{step.duration} days</td>
                          <td className="py-3 px-4">{step.overtimeAction}</td>
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
                                onClick={() => handleDeleteStep(index)}
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

            <div className="flex justify-end gap-2">
              <Link
                href={`/workspace/purchase-request/${params.id}`}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />Back
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isSubmitting ? 'Updating...' : 'Update Request'}
              </button>
            </div>
          </form>
        </Card>
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

      <Modal 
        isOpen={isSchemaModalOpen} 
        onClose={() => setIsSchemaModalOpen(false)}
        title="Select Approval Schema"
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
                      {roles.find(r => r.id === step.roleId)?.roleName}
                    </span>
                    {step.budgetLimit && (
                      <span>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(step.budgetLimit)}
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

      <Modal 
        isOpen={isItemModalOpen} 
        onClose={() => setIsItemModalOpen(false)}
        title="Select Budget Items"
      >
        <div className="space-y-6 max-w-4xl overflow-y-auto">
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
                  {availableItems.map((item: BudgetItem) => {
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